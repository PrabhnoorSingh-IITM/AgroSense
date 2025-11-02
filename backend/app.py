from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from twilio.rest import Client
from dotenv import load_dotenv

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

# --- Load Environment Variables ---
load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_FROM")
ALERT_RECEIVER_PHONE = os.getenv("ALERT_RECEIVER_PHONE")

# Initialize Twilio client
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


@app.route("/")
def home():
    return jsonify({"status": "✅ AgroSense backend v2 running"})


# --- AI Crop Diagnosis Endpoint ---
@app.route("/diagnose", methods=["POST"])
def diagnose_crop():
    """
    Receives an image from frontend and returns a mock AI diagnosis.
    (You can later plug in a real TensorFlow or PyTorch model here.)
    """
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    filename = file.filename

    # Mock ML inference (you can replace this with real prediction)
    result = {
        "diagnosis": "Healthy Crop 🌿",
        "recommendation": "Everything looks great — keep monitoring moisture.",
        "model_confidence": "97%",
        "file_received": filename
    }
    return jsonify(result)


# --- Twilio SMS Alert Endpoint ---
@app.route("/send-alert", methods=["POST"])
def send_alert():
    """
    Sends an SMS alert using Twilio (for critical sensor readings).
    """
    if not twilio_client:
        return jsonify({"error": "Twilio not configured"}), 500

    data = request.get_json() or {}
    message = data.get("message", "AgroSense Alert: Check your field conditions!")
    phone = data.get("phone", ALERT_RECEIVER_PHONE)

    try:
        sms = twilio_client.messages.create(
            body=message,
            from_=TWILIO_FROM,
            to=phone
        )
        return jsonify({"status": "sent", "sid": sms.sid})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Run Server ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
