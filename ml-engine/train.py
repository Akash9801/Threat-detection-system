import os
import json
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from feature_engineering import compute_features
from baseline import compute_user_baseline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

logs_path = os.path.join(BASE_DIR, "..", "dataset", "normal_logs.json")
users_path = os.path.join(BASE_DIR, "..", "dataset", "users.json")

df = pd.read_json(logs_path)

with open(users_path) as f:
    users_list = json.load(f)

user_profiles = {u["user_id"]: u for u in users_list}

baselines = compute_user_baseline(df)

X = []

for _, row in df.iterrows():
    log_dict = row.to_dict()
    feats = compute_features(log_dict, baselines, user_profiles)
    X.append(list(feats.values()))

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = IsolationForest(
    n_estimators=200,
    contamination=0.03,
    random_state=42
)

model.fit(X_scaled)

joblib.dump(model, os.path.join(BASE_DIR, "model.pkl"))
joblib.dump(scaler, os.path.join(BASE_DIR, "scaler.pkl"))
baselines.to_csv(os.path.join(BASE_DIR, "user_baseline.csv"), index=False)

print("✅ Model trained successfully")