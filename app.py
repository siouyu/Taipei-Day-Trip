from flask import *
import mysql.connector

app = Flask(__name__)

app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

def connection():
    con = mysql.connector.connect(
        user = "root",
        password = "test", # 上 GitHub 前要拿掉！！！！！！！！
        host = "127.0.0.1", # 上 AWS 後這裡可能要改
        database = "website",
    )
    return con

# Pages
@app.route("/") # 已寫好的路由函式，勿更動！
def index():
	return render_template("index.html") 

@app.route("/attraction/<id>") # 已寫好的路由函式，勿更動！
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking") # 已寫好的路由函式，勿更動！
def booking():
	return render_template("booking.html")

@app.route("/thankyou") # 已寫好的路由函式，勿更動！
def thankyou():
	return render_template("thankyou.html")


# 取得景點資料列表
@app.route("/api/attractions")
def get_attractions():	
	try:
		con = connection()
		cursor = con.cursor(dictionary = True)
		page = int(request.args.get("page", 0))
		keyword = request.args.get("keyword", None)
		query = "SELECT * FROM Attraction"
		if keyword:
			query += f" WHERE name LIKE '%{keyword}%' OR mrt LIKE '%{keyword}%'"

		per_page = 12
		offset = page * per_page
		query += f" LIMIT {per_page} OFFSET {offset}"

		cursor.execute(query)
		attractions = cursor.fetchall()
		cursor.close()
		con.close()

		response_data = {
			"nextPage": page + 1,
    		"data": attractions
		}
		return jsonify(response_data)
	
	except mysql.connector.Error as error:
		return jsonify({"error": True, "message": "伺服機內部錯誤"})

# 根據景點編號取得景點資料
@app.route("/api/attraction/<int:attractionId>")
def get_attraction(attractionId):
	try:
		con = connection()
		cursor = con.cursor(dictionary = True)
		query = " SELECT * FROM Attraction WHERE id = %s "
		cursor.execute(query, (attractionId,))
		attraction = cursor.fetchone()
	
		if attraction:
			images_query = " SELECT image FROM Attraction_image WHERE attraction_id = %s "
			cursor.execute(images_query, (attractionId,))
			images = [row["image"] for row in cursor.fetchall()]
			attraction["images"] = images
			return jsonify({"data": attraction})
		else:
			return jsonify({"error":True, "message":"景點編號不正確"})

	except mysql.connector.Error as error:
		return jsonify({"error": True, "message": "伺服機內部錯誤"})

	finally:
		cursor.close()
		con.close()

# 取得捷運站資料列表
@app.route("/api/mrts")
def mrts():
	try:
		con = connection()
		cursor = con.cursor()
		query = " SELECT mrt, COUNT(*) AS num_attractions FROM Attraction GROUP BY mrt ORDER BY num_attractions DESC "
		cursor.execute(query)
		mrt_list = [row[0] for row in cursor.fetchall()]
		return jsonify({"data": mrt_list})  

	except mysql.connector.Error as error:
		return jsonify({"error": True, "message": "伺服機內部錯誤"})

	finally:
		cursor.close()
		con.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port = 3000, debug = True)
    app.secret_key = "secret"