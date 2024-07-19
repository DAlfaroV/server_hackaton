from flask import Flask, request, jsonify, send_from_directory
import pymysql
import json
import os

app = Flask(__name__)
port = 3000

# Configuración de la base de datos
db = pymysql.connect(
    host='localhost',
    user='root',
    password='admin',
    database='sensores_db'
)

# Ruta para recibir los datos del ESP32
@app.route('/insertar_datos', methods=['POST'])
def insertar_datos():
    data = request.json
    temperatura = data.get('temperatura')
    humedad = data.get('humedad')
    humedad_suelo = data.get('humedad_suelo')

    if temperatura is not None and humedad is not None and humedad_suelo is not None:
        try:
            with db.cursor() as cursor:
                query = 'INSERT INTO datos_sensores (temperatura, humedad, humedad_suelo) VALUES (%s, %s, %s)'
                cursor.execute(query, (temperatura, humedad, humedad_suelo))
                db.commit()
                return 'Datos insertados correctamente', 200
        except Exception as e:
            return f'Error al insertar datos: {str(e)}', 500
    else:
        return 'Datos incompletos', 400

# Ruta para actualizar y servir data.json
@app.route('/update-data', methods=['GET'])
def update_data():
    try:
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            query = '''
                SELECT id, temperatura, humedad, humedad_suelo, 
                       DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as timestamp 
                FROM datos_sensores
                ORDER BY id DESC
                LIMIT 1
            '''
            cursor.execute(query)
            results = cursor.fetchall()

            with open('data.json', 'w') as json_file:
                json.dump(results, json_file, indent=2)

        return jsonify({'status': 'success', 'message': 'Data updated'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/data.json', methods=['GET'])
def get_data():
    return send_from_directory(os.getcwd(), 'data.json')

@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(os.getcwd(), filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
