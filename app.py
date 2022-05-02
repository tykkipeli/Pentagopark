from flask import Flask
from flask import redirect, render_template, request, session
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from werkzeug.security import check_password_hash, generate_password_hash

import json
from datetime import datetime
from datetime import timedelta
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
    def __init__(self, white, black, gameid):
        self.white = white
        self.black = black
        self.white_active = True
        self.black_active = True
        self.turn = white
        self.positions = [(0,0)]
        self.state = "kesken"
        self.lastkaanto = "none"
        self.movenumber = 0
        self.lasttimeUpdate = datetime.now()
        self.whiteTime = timedelta(seconds = 600)
        self.blackTime = timedelta(seconds = 600)
        self.gameid = gameid
        self.lastseenWhite = datetime.now()
        self.lastseenBlack = datetime.now()
        self.extraInformation = "none"
        self.chatsize = 50
        self.chat = [""]*self.chatsize
        self.chatsenders = [""]*50*self.chatsize
        self.playermessages = {}
        self.chatindex = 0
    
    def send_message(self, message, player):
        self.chat[self.chatindex] = message
        self.chatsenders[self.chatindex] = player
        for p in [self.white, self.black]:
            if p not in self.playermessages:
                self.playermessages[p] = []
            self.playermessages[p].append(self.chatindex)
        self.chatindex += 1
        self.chatindex %= self.chatsize

    def update_gamestate(self):
        if self.state != "kesken":
            return
        now = datetime.now()
        ero = now - self.lastseenWhite
        if ero.seconds >= 1:
            self.state = "mustan voitto"
            self.extraInformation = "Valkoinen jätti pelin"
        ero = now - self.lastseenBlack
        if ero.seconds >= 1:
            self.state = "valkoisen voitto"
            self.extraInformation = "Musta jätti pelin"
    
    def report_activity(self, player):
        if self.white == player:
            self.lastseenWhite = datetime.now()
        elif self.black == player:
            self.lastseenBlack = datetime.now()
            
    def has_active_players(self):
        now = datetime.now()
        ero = now - self.lastseenWhite
        if ero.seconds < 1:
            return True
        ero = now - self.lastseenBlack
        if ero.seconds < 1:
            return True
        return False
    
    def update_game_times(self):
        if self.state != "kesken":
            return
        now = datetime.now()
        ero = now - self.lasttimeUpdate
        self.lasttimeUpdate = now
        if self.turn == self.white:
            self.whiteTime -= ero
        else:
            self.blackTime -= ero
        if self.whiteTime < timedelta(seconds = 0):
            self.state = "mustan voitto"
            self.whiteTime = timedelta(seconds = 0)
        if self.blackTime < timedelta(seconds = 0):
            self.state = "valkoisen voitto"
            self.blackTime = timedelta(seconds = 0)
        
    def get_inactive_players(self):
        lista = []
        now = datetime.now()
        ero = now - self.lastseenWhite
        if not self.white_active or ero.seconds >= 1:
            lista.append(self.white)
        ero = now - self.lastseenBlack
        if not self.black_active or ero.seconds >= 1:
            lista.append(self.black)
        return lista
    
    def resign(self, player):
        if player == self.white:
            self.white_active = False
            self.state = "mustan voitto"
            self.extraInformation = "Valkoinen luovutti"
        elif player == self.black:
            self.black_active = False
            self.state = "valkoisen voitto"
            self.extraInformation = "Musta luovutti"
        
    

players = {} # aika jolloin viimeksi aulassa
challenges = {} #avain haastaja, arvo haastettava
challenges2 = {} #avain haastettava, arvo haastaja
gameroom = {} #user to gameobject
games = {} # gameid to gameobject
gameid = 0
aulachat = [""]*1000
aulachatsender = [""]*1000
playermessages = {}
messageindex = 0


def update_present_users():
    print("games!" + str(games))
    print("gameroom" + str(gameroom))
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
    #print("Paikalla ollaan! " + session["username"])
    players[session["username"]] = datetime.now()
    haastettava = ""
    roomid = ""
    if session["username"] in gameroom:
        #roomid = gameroom[session["username"]]
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
    #print("Haaste pelaajalta " + session["username"] + " pelaajalle " + name)
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
        #Talleta peli tietokantaan
        pass
    bitboard.tulosta(board)
    return "success"

@app.route("/resignrequest",methods=["POST"])
def resignrequest():
    if session["username"] not in gameroom:
        return "fail"
    game = gameroom[session["username"]]
    game.resign(session["username"])
    update_present_users() #varmista, että pelaaja välittömästi poistetaa gameroom-rakenteesta
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
