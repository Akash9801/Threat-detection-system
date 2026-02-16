import os
import json
import joblib
import pandas as pd
from feature_engineering import compute_features

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
users_path = os.path.join(BASE_DIR, "..", "dataset", "users.json")

model = joblib.load("model.pkl")
baselines = pd.read_csv("user_baseline.csv")

with open(users_path) as f:
    users_list = json.load(f)

user_profiles = {u["user_id"]: u for u in users_list}

def predict_anomaly(log):
    feats = compute_features(log, baselines, user_profiles)
    X = [list(feats.values())]
    pred = model.predict(X)[0]
    score = model.decision_function(X)[0]
    return {
        "anomaly_score": float(score),
        "prediction": int(pred),
        "feature_breakdown": feats
    }
