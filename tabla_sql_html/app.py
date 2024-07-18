from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)  # Permite solicitudes CORS de cualquier origen

# Configuración de la conexión a la base de datos
db_config = {
    'user': 'root',
    'password': 'admin',
    'host': 'localhost',
    'database': 'sensores_db'
}

@app.route('/datos')
def get_datos():
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM datos_sensores ORDER BY timestamp DESC LIMIT 10')
    datos = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(datos)

if __name__ == '__main__':
    app.run(debug=True)
