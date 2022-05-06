from flask import Flask
from werkzeug.security import check_password_hash, generate_password_hash
from db import db, select_from_where_is

def create_user(username, password, rating):
    hash_value = generate_password_hash(password)
    sql = "INSERT INTO users (username, password, rating) VALUES (:username, :password, :rating)"
    db.session.execute(sql, {"username":username, "password":hash_value, "rating":1500})
    db.session.commit()
    
def password_is_correct(username, password):
    sql = "SELECT password FROM users WHERE username=:username"
    result = db.session.execute(sql, {"username":username})
    row = result.fetchone()
    if row == None:
        return False
    return check_password_hash(row[0], password)

def update_ratings(white_id, black_id, winner_id):
    white_rating = select_from_where_is("rating", "users", "id", white_id)
    black_rating = select_from_where_is("rating", "users", "id", black_id)
    s1 = 0.5
    if winner_id == white_id:
        s1 = 1
    elif winner_id == black_id:
        s1 = 0
    new_ratings = calculate_new_ratings(white_rating, black_rating, s1)
    sql = "UPDATE users SET rating=:rating WHERE id=:id"
    db.session.execute(sql, {"rating":new_ratings[0], "id":white_id})
    db.session.execute(sql, {"rating":new_ratings[1], "id":black_id})
    
def calculate_new_ratings(white_rating, black_rating, s1):
    r1 = 10**(white_rating / 400)
    r2 = 10**(black_rating / 400)
    e1 = r1 / (r1 + r2)
    e2 = r2 / (r1 + r2)
    s2 = 1 - s1
    k = 32
    return (white_rating + k * (s1 - e1), black_rating + k * (s2 - e2))
