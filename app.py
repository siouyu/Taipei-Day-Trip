from flask import *
from flask_cors import CORS
import mysql.connector
import os
# from flask_jwt_extended import create_access_token
# from flask_jwt_extended import get_jwt_identity
# from flask_jwt_extended import jwt_required
# from flask_jwt_extended import JWTManager
import jwt
import datetime
import requests
import random

# app.json.ensure_ascii = False
app = Flask(__name__)
CORS(app)

app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
secret = os.getenv("secret")
# app.config["JWT_SECRET_KEY"] = "super-secret",
# jwt = JWTManager(app)

def connection():
    con = mysql.connector.connect(
        user = "root",
        password = os.getenv("mysql_password"),
        host = "127.0.0.1",
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
	print(os.environ)

# 取得景點資料列表
@app.route("/api/attractions")
def get_attractions():	
	cursor = None
	try:
		con = connection()
		cursor = con.cursor(dictionary = True)
		page = int(request.args.get("page", 0)) # 頁數從 0 開始
		keyword = request.args.get("keyword", None)
		query = "SELECT * FROM Attraction"
		params = []

		if keyword:
			query += f" WHERE name LIKE %s OR mrt LIKE %s" 
			keyword = f"%{keyword}%"  # f 是 format、% 是前後模糊
			params = [keyword, keyword]

		per_page = 12
		offset = page * per_page
		query += " LIMIT %s OFFSET %s"
		params += [per_page, offset]

		cursor.execute(query, params)
		attractions = cursor.fetchall()

		for attraction in attractions:
			image_query = "SELECT image FROM Attraction_image WHERE attraction_id = %s"
			cursor.execute(image_query, [attraction['id']])
			images = cursor.fetchall()
			attraction["images"] = [img['image'] for img in images]

		cursor.close()
		con.close()

		has_more_data = len(attractions) == per_page
		response_data = {
    		"data": attractions
		}
		if has_more_data:
			response_data["nextPage"] = page + 1
		else:
			response_data["nextPage"] = None
		return jsonify(response_data)
	
	except mysql.connector.Error as error:
		return jsonify({"error": True, "message": f"伺服器內部錯誤: {str(error)}"})

	finally:
		if cursor:
			cursor.close()
			con.close()

# 根據景點編號取得景點資料
@app.route("/api/attraction/<int:attractionId>")
def get_attraction(attractionId):
	cursor = None
	try:
		con = connection()
		cursor = con.cursor(dictionary = True)
		query = "SELECT * FROM Attraction WHERE id = %s"
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
		return jsonify({"error": True, "message": f"伺服器內部錯誤: {str(error)}"})

	finally:
		if cursor:
			cursor.close()
			con.close()

# 取得捷運站資料列表
@app.route("/api/mrts")
def mrts():
	cursor = None
	try:
		con = connection()
		cursor = con.cursor()
		query = " SELECT mrt, COUNT(*) AS num_attractions FROM Attraction GROUP BY mrt ORDER BY num_attractions DESC "
		cursor.execute(query)
		mrt_list = [row[0] for row in cursor.fetchall()]
		return jsonify({"data": mrt_list})  

	except mysql.connector.Error as error:
		return jsonify({"error": True, "message": f"伺服器內部錯誤: {str(error)}"})

	finally:
		if cursor:
			cursor.close()
			con.close()

# 取得會員資料
@app.route("/api/user", methods=["POST"])
def register():
	data = request.json
	print(data)
	name = data.get("name")
	email = data.get("email")
	password = data.get("password")

	if not name or not email or not password:
		return jsonify({"error": True, "message":"請填寫完整資料"}), 400
	con = connection()
	cursor = con.cursor()

	try:
		cursor.execute("SELECT * FROM taipei_trip_member WHERE email = %s ",(email,))
		existing_user = cursor.fetchone()

		if existing_user:
			return jsonify({"error": True, "message":" 這個 Email 已被註冊"}),400

		cursor.execute("INSERT INTO taipei_trip_member (name, email, password) VALUES (%s, %s, %s)", (name, email, password))
		con.commit()
		return jsonify({"ok":True}), 200
	
	except mysql.connector.Error as e:
		return jsonify({"error": True, "message":"伺服機錯誤"}), 500

	finally:
		cursor.close()
		con.close()

@app.route("/api/user/auth", methods=["PUT"])
def authenticate():
	data = request.json
	print(data)
	email = data.get("email")
	password = data.get("password")

	if not email or not password:
		return jsonify({"error": True, "message":"請填寫完整資料"}), 400

	con = connection()
	cursor = con.cursor()

	try:
		cursor.execute("SELECT id, name, email, password FROM taipei_trip_member WHERE email = %s", (email,))
		user = cursor.fetchone()
		print(user)
		
		if user and password == user[3]:
			expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=7)
			access_token = jwt.encode({"id":str(user[0]),
							"name":str(user[1]), 
							"email":str(user[2]), 
							"expire":str(expiration_time)}, 
							secret, algorithm="HS256")
			print(expiration_time)
			print(access_token)
			return jsonify({"access_token": access_token}), 200
		else:
			return jsonify({"error":True, "message":"帳號或密碼錯誤"}), 400
	except Exception as e:
		return jsonify({"error": True, "message":e}), 500
	
	finally:
		cursor.close()
		con.close()


