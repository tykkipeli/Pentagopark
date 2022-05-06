from flask import Flask
from db import db
from db import select_from_where_is
import userDAO

def save_game(game):
    black_id = select_from_where_is("id", "users", "username", game.black)
    white_id = select_from_where_is("id", "users", "username", game.white)
    winner_id = None
    if game.state == "valkoisen voitto":
        winner_id = white_id
    elif game.state == "mustan voitto":
        winner_id = black_id
    move_count = len(game.positions)
    sql = "INSERT INTO games (black_id, white_id, winner_id, date, move_count)" \
        "VALUES (:black_id, :white_id, :winner_id, NOW(), :move_count) RETURNING id"
    result = db.session.execute(sql, {"black_id":black_id, "white_id":white_id, "winner_id":winner_id, "move_count":move_count})
    game_id = result.fetchone()[0]
    save_positions(game_id, game.positions)
    userDAO.update_ratings(white_id, black_id, winner_id)
    db.session.commit()
    
def save_positions(game_id, positions):
    prev_id = None
    for position in positions:
        sql = "INSERT INTO positions (game_id, white_bitboard, black_bitboard, prev_position)" \
            "VALUES (:game_id, :white_bitboard, :black_bitboard, :prev_position) RETURNING id"
        result = db.session.execute(sql, {"game_id":game_id, "white_bitboard":position[0], "black_bitboard":position[1], "prev_position":prev_id})
        prev_id = result.fetchone()[0]
