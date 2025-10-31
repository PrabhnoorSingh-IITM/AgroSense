#define BLYNK_TEMPLATE_ID "TMPL35Ga3-0zw"
#define BLYNK_TEMPLATE_NAME "AgroSense"
#define BLYNK_AUTH_TOKEN "6O7LNphhOpTf6VHhRE1qs-0KvoYHbWy2"

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <DHT.h>

char auth[] = 6O7LNphhOpTf6VHhRE1qs-0KvoYHbWy2;
char ssid[] = "Your_WiFi_Name";
char pass[] = "Your_WiFi_Password";

#define DHTPIN 4
#define DHTTYPE DHT11
#define SOIL_PIN 34     // Analog pin for soil sensor
#define PH_PIN 35       // Analog pin for pH sensor
#define RELAY_PIN 5     // Relay pin controlling pump

DHT dht(DHTPIN, DHTTYPE);

BlynkTimer timer;

void sendSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int soilValue = analogRead(SOIL_PIN);
  int phValue = analogRead(PH_PIN);

  // Convert readings
  float soilMoisturePercent = map(soilValue, 4095, 0, 0, 100);
  float pH = map(phValue, 0, 4095, 0, 14);  // simple linear mapping

  // Display in Serial Monitor
  Serial.print("Temp: "); Serial.print(temperature);
  Serial.print(" °C  Humidity: "); Serial.print(humidity);
  Serial.print("%  Soil Moisture: "); Serial.print(soilMoisturePercent);
  Serial.print("%  pH: "); Serial.println(pH);

  // Send to Blynk Dashboard
  Blynk.virtualWrite(V0, temperature);
  Blynk.virtualWrite(V1, humidity);
  Blynk.virtualWrite(V2, soilMoisturePercent);
  Blynk.virtualWrite(V3, pH);

  // Automatic irrigation logic
  if (soilMoisturePercent < 40) {  // Threshold
    digitalWrite(RELAY_PIN, LOW);  // Turn pump ON
    Blynk.virtualWrite(V4, 1);     // Update relay status on dashboard
  } else {
    digitalWrite(RELAY_PIN, HIGH); // Turn pump OFF
    Blynk.virtualWrite(V4, 0);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);  // Pump OFF initially

  dht.begin();

  WiFi.begin(ssid, pass);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");

  Blynk.begin(auth, ssid, pass);
  timer.setInterval(2000L, sendSensorData);  // every 2 sec
}

void loop() {
  Blynk.run();
  timer.run();
}
