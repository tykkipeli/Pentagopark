from app import app
from flask import redirect, render_template, request, session
import userDAO


@app.route("/ranking")
def ranking():
    return redirect("/ranking/0")

@app.route("/ranking/<string:offset>")
def ranking2(offset):
    offset = int(offset)
    if offset < 0 or offset%30 != 0:
        return redirect("/ranking/0")
    result = userDAO.get_best_users(offset)
    users = []
    #ratings = []
    ind = offset
    for item in result:
        ind += 1
        users.append({"rank":ind, "user":item[0], "rating":int(item[1])})
        #ratings.append(item[1])
    return render_template("ranking.html", users=users, offset=offset)
