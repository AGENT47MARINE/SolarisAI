# SolarisAI ☀️ (Solar Monitoring Dashboard)

> A full-stack solar plant monitoring platform with a custom Machine Learning fault diagnosis model.

SolarisAI is a comprehensive dashboard designed to monitor solar power plants in real-time. It provides detailed analytics, heatmaps, interactive charts, and an AI-driven fault diagnosis system to ensure optimal energy production and quick issue resolution.

## ✨ Key Features

*   **Real-time Monitoring**: Track Performance Ratio (PR), Capacity Utilization Factor (CUF), and live energy generation across multiple plants.
*   **Interactive Dashboards**: Detailed views for individual plants, inverter level data, and sensor readings.
*   **AI Fault Diagnosis**: Built-in Machine Learning model (XGBoost) to instantly diagnose issues based on live telemetry data (Voltage, Current, Temperature, etc.) without needing external API keys.
*   **String Level Monitoring (SLMS)**: Detailed heatmaps and data grids identifying underperforming solar strings.
*   **Simulated IoT Data**: Includes a sophisticated backend simulator generating realistic time-series telemetry data for development and testing.

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router, Recharts, Lucide React |
| **Styling** | Vanilla CSS (Custom Figma Design System, Glassmorphic UI) |
| **Backend** | Python, FastAPI, Pydantic |
| **Database** | SQLite (Dev) / PostgreSQL+TimescaleDB (Prod ready), SQLAlchemy (Async) |
| **Machine Learning** | XGBoost, scikit-learn, Pandas, NumPy |

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up and run the SolarisAI project on your local machine.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **Python** (v3.9 or higher)
*   **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SolarisAI
```

### 2. Backend Setup (FastAPI & Machine Learning)

The backend requires Python and handles the API, database, and the ML prediction engine.

```bash
# Navigate to the backend directory
cd backend

# (Optional but recommended) Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Train the ML fault diagnosis model (Mandatory first-time setup)
# This generates the synthetic data and trains the XGBoost model locally.
python -m app.ml.train
```

### 3. Frontend Setup (React)

The frontend is a modern React application built with Vite.

```bash
# Open a NEW terminal window/tab
# Navigate back to the project root directory
cd .. # If you were in the backend folder
# Or ensure you are in the SolarisAI root folder

# Install Node.js dependencies
npm install
```

---

## 🏃‍♂️ Running the Application

You need to run both the backend and frontend servers simultaneously in separate terminal windows.

### Start the Backend Server

```bash
cd backend
# Make sure your virtual environment is activated if you used one

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
*   The backend API will run at: `http://localhost:8000`
*   You can view the interactive API documentation (Swagger UI) at: `http://localhost:8000/docs`
*   *Note: Starting the server automatically seeds the database with dummy plants and starts the background IoT device simulator.*

### Start the Frontend Server

```bash
# In your project root directory (SolarisAI)
npm run dev
```
*   The web application will open at: `http://localhost:5173`

---

## 📖 How to Use the Dashboard

1.  **Login**: Once the frontend is running (`http://localhost:5173`), access the login page. Enter any credentials (demo mode is active) to sign in.
2.  **Main Dashboard**: View the top-level summary across all your solar plants. Check the Net Zero footprint, total power generation, and overall system status.
3.  **Navigate to Plants**: Use the sidebar to go to the **Plants** section. Click on a specific plant (e.g., "Goa Shipyard Limited") to view detailed KPI cards.
4.  **View Inverters & Devices**: Inside a plant view, drill down into specific **Inverters** to see real-time 3-phase grid measurements and string currents.
5.  **String Data Heatmap**: Navigate to the **String Data** page from the sidebar to view a color-coded heatmap of all connected solar strings. Red indicates a severe fault, yellow is a warning, and green is optimal.
6.  **AI Diagnosis**: 
    *   Find the **AI Diagnosis** card on an Inverter page or via the Navigation menu.
    *   Click **Run AI Diagnosis**. 
    *   The system will grab the latest telemetry data for that device, run it through the local XGBoost model, and instantly provide a fault prediction (e.g., "Normal", "Overtemperature", "Grid Overvoltage") along with confidence scores and recommended actions.

## 📁 Project Structure

```text
SolarisAI/
├── backend/                  # Python FastAPI application
│   ├── app/
│   │   ├── api/              # API Route handlers (endpoints)
│   │   ├── core/             # Configuration and settings
│   │   ├── db/               # Database setup and models
│   │   ├── ml/               # Machine Learning pipelines and models
│   │   └── services/         # Business logic & IoT simulator
│   ├── requirements.txt      # Python dependencies
│   └── main.py               # FastAPI entry point
├── src/                      # React Frontend application
│   ├── assets/               # Images and static assets
│   ├── components/           # Reusable UI components (Sidebar, Cards, Charts)
│   ├── views/                # Full page views (Dashboard, Login, PlantDetails)
│   ├── App.jsx               # Main React entry point & Routing
│   └── index.css             # Global styles and design system tokens
├── package.json              # Node.js dependencies
└── vite.config.js            # Vite bundler configuration
```
