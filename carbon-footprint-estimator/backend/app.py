from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(BASE_DIR, "..", "results")
if not os.path.exists(RESULTS_DIR):
    RESULTS_DIR = os.path.join(BASE_DIR, "results")


@app.route("/")
def home():
    return jsonify({
        "message": "Carbon Footprint Estimator API is running",
        "status": "online"
    })


@app.route("/api/comparison")
def get_comparison():
    file_path = os.path.join(
        RESULTS_DIR,
        "experiment_summary.csv"
    )

    if not os.path.exists(file_path):
        return jsonify({
            "error": "Comparison report not found"
        }), 404

    df = pd.read_csv(file_path)
    return jsonify(df.to_dict(orient="records"))


@app.route("/api/history")
def get_history():
    file_path = os.path.join(
        RESULTS_DIR,
        "experiment_history.csv"
    )

    if not os.path.exists(file_path):
        return jsonify({
            "error": "Experiment history not found"
        }), 404

    df = pd.read_csv(file_path)
    return jsonify(df.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
