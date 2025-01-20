# backend/app/main.py

import pandas as pd
import numpy as np
from fastapi import FastAPI, UploadFile, Form
from io import StringIO, BytesIO
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MonthlyData(BaseModel):
    month: str
    volume: float
    revenue: float
    profit: float


class OptimizationResult(BaseModel):
    optimalPrice: float
    totalRevenue: float
    totalProfit: float
    monthlyData: List[MonthlyData]
    averageVolume: float


def calculate_average_volume(monthly_data: List[MonthlyData]) -> float:
    """Calculate the average volume across all months"""
    if not monthly_data:
        return 0.0
    total_volume = sum(month.volume for month in monthly_data)
    return round(total_volume / len(monthly_data), 2)


def process_historical_data(df: pd.DataFrame) -> pd.Series:
    """
    Process historical data to get average monthly volumes.
    Input DataFrame has products as rows and months as columns.
    Returns a Series with average volume per month.
    """
    # Remove the 'Product Name' column
    volume_data = df.drop("Product Name", axis=1)

    # Calculate mean volume for each month across all products
    monthly_averages = volume_data.mean()

    return monthly_averages


def calculate_probability(
        price: float, viable_price: float, max_price: float
        ) -> float:
    """
    Calculate purchase probability using triangular distribution
    At viable_price: probability = 1
    At max_price: probability = 0
    Linear decrease between these points
    """
    if price <= viable_price:
        return 1.0
    elif price >= max_price:
        return 0.0
    else:
        return 1.0 - ((price - viable_price) / (max_price - viable_price))


def optimize_price(
    historical_data: pd.DataFrame,
    production_cost: float,
    viable_price: float,
    max_price: float,
) -> OptimizationResult:
    """
    Find optimal price that maximizes profit based on historical sales data
    """
    # Process historical data to get monthly averages
    monthly_averages = process_historical_data(historical_data)

    # Test different price points
    price_points = np.linspace(production_cost, max_price, 100)
    max_profit = float("-inf")
    optimal_price = None
    optimal_monthly_data = None

    for price in price_points:
        # Skip if price is below production cost
        if price <= production_cost:
            continue

        # Calculate probability of purchase at this price
        prob = calculate_probability(price, viable_price, max_price)

        # Calculate monthly profits and create visualization data
        monthly_data = []
        total_profit = 0

        for month, avg_volume in monthly_averages.items():
            expected_volume = avg_volume * prob
            monthly_revenue = expected_volume * price
            monthly_profit = monthly_revenue - (
                expected_volume * production_cost
                )
            total_profit += monthly_profit

            monthly_data.append(
                MonthlyData(
                    month=month,
                    volume=round(expected_volume, 2),
                    revenue=round(monthly_revenue, 2),
                    profit=round(monthly_profit, 2),
                )
            )

        if total_profit > max_profit:
            max_profit = total_profit
            optimal_price = price
            optimal_monthly_data = monthly_data

    if optimal_price is None or max_profit <= 0:
        raise ValueError(
            "No viable price point found that would generate profit"
            )

    return OptimizationResult(
        optimalPrice=round(optimal_price, 2),
        totalRevenue=round(sum(
            data.revenue for data in optimal_monthly_data
            ), 2),
        totalProfit=round(max_profit, 2),
        monthlyData=optimal_monthly_data,
        averageVolume=calculate_average_volume(optimal_monthly_data)
    )


@app.post("/api/optimize-sales")
async def optimize_price_endpoint(
    file: UploadFile,
    productionCost: float = Form(...),
    viableSalesPrice: float = Form(...),
    maxSalesPrice: float = Form(...),
):
    try:
        # Read file content
        content = await file.read()

        # Determine file type and read accordingly
        if file.filename.endswith(".csv"):
            df = pd.read_csv(StringIO(content.decode("utf-8")))
        else:  # Excel file
            df = pd.read_excel(BytesIO(content))

        # Validate inputs
        if productionCost <= 0:
            raise ValueError("Production cost must be positive")
        if viableSalesPrice <= productionCost:
            raise ValueError(
                "Viable price must be greater than production cost"
                )
        if maxSalesPrice <= viableSalesPrice:
            raise ValueError("Maximum price must be greater than viable price")

        # Validate data format
        required_columns = [
            "Product Name",
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
        ]
        missing_columns = [
            col for col in required_columns if col not in df.columns
            ]
        if missing_columns:
            raise ValueError(
                f"Missing required columns: {', '.join(missing_columns)}"
                )

        result = optimize_price(
            df, productionCost, viableSalesPrice, maxSalesPrice
            )
        return result

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
