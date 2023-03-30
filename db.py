from app import app
from flask_sqlalchemy import SQLAlchemy
from os import getenv
from sqlalchemy.sql import text

app.config["SQLALCHEMY_DATABASE_URI"] = getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

def select_from_where_is(select, fromm, where, iss):
    sql = text(f"SELECT {select} FROM {fromm} WHERE {where}=:iss")
    result = db.session.execute(sql, {"iss":iss})
    row = result.fetchone()
    if row == None:
        return None
    return row[0]
