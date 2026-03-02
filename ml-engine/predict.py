import os
import json
import joblib
import pandas as pd
from feature_engineering import compute_features

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
users_path = os.path.join(BASE_DIR, "..", "dataset", "users.json")

model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
baselines = pd.read_csv(os.path.join(BASE_DIR, "user_baseline.csv"))

with open(users_path) as f:
    users_list = json.load(f)

user_profiles = {u["user_id"]: u for u in users_list}

def predict_anomaly(log):
    feats = compute_features(log, baselines, user_profiles)

    X = [list(feats.values())]
    X_scaled = scaler.transform(X)

    pred = model.predict(X_scaled)[0]
    score = model.decision_function(X_scaled)[0]

    # ---- Severity based on Z-score magnitude ----
    max_z = max(
        abs(feats["login_time_z"]),
        abs(feats["file_access_z"]),
        abs(feats["download_z"])
    )

    if max_z < 4:
        risk_level = "low"
    elif max_z < 8:
        risk_level = "moderate"
    else:
        risk_level = "high"

    return {
        "anomaly_score": float(score),
        "prediction": int(pred),
        "risk_level": risk_level,
        "feature_breakdown": feats
    }