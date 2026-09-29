import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib
import os

def train_and_save_model():
    np.random.seed(42)
    n_samples = 500

    # Synthetic data generation matching academic patterns
    attendance = np.random.uniform(50, 100, n_samples)
    avg_assessment = np.random.uniform(30, 95, n_samples)
    lms_logins = np.random.randint(5, 60, n_samples)

    risk_labels = []
    for att, score, lms in zip(attendance, avg_assessment, lms_logins):
        if att < 70 or score < 50 or lms < 15:
            risk_labels.append('high')
        elif att < 80 or score < 68 or lms < 25:
            risk_labels.append('medium')
        else:
            risk_labels.append('low')

    df = pd.DataFrame({
        'attendance': attendance,
        'avg_assessment_score': avg_assessment,
        'lms_logins': lms_logins,
        'risk_label': risk_labels
    })

    X = df[['attendance', 'avg_assessment_score', 'lms_logins']]
    y = df['risk_label']

    clf = DecisionTreeClassifier(max_depth=4, random_state=42)
    clf.fit(X, y)

    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(clf, model_path)
    print(f"Decision Tree classifier model successfully saved to {model_path}")
    return clf

if __name__ == '__main__':
    train_and_save_model()
