from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuración de PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://usuario:contraseña@localhost/volantines_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo de Volantín
class Volantin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    diseño = db.Column(db.String(100), nullable=False)
    medida = db.Column(db.String(50), nullable=False)
    tipo_hilo = db.Column(db.String(20), nullable=False)
    colores = db.Column(db.JSON)  # Array de colores en formato JSON
    descripcion = db.Column(db.Text)
    imagen_url = db.Column(db.String(255))
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'diseño': self.diseño,
            'medida': self.medida,
            'tipo_hilo': self.tipo_hilo,
            'colores': self.colores or [],
            'descripcion': self.descripcion,
            'imagen_url': self.imagen_url,
            'fecha_creacion': self.fecha_creacion.isoformat()
        }

# Crear las tablas
with app.app_context():
    db.create_all()

# Rutas de la API
@app.route('/')
def hello_world():
    return '¡Bienvenido a la API de Volantines Calados! 🎏'

@app.route('/api/users')
def get_users():
    return {'users': [
        {'first_name': 'Delfines', 'last_name': ''}, 
        {'first_name': 'Alcones', 'last_name': ''}, 
        {'first_name': 'Aviones', 'last_name': ''}, 
        {'first_name': 'Estrellas', 'last_name': ''}, 
        {'first_name': 'Cruces', 'last_name': ''}
    ]}

# GET - Obtener todos los volantines
@app.route('/api/volantines', methods=['GET'])
def get_volantines():
    try:
        volantines = Volantin.query.filter_by(activo=True).all()
        return jsonify({
            'success': True,
            'volantines': [volantin.to_dict() for volantin in volantines],
            'total': len(volantines)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# GET - Obtener un volantín por ID
@app.route('/api/volantines/<int:id>', methods=['GET'])
def get_volantin(id):
    try:
        volantin = Volantin.query.get_or_404(id)
        if not volantin.activo:
            return jsonify({'success': False, 'error': 'Volantín no encontrado'}), 404
        return jsonify({'success': True, 'volantin': volantin.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# POST - Crear nuevo volantín
@app.route('/api/volantines', methods=['POST'])
def create_volantin():
    try:
        data = request.get_json()
        
        # Validaciones básicas
        required_fields = ['nombre', 'diseño', 'medida', 'tipo_hilo']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'El campo {field} es requerido'}), 400

        nuevo_volantin = Volantin(
            nombre=data['nombre'],
            diseño=data['diseño'],
            medida=data['medida'],
            tipo_hilo=data['tipo_hilo'],
            colores=data.get('colores', []),
            descripcion=data.get('descripcion', ''),
            imagen_url=data.get('imagen_url', '')
        )
        
        db.session.add(nuevo_volantin)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Volantín creado exitosamente',
            'volantin': nuevo_volantin.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# PUT - Actualizar volantín
@app.route('/api/volantines/<int:id>', methods=['PUT'])
def update_volantin(id):
    try:
        volantin = Volantin.query.get_or_404(id)
        if not volantin.activo:
            return jsonify({'success': False, 'error': 'Volantín no encontrado'}), 404
            
        data = request.get_json()
        
        # Campos actualizables
        update_fields = ['nombre', 'diseño', 'medida', 'tipo_hilo', 'colores', 'descripcion', 'imagen_url']
        for field in update_fields:
            if field in data:
                setattr(volantin, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Volantín actualizado exitosamente',
            'volantin': volantin.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# DELETE - Eliminar volantín (borrado lógico)
@app.route('/api/volantines/<int:id>', methods=['DELETE'])
def delete_volantin(id):
    try:
        volantin = Volantin.query.get_or_404(id)
        if not volantin.activo:
            return jsonify({'success': False, 'error': 'Volantín no encontrado'}), 404
            
        volantin.activo = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Volantín eliminado exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Ruta para obtener opciones predefinidas
@app.route('/api/opciones', methods=['GET'])
def get_opciones():
    return jsonify({
        'diseños': ['Tradicional', 'Geométrico', 'Floral', 'Abstracto', 'Personalizado', 'Estrella', 'Cruz', 'Diamante'],
        'tipos_hilo': ['10', '4', '0', '00', '000'],
        'colores_populares': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD']
    })

if __name__ == '__main__':
    app.run(debug=True)