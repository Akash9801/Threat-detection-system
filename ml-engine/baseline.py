import pandas as pd

def compute_user_baseline(df):
    baselines = df.groupby("user_id").agg({
        "login_hour": ["mean","std"],
        "files_accessed": ["mean","std"],
        "download_mb": ["mean","std"]
    })
    
    baselines.columns = ["login_mean","login_std","files_mean","files_std","download_mean","download_std"]
    return baselines.reset_index()
