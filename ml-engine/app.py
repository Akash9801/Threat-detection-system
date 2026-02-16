from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_anomaly

app = FastAPI(title="Insider Threat ML Service")

class Log(BaseModel):
    log_id: str
    timestamp: str
    user_id: str
    login_hour: float
    files_accessed: float
    download_mb: float
    ip_address: str
    device_id: str
    sensitive_access: bool
    primary_ip: str = None
    secondary_ip: str = None
    primary_device: str = None
    secondary_device: str = None

@app.post("/predict")
def predict(log: Log):
    result = predict_anomaly(log.dict())
    return result
