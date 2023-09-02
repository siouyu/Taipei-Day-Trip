import json
import mysql.connector

with open("data/taipei-attractions.json", "r", encoding = "utf-8") as json_file:
    data = json.load(json_file)

def connection():
    con = mysql.connector.connect(
        user = "root",
        password = "test",
        host = "127.0.0.1",
        database = "website",
    )
    return con

try:
    con = connection()
    cursor = con.cursor()

    for result in data["result"]["results"]:
        name = result["name"]
        category = result["CAT"]
        description = result["description"]
        address = result["address"]
        transport = result["direction"]
        mrt = result["MRT"]
        lat = result["latitude"]
        lng = result["longitude"]
        image_urls = result["file"].split("https://www.travel.taipei")

        insert_1 = "INSERT INTO Attraction (name, category, description, address, transport, mrt, lat, lng) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        value_1 = (name, category, description, address, transport, mrt, lat, lng)
        cursor.execute(insert_1, value_1)
        con.commit()

        attraction_id = cursor.lastrowid
        for image_url in image_urls:
            if image_url.endswith((".jpg", ".JPG", ".PNG", ".png")):
                insert_2 = "INSERT INTO Attraction_image (attraction_id, image) VALUES (%s, %s)"
                values_2 = (attraction_id, "https://www.travel.taipei" + image_url)
                cursor.execute(insert_2, values_2)
                con.commit()
    print("資料輸入成功")

except mysql.connector.Error as error:
    print("有地方出錯！", error)

finally:
    cursor.close()
    con.close()