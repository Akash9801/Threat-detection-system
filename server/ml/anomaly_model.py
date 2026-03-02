import sys
import json
import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Adjust this path to where normal_logs.json actually is
DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "data", "normal_logs.json"))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")


def train():
    if not os.path.exists(DATA_PATH):
        print("Clean dataset not found at:", DATA_PATH)
        sys.exit(1)

    with open(DATA_PATH, "r") as f:
        logs = json.load(f)

    df = pd.DataFrame(logs)

    # Ensure required columns exist
    required_columns = [
        "login_hour",
        "files_accessed",
        "download_mb",
        "sensitive_access"
    ]

    for col in required_columns:
        if col not in df.columns:
            print(f"Missing column in training data: {col}")
            sys.exit(1)

    features = df[required_columns]

    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )

    model.fit(features)
    joblib.dump(model, MODEL_PATH)

    print("Model trained successfully.")


def predict():
    if not os.path.exists(MODEL_PATH):
        print("Model not found. Train first.")
        sys.exit(1)

    if len(sys.argv) < 3:
        print("No input data provided.")
        sys.exit(1)

    model = joblib.load(MODEL_PATH)
    log = json.loads(sys.argv[2])

    data = [[
        log["login_hour"],
        log["files_accessed"],
        log["download_mb"],
        int(log["sensitive_access"])
    ]]

    prediction = model.predict(data)
    print(prediction[0])


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Mode not provided.")
        sys.exit(1)

    mode = sys.argv[1]

    if mode == "train":
        train()
    elif mode == "predict":
        predict()
    else:
        print("Invalid mode.")
        sys.exit(1)
