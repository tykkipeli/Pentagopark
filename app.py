from flask import Flask
from flask import redirect, render_template, request, session
from os import getenv

app = Flask(__name__)

import routes.authentication
import routes.gameroom
import routes.lobby
import routes.analysis

app.secret_key = getenv("SECRET_KEY")

@app.route("/")
def index():
    return render_template("etusivu.html")

