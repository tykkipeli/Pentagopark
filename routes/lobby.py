from app import app, games, gameroom, gameid
from flask import redirect, render_template, request, session
import time
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from game import Game
import json
from datetime import datetime, timedelta
from random import randint

players = {} # aika jolloin viimeksi aulassa
challenges = {} #avain haastaja, arvo haastettava
challenges2 = {} #avain haastettava, arvo haastaja
aulachat = [""]*1000
aulachatsender = [""]*1000
playermessages = {}
messageindex = 0


def update_present_users():
    now = datetime.now()
    #Aula:
    to_be_removed = []
    for player in players:
        ero = now - players[player]
        if ero.seconds >= 1:
            to_be_removed.append(player)
    for player in to_be_removed:
        if player in challenges:
            del challenges2[challenges[player]]
            del challenges[player]
        if player in challenges2:
            del challenges[challenges2[player]]
            del challenges2[player]
        del players[player]
        if player in playermessages:
            del playermessages[player]
        

scheduler = BackgroundScheduler()
scheduler.add_job(func=update_present_users, trigger="interval", seconds=1)
scheduler.start()

# Shut down the scheduler when exiting the app
atexit.register(lambda: scheduler.shutdown())

def players_without(name):
    lista = []
    for player in players:
        if player != name:
            lista.append(player)
    return lista

@app.route("/play")
def play():
    return render_template("aulasivu.html", players=players_without(session["username"]))

@app.route("/startgame")
def startgame():
    return render_template("pelisivu.html")

@app.route("/present")
def present():
    players[session["username"]] = datetime.now()
    haastettava = ""
    roomid = ""
    if session["username"] in gameroom:
        roomid = gameroom[session["username"]].gameid
    if session["username"] in challenges:
        haastettava = challenges[session["username"]]
    haastaja = ""
    if session["username"] in challenges2:
        haastaja = challenges2[session["username"]]
    viestit = []
    lahettajat = []
    if session["username"] in playermessages:
        for ind in playermessages[session["username"]]:
            viestit.append(aulachat[ind])
            lahettajat.append(aulachatsender[ind])
        playermessages[session["username"]] = []
    vastaus = {
        "haastaja" : haastaja,
        "haastettava" : haastettava,
        "roomid" : roomid,
        "pelaajat" : players_without(session["username"]),
        "viestit" : viestit,
        "lahettajat" : lahettajat
    }
    return json.dumps(vastaus)

@app.route("/challenge",methods=["POST"])
def challenge():
    name = request.form["name"]
    if name not in players:
        return name + " ei ole enään peliaulassa"
    if name in challenges:
        return name + " haastaa parhaillaan toista pelaajaa"
    if name in challenges2:
        return "Joku toinen pelaaja haastaa jo pelaajaa " + name
    if session["username"] in challenges:
        return "Haastat jo lähettänyt jollekin pelaajalle haasteen"
    if session["username"] in challenges2:
        return "Joku toinen pelaaja haastaa jo sinua"
    challenges[session["username"]] = name
    challenges2[name] = session["username"]
    return "success"

@app.route("/cancelchallenge",methods=["POST"])
def cancelchallenge():
    if session["username"] in challenges:
        del challenges2[challenges[session["username"]]]
        del challenges[session["username"]]
    return "success"

@app.route("/rejectchallenge",methods=["POST"])
def rejectchallenge():
    if session["username"] in challenges2:
        del challenges[challenges2[session["username"]]]
        del challenges2[session["username"]]
    return "success"

@app.route("/acceptchallenge",methods=["POST"])
def acceptchallenge():
    if session["username"] in challenges2:
        global gameid
        gameid += 1
        
        white = session["username"]
        black = challenges2[session["username"]]
        if randint(1,2) == 1:
            white, black = black, white
        games[gameid] = Game(white, black, gameid)
        gameroom[session["username"]] = games[gameid]
        gameroom[challenges2[session["username"]]] = games[gameid]
        del challenges[challenges2[session["username"]]]
        del challenges2[session["username"]]
        return "success"
    return "fail"
