import os
import json
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
from baseline import compute_user_baseline
from feature_engineering import compute_features

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(BASE_DIR, "..", "dataset", "normal_logs.json")
users_path = os.path.join(BASE_DIR, "..", "dataset", "users.json")

df = pd.read_json(data_path)

with open(users_path) as f:
    users_list = json.load(f)

user_profiles = {u["user_id"]: u for u in users_list}

baselines = compute_user_baseline(df)

X = []
for _, row in df.iterrows():
    feats = compute_features(row.to_dict(), baselines, user_profiles)
    X.append(list(feats.values()))

model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
model.fit(X)

joblib.dump(model, "model.pkl")
baselines.to_csv("user_baseline.csv", index=False)
