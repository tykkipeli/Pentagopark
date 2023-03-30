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
    return render_template("analysis.html", gameid=0)

@app.route("/analysis/<int:gameid>")
def analysis2(gameid):
    white, black = gameDAO.get_players(gameid)
    return render_template("analysis.html", gameid=gameid, white=white, black=black)

@app.route("/makeanalysismove",methods=["POST"])
def makeanalysismove():
    boardwhite = int(request.form["bitboardwhite"])
    boardblack = int(request.form["bitboardblack"])
    movex = int(request.form["movex"]) # ei tarvita?
    movey = int(request.form["movey"]) # ei tarvita?
    movekaanto = request.form["movekaanto"]
    gameid = int(request.form["gameid"])
    bitboard.tulosta((boardwhite, boardblack))
    board = (boardwhite, boardblack)
    color = "black"
    if bitboard.deduct_turn(board) == 0:
        color = "white"
    game_positions = []
    if movekaanto == "firstmove" and gameid != 0:
        game_positions = gameDAO.get_all_game_positions(gameid)
    vastaus = {
        "positionwhite" : str(board[0]), #miksi str?
        "positionblack" : str(board[1]),
        "lastkaanto" : movekaanto,
        "color" : color,
        "yourturn" : "yes",
        "movenumber" : bin(board[0]).count('1') + bin(board[1]).count('1'),
        "position_count": gameDAO.count_positions(board),
        "positions_data": gameDAO.get_next_postitions_data(board),
        "game_positions": game_positions
    }
    return json.dumps(vastaus)
