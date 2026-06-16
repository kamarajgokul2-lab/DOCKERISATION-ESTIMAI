# 🏠 HomeVal — AI House Price Predictor

A production-ready, fully Dockerized web application that uses a trained
machine-learning model to predict residential property prices in real time.

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap)

---

## ✨ Features

| Feature | Detail |
|---|---|
| **ML Inference** | Loads a pickled scikit-learn model at startup for sub-second predictions |
| **Modern UI** | Glassmorphism, animated orbs, toggle cards, gradient typography |
| **REST API** | `POST /predict` with JSON in → predicted price out |
| **Health Check** | `GET /health` for Docker / orchestrator liveness probes |
| **Error Handling** | Validates inputs, returns structured JSON errors |
| **Dockerized** | Single `docker build` + `docker run` — runs anywhere |
| **Codespaces Ready** | Port 5000 forwarded automatically by GitHub Codespaces |

---

## 📁 Project Structure

```
house-price-predictor/
├── app.py                  # Flask backend + /predict + /health routes
├── model/
│   └── house_price_model.pkl   # ← place your trained model here
├── templates/
│   └── index.html          # Jinja2 template (full UI)
├── static/
│   ├── css/style.css       # Design system — tokens, layout, components
│   └── js/script.js        # Form handling, fetch, result rendering
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Place your model

```bash
# Copy your trained model into the model/ directory
cp /path/to/house_price_model.pkl model/
```

### 2. Local (without Docker)

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Open http://localhost:5000
```

### 3. Docker

```bash
# Build
docker build -t house-price-predictor .

# Run
docker run -p 5000:5000 house-price-predictor

# Open http://localhost:5000
```

### 4. GitHub Codespaces

1. Open the repo in a Codespace.
2. Run the Docker commands above (Docker is pre-installed in Codespaces).
3. Codespaces automatically forwards port **5000** — click **Open in Browser**.

---

## 🔌 API Reference

### `POST /predict`

**Request** (JSON):

```json
{
  "area": 3000,
  "bedrooms": 3,
  "bathrooms": 2,
  "stories": 2,
  "parking": 1,
  "mainroad": 1,
  "guestroom": 0,
  "basement": 1,
  "hotwaterheating": 0,
  "airconditioning": 1,
  "prefarea": 0,
  "furnishingstatus": 2
}
```

**Response** (200 OK):

```json
{ "predicted_price": 4850000.00 }
```

**Error** (4xx / 5xx):

```json
{ "error": "Area must be greater than 0." }
```

### `GET /health`

```json
{ "status": "ok", "model_loaded": true }
```

---

## 🧩 Feature Encoding

| Feature | Type | Values |
|---|---|---|
| `area` | float | Square footage |
| `bedrooms` | int | 1–6 |
| `bathrooms` | int | 1–4 |
| `stories` | int | 1–4 |
| `parking` | int | 0–3 |
| `mainroad` | int | 0 = No, 1 = Yes |
| `guestroom` | int | 0 = No, 1 = Yes |
| `basement` | int | 0 = No, 1 = Yes |
| `hotwaterheating` | int | 0 = No, 1 = Yes |
| `airconditioning` | int | 0 = No, 1 = Yes |
| `prefarea` | int | 0 = No, 1 = Yes |
| `furnishingstatus` | int | 0 = Unfurnished, 1 = Semi, 2 = Fully |

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11 · Flask 3 · Gunicorn · scikit-learn · NumPy
- **Frontend**: HTML5 · CSS3 · Bootstrap 5 · Vanilla JS (no frameworks)
- **Fonts**: Syne (display) + Inter (body) via Google Fonts
- **Container**: Docker (python:3.11-slim)

---

## 📝 Notes

- If you retrain your model, just replace `model/house_price_model.pkl` and rebuild the Docker image.
- For large model files (>50 MB), consider [Git LFS](https://git-lfs.github.com/).
- Set `FLASK_DEBUG=true` as an environment variable for hot-reload during development.

---

*Built for educational and portfolio purposes. Not a formal property appraisal.*
