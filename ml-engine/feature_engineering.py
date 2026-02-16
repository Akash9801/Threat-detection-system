import pandas as pd

def compute_features(log: dict, baseline_df: pd.DataFrame, user_profiles: dict):
    """
    Convert raw log JSON into 6D feature vector.

    Required Features:
    1. login_time_z
    2. file_access_z
    3. download_z
    4. new_ip_flag
    5. new_device_flag
    6. sensitive_access_flag
    """

    user_id = log["user_id"]

   
    user_base = baseline_df[baseline_df["user_id"] == user_id]

    if user_base.empty:
        raise ValueError(f"Baseline not found for user: {user_id}")

    user_base = user_base.iloc[0]

  
    login_time_z = (
        (log["login_hour"] - user_base["login_mean"]) /
        (user_base["login_std"] + 1e-6)
    )

    file_access_z = (
        (log["files_accessed"] - user_base["files_mean"]) /
        (user_base["files_std"] + 1e-6)
    )

    download_z = (
        (log["download_mb"] - user_base["download_mean"]) /
        (user_base["download_std"] + 1e-6)
    )

    user_profile = user_profiles.get(user_id)

    if not user_profile:
        raise ValueError(f"User profile not found for user: {user_id}")

    known_ips = [
        user_profile.get("primary_ip"),
        user_profile.get("secondary_ip")
    ]

    known_devices = [
        user_profile.get("primary_device"),
        user_profile.get("secondary_device")
    ]

    new_ip_flag = 0 if log["ip_address"] in known_ips else 1
    new_device_flag = 0 if log["device_id"] in known_devices else 1

    
    sensitive_access_flag = 1 if log["sensitive_access"] else 0

  
    features = {
        "login_time_z": float(login_time_z),
        "file_access_z": float(file_access_z),
        "download_z": float(download_z),
        "new_ip_flag": int(new_ip_flag),
        "new_device_flag": int(new_device_flag),
        "sensitive_access_flag": int(sensitive_access_flag)
    }

    return features
