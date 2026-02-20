import os
import json
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from feature_engineering import compute_features
from baseline import compute_user_baseline

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

logs_path = os.path.join(BASE_DIR, "..", "dataset", "normal_logs.json")
users_path = os.path.join(BASE_DIR, "..", "dataset", "users.json")

# Load data
df = pd.read_json(logs_path)

with open(users_path) as f:
    users_list = json.load(f)

user_profiles = {u["user_id"]: u for u in users_list}

# Compute baselines
baselines = compute_user_baseline(df)

# Generate training feature matrix
X = []

for _, row in df.iterrows():
    log_dict = row.to_dict()
    feats = compute_features(log_dict, baselines, user_profiles)
    X.append(list(feats.values()))

# Train model
model = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)

model.fit(X)

# Save artifacts
joblib.dump(model, os.path.join(BASE_DIR, "model.pkl"))
baselines.to_csv(os.path.join(BASE_DIR, "user_baseline.csv"), index=False)

print("✅ Model trained successfully.")
