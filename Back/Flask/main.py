from flask import Flask
from flask-cors import CORS

app = Flask(__name__) #variable de entorno FLASK_APP main.py
CORS(app) # Permitir CORS para todas las rutas y orígenes

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/api/users')
def get_users():
    return {'users': ['Delfines', 'Alcones', 'Aviones', 'Estrellas', 'Cruces']}

if __name__ == '__main__':
    app.run(debug=True) #variable de entorno FLASK_ENV development puerto por defecto 5000