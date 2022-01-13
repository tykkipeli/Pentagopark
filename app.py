from flask import Flask
from flask import redirect, render_template, request, session
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from werkzeug.security import check_password_hash, generate_password_hash

import json
from datetime import datetime
from random import randint
import bitboard

import time
import atexit

from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
app.secret_key = getenv("SECRET_KEY")

class Game:
  def __init__(self, white, black):
    self.white = white
    self.black = black
    self.turn = white
    self.positions = [(0,0)]
    



players = {}
challenges = {} #avain haastaja, arvo haastettava
challenges2 = {} #avain haastettava, arvo haastaja
gameroom = {}
games = {}
gameid = 0


def update_present_users():
    now = datetime.now()
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
    print(list(players))
        

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

@app.route("/")
def index():
    return render_template("etusivu.html")

@app.route("/loginpage")
def loginpage():
    print("Loginpage kutsuttu")
    return render_template("login.html")

@app.route("/play")
def play():
    return render_template("aulasivu.html", players=players_without(session["username"]))

@app.route("/startgame")
def startgame():
    return render_template("pelisivu.html")

@app.route("/login",methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    # TODO: check username and password
    session["username"] = username
    return redirect("/")

@app.route("/logout")
def logout():
    del session["username"]
    return redirect("/")

@app.route("/present")
def present():
    print("Paikalla ollaan! " + session["username"])
    players[session["username"]] = datetime.now()
    haastettava = ""
    roomid = ""
    if session["username"] in gameroom:
        roomid = gameroom[session["username"]]
    if session["username"] in challenges:
        haastettava = challenges[session["username"]]
    haastaja = ""
    if session["username"] in challenges2:
        haastaja = challenges2[session["username"]]
    vastaus = {
        "haastaja" : haastaja,
        "haastettava" : haastettava,
        "roomid" : roomid,
        "pelaajat" : players_without(session["username"])
    }
    return json.dumps(vastaus)

@app.route("/challenge",methods=["POST"])
def challenge():
    name = request.form["name"]
    print("Haaste pelaajalta " + session["username"] + " pelaajalle " + name)
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
        gameroom[session["username"]] = gameid
        gameroom[challenges2[session["username"]]] = gameid
        white = session["username"]
        black = challenges2[session["username"]]
        if randint(1,2) == 1:
            white, black = black, white
        games[gameid] = Game(white, black)
        del challenges[challenges2[session["username"]]]
        del challenges2[session["username"]]
    return "fail"

@app.route("/gamerequest")
def gamerequest():
    if session["username"] not in gameroom:
        return "fail"
    gameid = gameroom[session["username"]]
    game = games[gameid]
    vuoro = "no"
    if game.turn == session["username"]:
        vuoro = "yes"
    vastaus = {
        "positionwhite" : str(game.positions[-1][0]),
        "positionblack" : str(game.positions[-1][1]),
        "yourturn" : vuoro
    }
    return json.dumps(vastaus)

@app.route("/makemove",methods=["POST"])
def makemove():
    movex = int(request.form["movex"])
    movey = int(request.form["movey"])
    movekaanto = request.form["movekaanto"]
    print("Saatiin siirto " + str(movex) + " " + str(movey) + " " + movekaanto)
    #TODO tarkista onko siirto kelvollinen
    gameid = gameroom[session["username"]]
    game = games[gameid]
    vuoro = 0
    if game.turn == game.black:
        vuoro = 1
    print(game.positions[-1])
    board = bitboard.tee_siirto_ja_kaanto(movex,movey, movekaanto, game.positions[-1], vuoro)
    print(board)
    if game.turn == game.white:
        game.turn = game.black
    else:
        game.turn = game.white
    game.positions.append(board)
    bitboard.tulosta(board)
    return "success"

if __name__ == '__main__':
    pass
