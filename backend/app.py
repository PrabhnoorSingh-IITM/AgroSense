from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, User, SensorData
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import time

# Twilio SMS Support
from twilio.rest import Client
import os

def send_sms_alert(phone, message):
    try:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
        client = Client(account_sid, auth_token)
        client.messages.create(
            body=message,
            from_=twilio_number,
            to=phone
        )
        print(f"SMS sent to {phone}")
    except Exception as e:
        print(f"SMS failed: {e}")


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)

    @app.before_first_request
    def create_tables():
        db.create_all()

    # register
    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        if not name or not email or not password:
            return jsonify({'msg':'missing fields'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'msg':'email exists'}), 400
        user = User(full_name=name, email=email, password_hash=generate_password_hash(password))
        db.session.add(user); db.session.commit()
        return jsonify({'msg':'ok'}), 201

    # login
    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        email = data.get('email'); password = data.get('password')
        if not email or not password:
            return jsonify({'msg':'missing'}), 400
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'msg':'invalid'}, 401)
        access = create_access_token(identity=user.id)
        return jsonify({'access_token': access, 'user': {'id': user.id, 'email': user.email, 'name': user.full_name}})

    # device pushes sensor data: allow device by API key in header or user-provided token
    @app.route('/api/device_data', methods=['POST'])
    def device_data():
        api_key = request.headers.get('X-Device-Key') or request.args.get('api_key')
        if api_key != Config.DEVICE_API_KEY:
            return jsonify({'msg':'unauthorized device'}), 401
        payload = request.get_json() or {}
        # accept optional 'user_email' to attach readings to a user
        email = payload.get('user_email')
        user = None
        if email:
            user = User.query.filter_by(email=email).first()
        sd = SensorData(
            user_id = user.id if user else None,
            air_temp = payload.get('air_temp'),
            air_humidity = payload.get('air_humidity'),
            soil_moisture = payload.get('soil_moisture'),
            timestamp = payload.get('timestamp') or int(time.time())
        )
        db.session.add(sd); db.session.commit()
        return jsonify({'msg':'ok'}), 201

    # save data (authenticated user)
    @app.route('/api/save_data', methods=['POST'])
    @jwt_required()
    def save_data():
        uid = get_jwt_identity()
        user = User.query.get(uid)
        if not user:
            return jsonify({'msg':'user not found'}), 404
        payload = request.get_json() or {}
        sd = SensorData(
            user_id = user.id,
            air_temp = payload.get('air_temp'),
            air_humidity = payload.get('air_humidity'),
            soil_moisture = payload.get('soil_moisture'),
            timestamp = payload.get('timestamp') or int(time.time())
        )
        db.session.add(sd); db.session.commit()
        return jsonify({'msg':'ok'}), 201

    # get latest reading for token or global latest
    @app.route('/api/latest', methods=['GET'])
    def latest():
        token = None
        header = request.headers.get('Authorization')
        # if JWT present return user-scoped latest
        if header and header.startswith('Bearer '):
            # delegate to jwt_required via simple attempt
            try:
                from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
                verify_jwt_in_request()
                uid = get_jwt_identity()
                sd = SensorData.query.filter_by(user_id=uid).order_by(SensorData.timestamp.desc()).first()
                if sd:
                    return jsonify({'data': {
                        'air_temp': sd.air_temp,
                        'air_humidity': sd.air_humidity,
                        'soil_moisture': sd.soil_moisture,
                        'timestamp': sd.timestamp
                    }})
            except Exception:
                pass
        # otherwise return last global reading
        sd = SensorData.query.order_by(SensorData.timestamp.desc()).first()
        if not sd:
            return jsonify({'data': {}}), 200
        return jsonify({'data': {
            'air_temp': sd.air_temp,
            'air_humidity': sd.air_humidity,
            'soil_moisture': sd.soil_moisture,
            'timestamp': sd.timestamp
        }})

    # history (optionally user-scoped)
    @app.route('/api/history', methods=['GET'])
    def history():
        limit = int(request.args.get('limit', 50))
        header = request.headers.get('Authorization')
        q = SensorData.query
        if header and header.startswith('Bearer '):
            try:
                from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
                verify_jwt_in_request()
                uid = get_jwt_identity()
                q = q.filter_by(user_id=uid)
            except Exception:
                pass
        rows = q.order_by(SensorData.timestamp.desc()).limit(limit).all()
        out = []
        for r in rows[::-1]:
            out.append({'air_temp': r.air_temp, 'air_humidity': r.air_humidity, 'soil_moisture': r.soil_moisture, 'timestamp': r.timestamp})
        return jsonify({'data': out})

    # simple health
    @app.route('/api/ping', methods=['GET'])
    def ping():
        return jsonify({'msg':'ok'})

    # AI diagnose endpoint placeholder (keeps your existing behavior)
    @app.route('/diagnose', methods=['POST'])
    def diagnose():
        if 'image' not in request.files:
            return jsonify({'error':'no image'}), 400
        f = request.files['image']
        name = f.filename.lower()
        # reuse earlier simple logic
        if "healthy" in name:
            return jsonify({'status':'success','diagnosis':'Healthy Crop','recommendation':'Maintain conditions','model_confidence':'99.1%'})
        # fallback
        # check latest humidity to add context
        sd = SensorData.query.order_by(SensorData.timestamp.desc()).first()
        humidity = sd.air_humidity if sd else 70
        if humidity > 80:
            return jsonify({'status':'success','diagnosis':'Powdery Mildew (High Risk)','recommendation':'Apply fungicide; increase ventilation','model_confidence':'97.8%'})
        else:
            return jsonify({'status':'success','diagnosis':'Common Leaf Spot','recommendation':'Copper fungicide','model_confidence':'94.2%'})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
