from flask import Flask
from db import db
from random import randint, choice
import bitboard

def generate_random_string(n):
    ans = ""
    for i in range(n):
        ans += chr(ord('a') + randint(0,25))
    return ans

def generate_users(n):
    for i in range(n):
        sql = "INSERT INTO testusers (username, password, rating) VALUES (:username, :password, :rating)"
        username = generate_random_string(randint(10,15))
        password = generate_random_string(randint(10,15))
        db.session.execute(sql, {"username":username, "password":password, "rating":1500})
        db.session.commit()
        
def get_users():
    sql = "SELECT id FROM testusers"
    result = db.session.execute(sql)
    users = result.fetchall()
    db.session.commit()
    ans = []
    for user in users:
        ans.append(user[0])
    return ans
    
        
def generate_games(n):
    users = get_users()
    for i in range(n):
        white = choice(users)
        black = choice(users)
        while white == black:
            black = choice(users)
        positions = create_random_game()
        tulos = bitboard.get_result(positions[-1])
        winner_id = None
        if tulos == "valkoisen voitto":
            winner_id = white
        elif tulos == "mustan voitto":
            winner_id = black
        move_count = len(positions)
        sql = "INSERT INTO testgames (black_id, white_id, winner_id, date, move_count)" \
            "VALUES (:black_id, :white_id, :winner_id, NOW(), :move_count) RETURNING id"
        result = db.session.execute(sql, {"black_id":black, "white_id":white, "winner_id":winner_id, "move_count":move_count})
        game_id = result.fetchone()[0]
        save_positions(game_id, positions)
    db.session.commit()
    
def save_positions(game_id, positions):
    prev_id = None
    for position in positions:
        sql = "INSERT INTO testpositions (game_id, white_bitboard, black_bitboard, prev_position)" \
            "VALUES (:game_id, :white_bitboard, :black_bitboard, :prev_position) RETURNING id"
        result = db.session.execute(sql, {"game_id":game_id, "white_bitboard":position[0], "black_bitboard":position[1], "prev_position":prev_id})
        prev_id = result.fetchone()[0]
    
def create_random_game():
    kaannot = ["ylavasen-vasen", "ylavasen-oikea", "ylaoikea-vasen", "ylaoikea-oikea", "alavasen-vasen", "alavasen-oikea", "alaoikea-vasen", "alaoikea-oikea"]
    positions = [(0,0)]
    while bitboard.get_result(positions[-1]) == "kesken":
        vapaat = []
        for i in range(1,7):
            for j in range(1,7):
                if bitboard.symboliKohdassa(i,j,positions[-1]) == " ":
                    vapaat.append((i,j))
        siirto = choice(vapaat)
        board = bitboard.tee_siirto_ja_kaanto(siirto[0],siirto[1], choice(kaannot) , positions[-1])
        positions.append(board)
    return positions


def suorita():
        #generate_users(1000)
        #print(get_users())
        #print(create_random_game())
        #generate_games(100000)
        #print("done!")
