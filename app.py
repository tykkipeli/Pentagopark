from flask import Flask
from flask import redirect, render_template, request, session
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from werkzeug.security import check_password_hash, generate_password_hash

from flask_socketio import SocketIO, emit, send, join_room, leave_room

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)
app.secret_key = getenv("SECRET_KEY")

socketio = SocketIO(app, logger = True, engineio_logger = True)

players = set()
challenges = set()

@app.route("/")
def index():
    return render_template("etusivu.html")

@app.route("/play")
def play():
    return render_template("pelisivu.html", players=players)

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

@socketio.on('pelaaja_liittyi')
def player_joined():
    if session["username"] not in players:
        players.add(session["username"])
        join_room(session["username"])
    emit('my_response', list(players), broadcast=True)
    
@socketio.on('pelaaja_poistui')
def player_left():
    if session["username"] in players:
        players.remove(session["username"])
        leave_room(session["username"])
    emit('my_response', list(players), broadcast=True)    
    
@socketio.on('haasta_pelaaja')
def challenge_player(opponent):
    print("Haaste tapahtui pelaajalle" + opponent)
    emit('haaste_event', session["username"], room=opponent)
    
#@socketio.on('disconnect')
#def player_disconnected():
#    print("DISCONNECT")
#    if session["username"] in players:
#        players.remove(session["username"])
#    emit('my_response', list(players), broadcast=True) 

#@socketio.on('connect')
#def player_connected():
#    print("CONNECTED")
#    if "usernam" in session and session["username"] not in players:
#        players.add(session["username"])
#        print(session["username"])
#    emit('my_response', list(players), broadcast=True)
    
@socketio.on('joinaus')
def on_join(username):
    print("LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL")
    join_room(session["username"])
    #send("Mita?", broadcast=True)
    print("Joined room " + session["username"])

@socketio.on('message')
def handleMessage(msg):
    print('Message: ' + msg)
    if "username" in session:
        send(msg, room=session["username"])
        #send(msg, broadcast=True)

@socketio.on('my_event')
def handle_my_custom_event(arg1, arg2):
    print('received args: ' + str(arg1) + " " +  str(arg2))
    emit('my_response', {'x':str(arg1), 'y':str(arg2)}, room=session["username"])
    #emit('my_response', {'x':str(arg1), 'y':str(arg2)}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug = True)
