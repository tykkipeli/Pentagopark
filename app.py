from flask import Flask
from flask import redirect, render_template, request, session
from os import getenv
import threading

app = Flask(__name__)

import routes.authentication
import routes.gameroom
import routes.lobby
import routes.analysis
import routes.ranking
import routes.profile

app.secret_key = getenv("SECRET_KEY")


#import dbtest
#dbtest.suorita()
#quit()

@app.route("/")
def index():
    return render_template("etusivu.html")



lock = threading.Lock()
lista = []

@app.route("/testi")
def testi():
    lock.acquire()
    global lista
    lista = []
    for i in range(10000000):
        lista.append(i)
    lock.release()
    return str(len(lista))




