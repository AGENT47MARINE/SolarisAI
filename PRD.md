# Voice AI Solar Dashboard: Master PRD & Setup Guide

---

# 1. Project Plan & Task Checklist
- [x] **Phase 1: Foundation & UI (Initial Setup)**
  - [x] Initialize React project using Vite
  - [x] Setup app routing

- [x] **Phase 2: Live Dashboard Aesthetics & Data** (NEW tasks based on research)
  - [x] Overhaul `index.css` to match live light theme (white cards, blue/gray background, blue accents)
  - [x] Rebuild Sidebar to match live icon layout (Plants, Inverters, Sensors, Alerts)
  - [x] Implement Top Navigation (Clock, User Profile, Alerts Button)
  - [x] Build Mock Dataset (`mockData.js`) matching Mindra Inverters and WMS/MFM Sensors
  - [x] Rebuild Main Dashboard View (CO2 Saved, Yield, Total Gen)
  - [x] Build detailed Inverters tabular list and individual Device Details View (with Chart)
  - [x] Build Sensors View

- [x] **Phase 3: Voice & Interaction Layer**
  - [x] Integrate Web Speech API (SpeechRecognition) for voice commands
  - [x] Build floating voice control widget (accessible across all screens)
  - [x] Update Intent Parser to understand actual inverter names (e.g., "GRP Inverter 5")

- [x] **Phase 4: Context & AI Features**
  - [x] Implement Context Engine structure
  - [x] Update Context Engine rules based on new views
  - [x] Build AI Fault Diagnosis mock dialogs in Alerts view

---

# 2. Implementation Plan

## Goal Description
Build a web application prototype for a Voice AI Solar Dashboard that mirrors the real-world `aalok.dyulabs.co.in` monitoring system. It allows operators to monitor solar plant performance, receive contextual suggestions, and navigate using voice commands.

## Proposed Architecture
- **Frontend Framework**: React using Vite
- **State Management**: React Context / Hooks
- **Styling**: Vanilla CSS (focused on the specific light theme of the live site: soft white cards, light blue gradients, blue app highlights, green chart accents)
- **Voice Recognition**: Web Speech API (`SpeechRecognition`)
- **Charting**: Using simple HTML/CSS bar representations or Recharts for "E-Total Power - Live Trend"
- **Data Mocking**: Building a dataset that mimics real inverters (e.g., `GRP_INNERTER_x`, `MOULD_INVERTER`, `SPS_INVERTER`) manufactured by "Mindra". Metrics to include Total Generation (KWH), Today Generation (KWH), and Phase Voltages.

## Component Breakdown

