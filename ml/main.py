from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import os
import numpy as np
from model_trainer import train_and_save_model

app = FastAPI(title="EduInsight ML Risk Classifier Microservice", version="1.0.0")

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

# Load or train model on startup
if not os.path.exists(MODEL_PATH):
    model = train_and_save_model()
else:
    try:
        model = joblib.load(MODEL_PATH)
    except Exception:
        model = train_and_save_model()

class StudentPredictionInput(BaseModel):
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage (0-100)")
    avg_assessment_score: float = Field(..., ge=0, le=100, description="Average assessment score (0-100)")
    lms_logins: int = Field(..., ge=0, description="Number of LMS activity logins")

class PredictionResponse(BaseModel):
    risk_level: str
    confidence_score: float
    probabilities: dict
    source: str = "FastAPI ML Microservice (Decision Tree)"

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "EduInsight ML Service", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict_student_risk(input_data: StudentPredictionInput):
    try:
        features = np.array([[
            input_data.attendance,
            input_data.avg_assessment_score,
            input_data.lms_logins
        ]])

        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        classes = model.classes_

        prob_dict = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
        max_prob = float(np.max(probabilities))

        return PredictionResponse(
            risk_level=prediction,
            confidence_score=round(max_prob, 2),
            probabilities=prob_dict
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
