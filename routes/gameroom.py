
gameroom = {} #user to gameobject
games = {} # gameid to gameobject
gameid = 0

from app import app
from flask import redirect, render_template, request, session
import time
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from game import Game
import json
from datetime import datetime, timedelta
from db import select_from_where_is
import bitboard


def update_present_games():
    #Pelit:
    to_be_removed = []  
    for gameid in games:
        game = games[gameid]
        print("White: " + game.white)
        print("Black: " + game.black)
        print(game.state)
        game.update_game_data()
        for player in game.get_inactive_players():
            if player in gameroom and gameroom[player] == game:
                del gameroom[player]
        if not game.has_active_players():
            to_be_removed.append(game)
    for game in to_be_removed:
        del games[game.gameid]
        

scheduler = BackgroundScheduler()
scheduler.add_job(func=update_present_games, trigger="interval", seconds=1)
scheduler.start()

# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())

@app.route("/startgame/<int:id>")
def startgame(id):
    game = games[id]
    #TODO Tietokannasta ei tulisi tietää mitään tällä tasolla
    #TODO check if game is None?
    rating_white = int(select_from_where_is("rating", "users", "username", game.white))
    rating_black = int(select_from_where_is("rating", "users", "username", game.black))
    return render_template("pelisivu.html", white=game.white, rating_white=rating_white, black=game.black, rating_black=rating_black)

@app.route("/gamerequest")
def gamerequest():
    if session["username"] not in gameroom:
        return "username not in gameroom"
    game = gameroom[session["username"]]
    game.report_activity(session["username"])
    if game.state == "kesken":
        game.update_game_times()
    vuoro = "no"
    if game.turn == session["username"]:
        vuoro = "yes"
    color = "black"
    if game.white == session["username"]:
        color = "white"
    viestit = []
    lahettajat = []
    if session["username"] in game.playermessages:
        for ind in game.playermessages[session["username"]]:
            viestit.append(game.chat[ind])
            lahettajat.append(game.chatsenders[ind])
        game.playermessages[session["username"]] = []
    vastaus = {
        "positionwhite" : str(game.positions[-1][0]),
        "positionblack" : str(game.positions[-1][1]),
        "yourturn" : vuoro,
        "color" : color,
        "gamestate" : game.state,
        "lastkaanto" : game.lastkaanto,
        "movenumber" : game.movenumber,
        "whitetime" : game.whiteTime.seconds,
        "blacktime" : game.blackTime.seconds,
        "viestit" : viestit,
        "lahettajat" : lahettajat,
        "white_new_rating" : int(game.white_new_rating),
        "black_new_rating" : int(game.black_new_rating),
        "white" : game.white,
        "black" : game.black
    }
    return json.dumps(vastaus)

@app.route("/makemove",methods=["POST"])
def makemove():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    if game.state != "kesken":
        return "Peli on jo päättynyt"
    game.update_game_data()
    if game.state != "kesken":
        return "Peli on jo päättynyt"
    #TODO Mitä jos juuri äskeittäin hävinnyt ajalla? Pitää uudestaan tarkistaa onko peli kesken, ennen kuin siirto tehdään?
    movex = int(request.form["movex"])
    movey = int(request.form["movey"])
    movekaanto = request.form["movekaanto"]
    #TODO tarkista onko siirto kelvollinen
    bitboard.tulosta(game.positions[-1])
    print(movex, movey, movekaanto)
    game.process_new_move(movex, movey, movekaanto)
    bitboard.tulosta(game.positions[-1])
    return "success"

@app.route("/resignrequest",methods=["POST"])
def resignrequest():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    game.resign(session["username"])
    update_present_games() #varmista, että pelaaja välittömästi poistetaa gameroom-rakenteesta
    return "success"

@app.route("/sendgamemessage",methods=["POST"])
def sendgamemessage():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    viesti = request.form["message"]
    game.send_message(viesti, session["username"])
    return "success"
