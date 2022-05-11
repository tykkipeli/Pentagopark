from app import app
from flask import redirect, render_template, request, session
import time
from game import Game
import json
from datetime import datetime, timedelta
from db import select_from_where_is
import bitboard
import gameDAO

@app.route("/analysis")
def analysis():
    return render_template("analysis.html")

@app.route("/makeanalysismove",methods=["POST"])
def makeanalysismove():
    boardwhite = int(request.form["bitboardwhite"])
    boardblack = int(request.form["bitboardblack"])
    movex = int(request.form["movex"])
    movey = int(request.form["movey"])
    movekaanto = request.form["movekaanto"]
    bitboard.tulosta((boardwhite, boardblack))
    #board = bitboard.tee_siirto_ja_kaanto(movex,movey, movekaanto, (boardwhite, boardblack))
    #Tässä pelkästään kääntö tehdään palvelimella:
    board = (bitboard.teeKaanto(movekaanto,boardwhite), bitboard.teeKaanto(movekaanto, boardblack))
    bitboard.tulosta(board)
    color = "black"
    if bitboard.deduct_turn(board) == 0:
        color = "white"
    vastaus = {
        "positionwhite" : str(board[0]), #miksi str?
        "positionblack" : str(board[1]),
        "lastkaanto" : movekaanto,
        "color" : color,
        "yourturn" : "yes",
        "movenumber" : bin(board[0]).count('1') + bin(board[1]).count('1'),
        "position_count": gameDAO.count_positions(board)
    }
    return json.dumps(vastaus)
