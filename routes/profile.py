from app import app
from flask import redirect, render_template, request, session
import userDAO
from db import select_from_where_is

@app.route("/profile")
def profile():
    if "username" in session:
        return redirect("/profile/" + session["username"])
    return render_template("error.html")

@app.route("/profile/<string:username>")
def profile2(username):
    rating = select_from_where_is("rating", "users", "username", username);
    rank, precentage = userDAO.get_rank(rating)
    game_count, win_count, loss_count, draw_count = userDAO.get_game_statistics(username, "")
    white_game_count, white_win_count, white_loss_count, white_draw_count = userDAO.get_game_statistics(username, "white")
    black_game_count, black_win_count, black_loss_count, black_draw_count = userDAO.get_game_statistics(username, "black")
    offset = request.args.get('offset')
    if offset == None:
        offset = 0
    return render_template("profile.html", username=username, rating=str(int(rating + 0.5)), rank=rank, precentage=precentage,
                           game_count=game_count, win_count=win_count, loss_count=loss_count, draw_count=draw_count,
                           white_game_count=white_game_count, white_win_count=white_win_count, white_loss_count=white_loss_count, white_draw_count=white_draw_count,
                           black_game_count=black_game_count, black_win_count=black_win_count, black_loss_count=black_loss_count, black_draw_count=black_draw_count,
                           games=userDAO.get_games(username, offset))
