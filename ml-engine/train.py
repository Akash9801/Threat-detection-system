import os
import joblib
import numpy as np
from pymongo import MongoClient
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from dotenv import load_dotenv

load_dotenv("../server/.env")

MONGO_URI = os.getenv("MONGO_URI")

MODEL_PATH = "../server/ml_models/isolation_model.pkl"
SCALER_PATH = "../server/ml_models/scaler.pkl"

ANOMALY_THRESHOLD = 0.85

def fetch_baseline_logs():
    client = MongoClient(MONGO_URI)
    db = client.get_database()

    logs_collection = db["logs"]

    # Fetch only normal logs (not attack logs)
    logs = logs_collection.find({
        "sensitive_access": False
    })

    feature_matrix = []

    for log in logs:
        features = [
            log.get("login_hour", 0),
            log.get("files_accessed", 0),
            log.get("download_mb", 0),
            0 if log.get("ip_address") == "192.168.1.10" else 1,
            0 if log.get("device_id") == "DEV883" else 1
        ]
        feature_matrix.append(features)

    return feature_matrix

def train():
    training_data = fetch_baseline_logs()

    if len(training_data) < 10:
        print("Not enough baseline data to train.")
        return

    X = np.array(training_data)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )

    model.fit(X_scaled)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print("Model trained successfully on", len(training_data), "samples")

if __name__ == "__main__":
    train()
