from flask import Flask, request, jsonify
import pymysql

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port)
