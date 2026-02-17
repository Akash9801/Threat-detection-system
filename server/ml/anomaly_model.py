import sys
import os
import json
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../ml_models/isolation_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "../ml_models/scaler.pkl")

ANOMALY_THRESHOLD = 0.85

def train(training_data):
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

    print("Model trained successfully")

def predict(features):
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    X = np.array([features])
    X_scaled = scaler.transform(X)

    raw_score = model.decision_function(X_scaled)[0]

    anomaly_score = 1 - (raw_score + 0.5)
    anomaly_score = max(0, min(1, anomaly_score))

    login_hour, files_accessed, download_mb, new_ip, new_device = features

    if new_ip == 1:
        anomaly_score += 0.15

    if new_device == 1:
        anomaly_score += 0.15

    if download_mb > 800:
        anomaly_score += 0.15

    anomaly_score = min(1, anomaly_score)

    result = {
        "score": float(anomaly_score),
        "isAnomaly": bool(anomaly_score >= ANOMALY_THRESHOLD),
        "threshold": float(ANOMALY_THRESHOLD)
    }

    print(json.dumps(result))

if __name__ == "__main__":
    mode = sys.argv[1]
    data = json.loads(sys.argv[2])

    if mode == "train":
        train(data)
    elif mode == "predict":
        predict(data)
