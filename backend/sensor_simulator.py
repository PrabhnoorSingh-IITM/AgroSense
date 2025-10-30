import pyrebase
import time
import random
import sys

firebaseConfig = {
    "apiKey": "AIzaSyDLo9IsiIVdIMZlQqz8JEVhRrUZt5BHAQw",
    "authDomain": "agrosense-e00de.firebaseapp.com",
    "databaseURL": "https://agrosense-e00de-default-rtdb.firebaseio.com", 
    "storageBucket": "agrosense-e00de.firebasestorage.app",
    "projectId": "agrosense-e00de",
}

# Demo Thresholds
MOISTURE_CRITICAL_LOW = 20
HUMIDITY_HIGH_RISK = 80

try:
    firebase = pyrebase.initialize_app(firebaseConfig)
    db = firebase.database()
    print("Sensor Simulator: Successfully connected to Firebase.")
except Exception as e:
    print(f"ERROR: Could not initialize Firebase. Check firebaseConfig. \nDetails: {e}")
    print("Please ensure 'databaseURL' is correct.")
    sys.exit(1)


def read_simulated_sensors():
    """Simulates reading data from all connected sensors."""
    
    # Simulate a dry spell for the demo
    if int(time.time() / 60) % 5 < 2:  # Every 5 minutes, simulate 2 minutes of dryness
        moisture = random.uniform(10, 19.9) # CRITICAL LOW
    else:
        moisture = random.uniform(35, 65) # Normal range

    # Simulate high humidity for the demo
    if int(time.time() / 60) % 7 < 2:
        humidity = random.uniform(HUMIDITY_HIGH_RISK + 1, 90)
    else:
        humidity = random.uniform(60, 75)

    temp = random.uniform(25.5, 30.0)
    ph = random.uniform(6.4, 7.2) 
    nitrogen = random.uniform(120, 150)
    phosphorus = random.uniform(50, 70)
    potassium = random.uniform(180, 220)

    return {
        "soil_moisture": round(moisture, 1),
        "air_temp": round(temp, 1),
        "air_humidity": round(humidity, 1),
        "ph": round(ph, 1),
        "N": round(nitrogen),
        "P": round(phosphorus),
        "K": round(potassium),
        "timestamp": int(time.time())
    }

def push_sensor_data(data):
    """Pushes the sensor data to the Firebase Realtime Database."""
    try:
        # This is the main data path your frontend is listening to
        db.child("sensors").child("agrosense").set(data)
        
        # This is the alert path the backend server is listening to
        alert_flag = 0
        if data['soil_moisture'] < MOISTURE_CRITICAL_LOW:
            alert_flag = 1
            print("!!! MOISTURE CRITICAL: Setting alert flag to 1 !!!")
            
        db.child("alerts").child("trigger").set(alert_flag)
        
        print(f"Pushed: M={data['soil_moisture']}%, H={data['air_humidity']}%, pH={data['ph']}. Alert Flag: {alert_flag}")
    
    except Exception as e:
        print(f"ERROR: Could not push data to Firebase. Check DB rules. \nDetails: {e}")


if __name__ == '__main__':
    print("--- AgroSense Sensor Simulator Running ---")
    print(f"Pushing data to: {firebaseConfig.get('databaseURL')}")
    print(f"Critical Moisture Threshold: < {MOISTURE_CRITICAL_LOW}%")
    
    while True:
        sensor_data = read_simulated_sensors()
        push_sensor_data(sensor_data)
        time.sleep(10)