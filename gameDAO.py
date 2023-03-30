from flask import Flask
from db import db
from db import select_from_where_is
import userDAO
from sqlalchemy.sql import text

def save_game(game):
    black_id = select_from_where_is("id", "users", "username", game.black)
    white_id = select_from_where_is("id", "users", "username", game.white)
    winner_id = None
    if game.state == "valkoisen voitto":
        winner_id = white_id
    elif game.state == "mustan voitto":
        winner_id = black_id
    move_count = len(game.positions)
    sql = text("INSERT INTO games (black_id, white_id, winner_id, date, move_count)" \
        "VALUES (:black_id, :white_id, :winner_id, NOW(), :move_count) RETURNING id")
    result = db.session.execute(sql, {"black_id":black_id, "white_id":white_id, "winner_id":winner_id, "move_count":move_count})
    game_id = result.fetchone()[0]
    save_positions(game_id, game.positions)
    new_ratings = userDAO.update_ratings(white_id, black_id, winner_id)
    db.session.commit()
    game.white_new_rating = new_ratings[0]
    game.black_new_rating = new_ratings[1]
    
def save_positions(game_id, positions):
    prev_id = None
    for position in positions:
        sql = text("INSERT INTO positions (game_id, white_bitboard, black_bitboard, prev_position)" \
            "VALUES (:game_id, :white_bitboard, :black_bitboard, :prev_position) RETURNING id")
        result = db.session.execute(sql, {"game_id":game_id, "white_bitboard":position[0], "black_bitboard":position[1], "prev_position":prev_id})
        prev_id = result.fetchone()[0]


def count_positions(board):
    sql = text("SELECT COUNT(*) FROM positions WHERE white_bitboard = :white_bitboard AND black_bitboard = :black_bitboard")
    result = db.session.execute(sql, {"white_bitboard":board[0], "black_bitboard":board[1]})
    return result.fetchone()[0]

def get_next_postitions_data(board):
    sql = text("""SELECT whtbb, blcbb, COUNT(*) AS lkm, COUNT(g.id), COUNT(g2.id)
FROM
    ((SELECT p1.white_bitboard AS whtbb, p1.black_bitboard AS blcbb, p1.game_id AS gameid 
    FROM positions p1, positions p2 WHERE p1.prev_position = p2.id AND p2.white_bitboard = :white_bitboard AND p2.black_bitboard = :black_bitboard) AS foo
    LEFT JOIN games g
    ON g.id = gameid AND g.white_id = g.winner_id)
LEFT JOIN games g2
ON g2.id = gameid AND g2.black_id = g2.winner_id
GROUP BY whtbb, blcbb
ORDER BY lkm DESC""")
    result = db.session.execute(sql, {"white_bitboard":board[0], "black_bitboard":board[1]})
    data = []
    for x in result.fetchall():
        data.append((x[0], x[1], x[2], x[3], x[4]))
    db.session.commit()
    return data
    
def get_players(game_id):
    sql = text("SELECT U1.username, U2.username FROM games G, users U1, users U2" \
        " WHERE G.white_id = U1.id AND G.black_id = U2.id AND G.id = :game_id")
    result = db.session.execute(sql, {"game_id":game_id})
    db.session.commit()
    data = result.fetchone()
    return data[0], data[1]

def get_all_game_positions(game_id):
    sql = text("SELECT white_bitboard, black_bitboard FROM positions WHERE game_id = :game_id ORDER BY id")
    result = db.session.execute(sql, {"game_id":game_id})
    db.session.commit()
    data = []
    for x in result.fetchall():
        data.append((x[0], x[1]))
    return data
    
    