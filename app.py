from flask import *

app = Flask(__name__)
app.secret_key = "secret"

@app.route("/") 
def home():
    # if session.get("username"):
    #     return redirect("/member")
    # else:
    return render_template("home.html")
    
if __name__ == "__main__":
    app.run(port = 3000, debug = True)
    app.secret_key = "secret"