def verify_token():
	auth_header = request.headers.get("Authorization")
	if not auth_header or not auth_header.startswith("Bearer "):
		return None
	token = auth_header.split("Bearer ")[1]
	try:
		payload = jwt.decode(token, secret, algorithms=["HS256"])

		if payload.get("expire"):
			timestamp = payload.get("expire")
			date_time_obj = datetime.datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S.%f")
			timestamp = date_time_obj.timestamp()
			current_time =  int(datetime.datetime.now().strftime("%s"))
			iso_timestamp = int(timestamp)
			if current_time > iso_timestamp:
				return "expired"
		return payload
	except jwt.ExpiredSignatureError:
		return "expired"
	except jwt.InvalidTokenError:
		return None


@app.route("/api/user/auth", methods=["GET"])
def getuser():
	payload = verify_token()
	if payload is None:
		return jsonify({ "id": None, "name": None, "email": None,}), 200
	elif payload == "expired":
		return jsonify({"message": "Token has expired"}), 401
	
	user_id = payload.get("id")
	user_name = payload.get("name")
	user_email = payload.get("email")

	return jsonify({
		"id": user_id,
		"name": user_name,
		"email": user_email,
	}), 200


# 取得預定行程
@app.route("/api/booking", methods=["GET"])
def create_booking():
	payload = verify_token()
	if payload is None:
		return jsonify({"error":True, "message": "請先登入會員"}), 403
	elif payload == "expired":
		return jsonify({"error":True, "message": "Token has expired"}), 401
	
	member_id = payload.get("id")
	con = connection()
	cursor = con.cursor(dictionary=True)
	query = "SELECT * FROM taipei_trip_booking INNER JOIN Attraction ON taipei_trip_booking.attractionId = Attraction.Id INNER JOIN Attraction_image ON Attraction.Id = Attraction_image.attraction_id WHERE memberId = %s"
	cursor.execute(query, (member_id,))
	bookings = cursor.fetchall()
	cursor.close()
	con.close()

	if len(bookings) == 0:
		return jsonify({"data":[]}), 200
	
	booking_data = []
	
	for booking in bookings:
		data = {
			"data": {
				"attraction": {
					"id": booking["attractionId"],
					"name": booking["name"],
					"address": booking["address"],
					"image": booking["image"]
				},
				"date": booking["date"],
				"time": booking["time"],
				"price": booking["price"]
			}
		}
		return jsonify({"data": data}), 200

# 建立預定行程
@app.route("/api/booking", methods=["POST"])
def check_booking():
	payload = verify_token()
	if payload is None:
		return jsonify({"error":True, "message": "請先登入會員"}), 403
	elif payload == "expired":
		return jsonify({"error":True, "message": "Token has expired"}), 401
	
	data = request.json
	attraction_id = int(data.get("attractionId"))
	date = data.get("date")
	time = data.get("time") 
	price = data.get("price")

	print("景點編號", type(attraction_id))
	print("日期", type(date))
	print("時間", type(time))
	print("價錢", type(price))
	print("會員編號", type(payload.get("id")))

	if not (attraction_id and date and time and price):
		return jsonify({"error":True, "message": "請提供完整預定資訊"}), 400
	
	try:	
		member_id = int(payload.get("id"))
		con = connection()
		cursor = con.cursor()
		query = "SELECT id FROM taipei_trip_booking WHERE memberId = %s"
		cursor.execute(query, (member_id,))
		check_booking = cursor.fetchall()
		if len(check_booking) == 0:
			query = "INSERT INTO taipei_trip_booking (attractionId, memberId, date, time, price) VALUES (%s, %s, %s, %s, %s)"
			cursor.execute(query, (attraction_id, member_id, date, time, price))
			con.commit()
		else:
			query = "UPDATE taipei_trip_booking SET attractionId = %s, date = %s, time = %s, price = %s WHERE memberId = %s"
			cursor.execute(query, (attraction_id, date, time, price, member_id))
			con.commit()
		return jsonify({"ok":True})
	
	except Exception as e:
		con.rollback()
		print(e)
		return jsonify({"error":True, "message": "建立或更新預定行程失敗"}), 500
	
	finally:
		cursor.close()
		con.close()

