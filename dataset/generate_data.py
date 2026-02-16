import json
import random
import uuid
import datetime
import numpy as np

USERS = []
LOGS = []



for i in range(20):
    uid = f"user_{i+1}"

    mu_login = random.uniform(8, 10)
    mu_files = random.randint(15, 30)
    mu_download = mu_files * 3

    user = {
        "user_id": uid,
        "name": f"User {i+1}",
        "department": random.choice(["IT", "HR", "Finance", "Ops"]),
        "primary_ip": f"10.0.{i}.1",
        "secondary_ip": f"10.0.{i}.2",
        "primary_device": f"DEV-{i}",
        "secondary_device": f"LAP-{i}",
        "mu_login": mu_login,
        "mu_files": mu_files,
        "mu_download": mu_download
    }

    USERS.append(user)



for user in USERS:
    for d in range(7):
        for s in range(2):

            login_hour = np.random.normal(user["mu_login"], 1)
            login_hour = max(0, abs(login_hour))

            files = np.random.normal(user["mu_files"], 0.25 * user["mu_files"])
            files = max(1, abs(files))

            download_mean = files * 3
            download_std = abs(download_mean * 0.3)

            download = np.random.normal(download_mean, download_std)
            download = max(1, abs(download))

            log = {
                "log_id": str(uuid.uuid4()),
                "timestamp": (
                    datetime.datetime.now() -
                    datetime.timedelta(days=d)
                ).isoformat(),
                "user_id": user["user_id"],
                "login_hour": float(round(login_hour, 2)),
                "files_accessed": float(round(files, 2)),
                "download_mb": float(round(download, 2)),
                "ip_address": random.choice(
                    [user["primary_ip"], user["secondary_ip"]]
                ),
                "device_id": (
                    user["primary_device"]
                    if random.random() < 0.9
                    else user["secondary_device"]
                ),
                "sensitive_access": random.random() < 0.05
            }

            LOGS.append(log)



with open("users.json", "w") as f:
    json.dump(USERS, f, indent=2)

with open("normal_logs.json", "w") as f:
    json.dump(LOGS, f, indent=2)

print("✅ Generated users.json and normal_logs.json successfully.")
