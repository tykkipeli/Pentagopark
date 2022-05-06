from flask import Flask
from flask import redirect, render_template, request, session
from os import getenv
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

gameroom = {} #user to gameobject
games = {} # gameid to gameobject
gameid = 0

import routes.authentication
import routes.lobby

import json
from datetime import datetime
from datetime import timedelta
from random import randint
import bitboard
from game import Game
import userDAO
import gameDAO

import time
import atexit
from apscheduler.schedulers.background import BackgroundScheduler

app.secret_key = getenv("SECRET_KEY")


def update_present_games():
    #Pelit:
    to_be_removed = []  
    for gameid in games:
        game = games[gameid]
        print("White: " + game.white)
        print("Black: " + game.black)
        print(game.state)
        game.update_game_times()
        game.update_gamestate()
        for player in game.get_inactive_players():
            if player in gameroom and gameroom[player] == game:
                del gameroom[player]
        if not game.has_active_players():
            to_be_removed.append(game)
    for game in to_be_removed:
        del games[game.gameid]
    #print(list(players))
        

scheduler = BackgroundScheduler()
scheduler.add_job(func=update_present_games, trigger="interval", seconds=1)
scheduler.start()

# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())

@app.route("/")
def index():
    return render_template("etusivu.html")


@app.route("/gamerequest")
def gamerequest():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    #print(game)
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
        "lahettajat" : lahettajat
    }
    return json.dumps(vastaus)

@app.route("/makemove",methods=["POST"])
def makemove():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    if game.state != "kesken":
        return "Peli on jo päättynyt"
    game.update_game_times()
    game.update_gamestate()
    if game.state != "kesken":
        return "Peli on jo päättynyt"
    #TODO Mitä jos juuri äskeittäin hävinnyt ajalla? Pitää uudestaan tarkistaa onko peli kesken, ennen kuin siirto tehdään?
    movex = int(request.form["movex"])
    movey = int(request.form["movey"])
    movekaanto = request.form["movekaanto"]
    #print("Saatiin siirto " + str(movex) + " " + str(movey) + " " + movekaanto)
    #TODO tarkista onko siirto kelvollinen
    vuoro = 0
    if game.turn == game.black:
        vuoro = 1
    #print(game.positions[-1])
    board = bitboard.tee_siirto_ja_kaanto(movex,movey, movekaanto, game.positions[-1], vuoro)
    #print(board)
    if game.turn == game.white:
        game.turn = game.black
    else:
        game.turn = game.white
    game.positions.append(board)
    game.state = bitboard.get_result(board)
    game.lastkaanto = movekaanto
    game.movenumber += 1;
    if game.state != "kesken":
        gameDAO.save_game(game)
        pass
    bitboard.tulosta(board)
    return "success"

@app.route("/resignrequest",methods=["POST"])
def resignrequest():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    game.resign(session["username"])
    update_present_games() #varmista, että pelaaja välittömästi poistetaa gameroom-rakenteesta
    return "success"

@app.route("/sendlobbymessage",methods=["POST"])
def sendlobbymessage():
    global messageindex
    viesti = request.form["message"]
    for i in range(10):
        print("Saatiin viesti " + viesti)
    aulachat[messageindex] = viesti
    aulachatsender[messageindex] = session["username"]
    player = session["username"]
    for player in players:
        if not player in playermessages:
            playermessages[player] = []
        playermessages[player].append(messageindex)
    messageindex += 1
    messageindex %= 1000
    return "success"

@app.route("/sendgamemessage",methods=["POST"])
def sendgamemessage():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    viesti = request.form["message"]
    game.send_message(viesti, session["username"])
    return "success"

if __name__ == '__main__':
    pass