### Core UI Views (Matched to Live Site)
- **Main Dashboard**: High-level metrics (Today's Production semi-circle gauge counterpart, Total Production, Total Capacity, CO2 Reduced).
- **Inverters List**: Table layout showing Device Name, Category, Manufacturer, Total Gen, Today Gen.
- **Device Details**: Specific metrics (Voltage AB/BC/AC, Current, Frequency) and an "E-Total Power - Live Trend" graph.
- **Sensors**: Table for Weather Monitoring Systems (WMS) and Multi-Function Meters (MFM).
- **Alerts List**: Chronological list of events with AI Diagnosis tools.

### Voice & Context Engine
- **Voice Overlay**: A persistent floating action button to trigger browser microphone listening.
- **Intent Parser Routings**:
  - `show inverters` -> Navigate to Inverters List
  - `open [inverter name]` -> Navigate to specific Inverter Details
  - `show sensors` -> Navigate to Sensors List
  - `show alerts` -> Navigate to Alerts List
- **Context Suggester**: Contextual voice prompts based on the current UI view.

## Verification Plan
### Automated Tests
- Running via `npm run dev` to ensure build success.

### Manual Verification
- Run the app and verify the visual styling matches the live dashboard.
- Speak into the microphone and verify that the UI navigates to the detailed inverter screens based on realistic names (e.g., "Open GRP Inverter 8").

---

# 3. Walkthrough & Demo Script

## Completed Features
Following the PRD requirements, these core objectives were implemented:

### 1. Live Dashboard Aesthetics & Data (Phase 1 & 2)
As requested, the main dashboard view is powered by an AI-generated high-fidelity render modeled specifically after modern Solar SaaS tools (like the reference live site).

- Rebuilt the entire styling layer to mimic the bright, modern, Material-inspired theme of the live real-world dashboard.
- **Top Navigation**: Implemented a live clock, user profile (`HACKaMINeD Nirma`), and an Alerts trigger.
- **Slim Sidebar**: Identical icon layout to the actual system (Dashboard, Plants/Map, Inverters, Sensors, Connectivity).
- **Mock Data Layer**: Created a highly realistic dataset based on Mindra inverters (e.g., `GRP_INVERTER_8`, `CANT_INVERTER_3`), Phase Voltage/Current telemetry, and actual active power generation numbers.

### 2. Conversational Voice AI Interaction (Phase 3)
- Implemented a floating **Voice Widget** (bottom right) accessible indiscriminately across the application.
- Uses the **Web Speech API** to interpret and transcribe real-time voice commands.
- Includes a fallback expanding text-input box for environments without microphones.
- **Natural Language Intent Parsing**: The AI routes users based on context. Example commands supported:
  - "Show inverters" or "Show sensors"
  - "Open GRP inverter 8" or "Open Mould Inverter 1" (navigates to specific device screens)
  - "Show alerts" or "Return home/dashboard"
  - "How much power did we produce today?" (Triggers vocal text-to-speech response: "5,714 kWh")

### 3. Context & AI Engine (Phase 4)
- **Context-Aware Suggestions**: A popup engine near the voice widget suggests actions based on the current page:
  - On the Dashboard: "Would you like to review the underperforming inverters?"
  - On the Inverters page: "Do you want to check specific metrics for Mould Inverter 1?"
- **Autonomous Monitoring & AI Fault Diagnosis**:
  - Viewing the **Alerts** page displays real anomalies (e.g., "Elevated IGBT Temperature", "Grid Under Voltage").
  - Clicking any alert opens an **AI Fault Diagnosis Overlay** that provides a simulated Root Cause Analysis and specific, actionable recommendations (e.g., "Check RS485 loop connection").
- **Digital Twin Plant Map**:
  - The map screen visualizes the spatial relationship of the devices, separating `Inverters` and `Sensors`.
  - Color-codes the nodes dynamically based on telemetry status (`Normal`, `Warning`, `Critical`).

## How to Test & Demo Script
1. Make sure the development server is running (`npm run dev`).
2. Open `http://localhost:5173/` in your browser.

### The Pitch & Feature Demonstration
Here is a recommended flow for demonstrating the prototype to judges:

**1. The Hook (The Dashboard)**
* "Welcome to the Voice AI Solar Dashboard. What you see is a live, high-fidelity UI tracking Pan-India solar assets—from Bhadla to Pavagada."
* *Action:* Point to the main dashboard interface and the active metrics.

**2. The Voice Interaction Layer (Navigation)**
* "In an emergency, operators don't have time to click through endless nested menus to find a specific inverter. Our platform integrates a contextual Voice AI."
* *Action:* Click the microphone in the bottom right.
* *Say:* **"Show me all inverters."** (The app will navigate to the table view).
* *Say:* **"Open the thermal fault at Pavagada."** (The app will snap directly to the specific Pavagada device details page).

**3. The Context Suggester (AI Prompting)**
* "Notice the AI Context Suggester floating above the voice widget. It understands exactly what page we are looking at and recommends the next best action."
* *Action:* Show the pop-up suggesting to check recent alerts.
* *Say:* **"Show system alerts."** (The app navigates to the alerts page).

**4. The Core Feature: AI Fault Diagnosis**
* "Here we see an active critical alert from the Charanka Solar Park. Instead of just showing log vomit, our platform uses AI to decode the exact root cause and give the technician actionable steps."
* *Action:* Click on the `CHARANKA_INV_03` alert.
* *Show:* The **AI Fault Diagnosis Overlay** pops up, explaining the localized islanding event and providing immediate dispatch recommendations.
