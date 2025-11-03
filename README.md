# AgroSense
# 🌱 AgroSense: Smart Irrigation & Soil Health Monitoring System

---

## 🧭 Overview

**AgroSense** is an **IoT-based Smart Irrigation and Soil Monitoring System** designed to help farmers optimize water usage and maintain soil health.  
It continuously tracks **soil moisture, temperature, humidity, and pH**, and **automatically controls irrigation** based on real-time data.

This project was developed as a **hackathon prototype** to demonstrate sustainable, data-driven agriculture.

---

🚜 Problem Statement

- Manual irrigation often causes **overwatering** or **underwatering**.
- Farmers lack **real-time soil condition data**.
- Water wastage leads to poor soil health and reduced crop yield.
- Existing smart systems are expensive and not scalable for small farms.

---

🎯 Objective

To build a **low-cost, IoT-enabled tool** that automates irrigation decisions based on:
- Real-time soil moisture and environmental conditions.
- Soil pH levels for nutrient optimization.
- Cloud-based dashboards for monitoring and analytics.

---
### 🌐 Frontend (HTML, CSS, JS, Chart.js)
Beautiful, *mobile-responsive dashboard UI*
*Dark/Light theme* toggle
*Live charts* for soil moisture trends
*AI Crop Disease Diagnosis Tool* (upload & analysis)
*User Authentication* via Firebase Auth
*Navigation bar* fixed at bottom (mobile-first design)

### 🧠 Backend (Flask + Firebase + Twilio)
REST API endpoints for:
  - Sensor data fetching
  - SMS alerts using *Twilio*
  - Firebase Auth token verification
Uses Firebase Realtime Database for live IoT data
Configurable .env for security

### 💡 IoT Integration (ESP32)
ESP32 pushes real-time sensor readings (temperature, humidity, soil moisture)
Sends data to Firebase RTDB under: