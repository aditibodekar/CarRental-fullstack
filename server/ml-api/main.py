from fastapi import FastAPI
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

app = FastAPI()

# Load dataset
df = pd.read_csv("data.csv")

# Create datetime column
df['datetime'] = pd.to_datetime(
    df['date'] + ' ' + df['hour'].astype(str) + ':00:00'
)

# Convert hourly → daily
df = df.resample('D', on='datetime').sum()

# Keep only demand
df = df[['demand']]

# Rename column
df.rename(columns={'demand': 'bookings'}, inplace=True)

# Sort data
df = df.sort_index()


@app.get("/predict")
def predict():
    return {
        "success": True,
        "predictions": [
            {
                "car": "Innova",
                "prediction": [1800, 1900, 2000, 2100, 2200, 2300, 2400]
            },
            {
                "car": "Swift",
                "prediction": [1500, 1600, 1700, 1650, 1800, 1750, 1900]
            }
        ]
    }