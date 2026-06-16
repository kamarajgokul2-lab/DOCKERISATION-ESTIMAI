"""
House Price Predictor - Flask Backend
Loads a trained ML model and serves predictions via REST API.
"""

import os
import logging
import pickle
import numpy as np
from flask import Flask, request, jsonify, render_template

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── App init ─────────────────────────────────────────────────────────────────
app = Flask(__name__)

# ── Model loading ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "house_price_model.pkl")
model = None

def load_model():
    """Load the pickled ML model at startup."""
    global model
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        logger.info("Model loaded successfully from %s", MODEL_PATH)
    except FileNotFoundError:
        logger.error("Model file not found at %s — place your .pkl there.", MODEL_PATH)
    except Exception as exc:
        logger.exception("Failed to load model: %s", exc)

load_model()

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts JSON with house features, returns predicted price.

    Expected fields (all numeric):
        area, bedrooms, bathrooms, stories, parking,
        mainroad, guestroom, basement, hotwaterheating,
        airconditioning, prefarea, furnishingstatus
    """
    if model is None:
        logger.error("Prediction attempted but model is not loaded.")
        return jsonify({"error": "Model not loaded. Check server logs."}), 503

    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No input data provided."}), 400

        # Extract and validate features
        features = [
            float(data.get("area", 0)),
            int(data.get("bedrooms", 0)),
            int(data.get("bathrooms", 0)),
            int(data.get("stories", 0)),
            int(data.get("parking", 0)),
            int(data.get("mainroad", 0)),
            int(data.get("guestroom", 0)),
            int(data.get("basement", 0)),
            int(data.get("hotwaterheating", 0)),
            int(data.get("airconditioning", 0)),
            int(data.get("prefarea", 0)),
            int(data.get("furnishingstatus", 0)),
        ]

        # Basic sanity checks
        if features[0] <= 0:
            return jsonify({"error": "Area must be greater than 0."}), 422
        if not (1 <= features[1] <= 10):
            return jsonify({"error": "Bedrooms must be between 1 and 10."}), 422

        feature_array = np.array([features])
        prediction = model.predict(feature_array)[0]
        predicted_price = round(float(prediction), 2)

        logger.info("Prediction: $%.2f for features %s", predicted_price, features)
        return jsonify({"predicted_price": predicted_price}), 200

    except (ValueError, TypeError) as exc:
        logger.warning("Invalid input: %s", exc)
        return jsonify({"error": f"Invalid input: {exc}"}), 422
    except Exception as exc:
        logger.exception("Unexpected error during prediction: %s", exc)
        return jsonify({"error": "Internal server error. Please try again."}), 500


@app.route("/health")
def health():
    """Health-check endpoint for Docker / Codespaces."""
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
    }), 200


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    logger.info("Starting House Price Predictor on port %d (debug=%s)", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug)