# 刪除預定行程
@app.route("/api/booking", methods=["DELETE"])
def delete_booking():
	payload = verify_token()
	if payload is None:
		return jsonify({"error":True, "message": "請先登入會員"}), 403
	elif payload == "expired":
		return jsonify({"error":True, "message": "Token has expired"}), 401
	
	try:
		member_id = payload.get("id")
		con = connection()
		cursor = con.cursor()

		query = ("DELETE FROM taipei_trip_booking WHERE memberId = %s")
		cursor.execute(query, (member_id,))
		con.commit()
		cursor.close()
		con.close()

		return jsonify({"ok": True})
	
	except Exception as e:
		con.rollback()
		return jsonify({"error":True, "message": "取消預定行程失敗"}), 500



# 取得訂單資料
@app.route("/api/order/<orderNumber>", methods=["GET"])
def api_order_number_get(orderNumber):
	order_information = get_order_information_by_number(orderNumber)
	print("這裡 print 訂單資訊",order_information)
	return jsonify(order_information)

def get_order_information_by_number(orderNumber):
	con = connection()
	cursor = con.cursor(buffered=True, dictionary=True)
	select_number = """
		SELECT * FROM taipei_trip_orders WHERE taipei_trip_orders.id = %s;
		"""
	select_id = (orderNumber, )
	cursor.execute(select_number, select_id)
	order_information = cursor.fetchall()
	cursor.close()
	con.close()
	return order_information


@app.route("/api/orders", methods=["POST"])
def get_order():
	payload = verify_token()
	if payload is None:
		return jsonify({"error":True, "message": "請先登入會員"}), 403
	elif payload == "expired":
		return jsonify({"error":True, "message": "Token has expired"}), 401
	
	data = request.get_json()
	print("這裡 print get order 資料 ",data)
	prime = data["prime"]
	amount = data["order"]["price"]
	name = data["contact"]["name"]
	email = data["contact"]["email"]
	phone_number = data["contact"]["phone"]
	member_id = payload.get("id")
	try:
		if not phone_number or not name or not email:
			return jsonify({"error": True, "message": "缺少資訊"})
		output = check_payment(prime, amount, name, email, phone_number, member_id)
		print("這裡印出 output",output)
		return jsonify(output)
	except:
		return jsonify({"error": True, "message": SyntaxError}), 500	
	
def check_payment(prime, amount, name, email, phone_number, member_id):
	headers = {
		"content-type": "application/json",
		"x-api-key": os.getenv("PARTNER_KEY")
	}
	output_payment = {
		"prime": prime,
		"partner_key": os.getenv("PARTNER_KEY"),
		"merchant_id": "ShowyuHsu_CTBC",
		"details": "test",
		"amount": 2500, # 改回"amount"
		"cardholder": {
			"name": name,
			"email": email,
			"phone_number": phone_number
		}
	}
	response = requests.post(
		"https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime", headers=headers, json=output_payment).json()
	print("這裡 print 狀態回應",response)
	status_code = response["status"]
	now = datetime.datetime.now()
	time_string = now.strftime("%Y%m%d%H%M%S")
	order_number = time_string + str(random.randint(1000, 9999))
	if status_code == 0:
		payment = True
		insert_order(order_number, member_id, amount, name, email, phone_number, payment)
		delete_booking_by_id(member_id)
		return {
			"data": {
				"number": order_number,
				"payment": {
					"status": 0,
					"message": "付款成功"
				}
			}
		}
	else:
		return {"error": True, "message": "付款錯誤"}

def insert_order(id, member_id, price, name, email, phone, payment):
	con = connection()
	cursor = con.cursor()
	insert_order = """ 
		INSERT INTO taipei_trip_orders(id, member_id, price, name, email, phone, payment) VALUE (%s, %s, %s, %s, %s, %s, %s)
		"""
	insert_value = (id, member_id, price, name, email, phone, payment)
	cursor.execute(insert_order, insert_value)
	con.commit()
	cursor.close()
	con.close()

# 結帳完清空資料
def delete_booking_by_id(member_id):
	con = connection()
	cursor = con.cursor()
	delete_booking = """
		DELETE FROM taipei_trip_booking WHERE memberId = %s
		"""
	delete_id = (member_id, )
	cursor.execute(delete_booking, delete_id)
	con.commit()
	cursor.close()
	con.close()
	return True	

if __name__ == "__main__":
    app.run(host="0.0.0.0", port = 3000, debug = True)
    app.secret_key = "secret"