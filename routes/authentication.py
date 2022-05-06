from app import app
from flask import redirect, render_template, request, session
import userDAO


@app.route("/loginpage")
def loginpage():
    print("Loginpage kutsuttu")
    return render_template("login.html")

@app.route("/login",methods=["POST"])
def login():
    username = request.form["username"]
    password = request.form["password"]
    if not userDAO.password_is_correct(username, password):
        return render_template("login.html", error="Virheellinen käyttäjätunnus tai salasana")
    session["username"] = username
    return redirect("/")

@app.route("/registerpage",methods=["POST"])
def registerpage():
    return render_template("register.html")

@app.route("/register",methods=["POST"])
def register():
    try:
        username = request.form["username"].strip()
        password = request.form["password"]
        userDAO.create_user(username, password, 1500)
        return redirect("/")
    except:
        print("User already exists")
        return render_template("register.html")

@app.route("/logout")
def logout():
    del session["username"]
    return redirect("/")
