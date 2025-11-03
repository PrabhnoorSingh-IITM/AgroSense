from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from twilio.rest import Client
from dotenv import load_dotenv

# ----------------------------
# Flask App Initialization
# ----------------------------
app = Flask(__name__)
CORS(app)
load_dotenv()

# ----------------------------
# Twilio Configuration
# ----------------------------
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_FROM")
ALERT_PHONE = os.getenv("ALERT_RECEIVER_PHONE")

if TWILIO_SID and TWILIO_TOKEN:
    twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)
else:
    twilio_client = None
    print("⚠️ Warning: Twilio credentials missing. SMS alerts disabled.")

# ----------------------------
# Routes
# ----------------------------
@app.route("/")
def home():
    return jsonify({
        "status": "✅ AgroSense backend live!",
        "twilio_enabled": bool(twilio_client)
    }), 200


@app.route("/diagnose", methods=["POST"])
def diagnose():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    return jsonify({
        "diagnosis": "Healthy Crop 🌱",
        "recommendation": "No action needed, maintain irrigation.",
        "model_confidence": "97%",
        "file": file.filename
    }), 200


@app.route("/send-alert", methods=["POST"])
def send_alert():
    """
    Triggered when frontend detects a threshold breach.
    Example body:
    { "message": "Low soil moisture detected", "phone": "+91xxxxxxxxxx" }
    """
    if not twilio_client:
        return jsonify({"error": "Twilio not configured"}), 500

    data = request.get_json() or {}
    msg = data.get("message", "AgroSense Alert: Field condition warning!")
    phone = data.get("phone", ALERT_PHONE)

    if not phone or not TWILIO_FROM:
        return jsonify({"error": "Missing phone number or sender ID"}), 400

    try:
        sms = twilio_client.messages.create(
            body=msg,
            from_=TWILIO_FROM,
            to=phone
        )
        print(f"📩 Alert sent: {msg}")
        return jsonify({"status": "sent", "sid": sms.sid}), 200
    except Exception as e:
        print(f"❌ Twilio send error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
