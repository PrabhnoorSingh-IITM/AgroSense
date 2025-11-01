/*******************************************************
 * AgroSense IoT Firmware (Final Version)
 * Board: ESP32 Dev Module
 * Sensors: DHT11 (Temp & Humidity), Soil Moisture Analog
 * Cloud: Firebase Realtime Database (agrosense-e00de)
 * Author: Prabhnoor Singh
 *******************************************************/

// Blynk Configuration
#define BLYNK_TEMPLATE_ID   "TMPL35Ga3-0zw"
#define BLYNK_TEMPLATE_NAME "AgroSense"
#define BLYNK_AUTH_TOKEN    "6O7LNphhOpTf6VHhRE1qs-0KvoYHbWy2"

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <DHT_U.h>
#include <BlynkSimpleEsp32.h>

// Helper headers from Firebase library
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ---------------- CONFIGURATION ----------------

//  Wi-Fi Credentials
#define WIFI_SSID       "Sidhu_1"
#define WIFI_PASSWORD   "Catapult@12"

// ☁️Firebase Project Configuration
#define FIREBASE_HOST   "agrosense-e00de-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH   "o0NuQDXEJgQN35H9EiGaLanAhzahO7hlIcgnsX4h"

// Hardware Pin Configuration (use your tested ones)
#define DHTPIN 15
#define DHTTYPE DHT11
#define SOIL_PIN 34


// System Threshold
#define MOISTURE_THRESHOLD 20   // Below this triggers dry alert (in %)

// ---------------- OBJECTS ----------------
DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
BlynkTimer timer;

// Timer for Firebase sync
unsigned long lastPushTime = 0;
const unsigned long PUSH_INTERVAL = 10000;  // every 10 sec

// ---------------- FUNCTION DECLARATIONS ----------------
void sendSensorData();

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);
  Serial.println("🌱 AgroSense System Starting...");

  dht.begin();
  delay(2000);

  // Connect WiFi
  Serial.print("🔌 Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Firebase configuration (modern API)
  config.database_url = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("✅ Connected to Firebase!");

  // Blynk setup
  Blynk.begin(BLYNK_AUTH_TOKEN, WIFI_SSID, WIFI_PASSWORD);
  timer.setInterval(5000L, sendSensorData);
  Serial.println("✅ Blynk Connected!");
}

// ---------------- LOOP ----------------
void loop() {
  Blynk.run();
  timer.run();

  if (Firebase.ready() && (millis() - lastPushTime > PUSH_INTERVAL)) {
    lastPushTime = millis();
    sendSensorData();
  }
}

// ---------------- FUNCTIONS ----------------
void sendSensorData() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int soilRaw = analogRead(SOIL_PIN);
  float soilPercent = map(soilRaw, 4095, 0, 0, 100);

  Serial.println("---------------------------");
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("⚠️ DHT11 not responding!");
    return;
  }

  Serial.printf("🌡 Temperature: %.1f °C\n", temperature);
  Serial.printf("💧 Humidity: %.1f %%\n", humidity);
  Serial.printf("🌱 Soil Moisture: %.1f %%\n", soilPercent);

  // ---- Send to Firebase ----
  FirebaseJson json;
  json.set("air_temp", temperature);
  json.set("air_humidity", humidity);
  json.set("soil_moisture", soilPercent);
  json.set("timestamp", millis() / 1000);

  if (Firebase.RTDB.setJSON(&fbdo, "/sensors/agrosense", &json))
    Serial.println("✅ Data pushed to Firebase!");
  else
    Serial.printf("❌ Firebase Error: %s\n", fbdo.errorReason().c_str());

  // ---- Send to Blynk ----
  Blynk.virtualWrite(V0, temperature);
  Blynk.virtualWrite(V1, humidity);
  Blynk.virtualWrite(V2, soilPercent);

  // ---- Optional alert ----
  if (soilPercent < MOISTURE_THRESHOLD)
    Firebase.RTDB.setInt(&fbdo, "/alerts/trigger", 1);
  else
    Firebase.RTDB.setInt(&fbdo, "/alerts/trigger", 0);
}