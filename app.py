from flask import *

app = Flask(__name__)

print("gala gala")

@app.route("/") 
def home():
    print("嘎拉嘎拉")
    # if session.get("username"):
    #     return redirect("/member")
    # else:
    return render_template("home.html")
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port = 8080, debug = True)
    app.secret_key = "secret"