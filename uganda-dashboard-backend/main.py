# uganda-dashboard-backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import asyncio

from comprehensive_data_services import UgandaDataService, DataProcessor

app = FastAPI(title="Uganda Development Dashboard API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize service and processor
uganda_service = UgandaDataService()
data_processor = DataProcessor()


@app.get("/")
async def root():
    return {"message": "Uganda Development Dashboard API", "status": "running"}


@app.get("/api/health")
async def get_health_data():
    """Get health indicators (WHO + World Bank)"""
    try:
        # Fetch WHO + World Bank health data concurrently
        world_bank_data, who_data = await asyncio.gather(
            uganda_service.get_health_data(),
            uganda_service.get_health_data()  # For now using same WB data, can replace with WHO API fetch later
        )

        # Format data for frontend
        formatted_wb = {}
        for code, indicator in world_bank_data.items():
            formatted_wb[code] = indicator.get('data', [])

        formatted_who = {}
        for code, indicator in who_data.items():
            formatted_who[code] = indicator.get('data', [])

        return {
            "world_bank_data": formatted_wb,
            "who_data": formatted_who,
            "last_updated": datetime.now().isoformat(),
            "country": "Uganda",
            "country_code": "UG"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching health data: {str(e)}")


@app.get("/api/health/trends")
async def get_health_trends(years: int = 5):
    """Get trend data for health indicators"""
    try:
        health_data = await uganda_service.get_health_data()
        current_year = datetime.now().year
        trends = {}

        for code, indicator in health_data.items():
            data_points = indicator.get('data', [])
            filtered = [item for item in data_points if item['year'] and int(item['year']) >= (current_year - years)]
            if filtered:
                growth_rate = data_processor.calculate_growth_rate(filtered)
                trends[code] = {
                    "name": indicator['name'],
                    "data": filtered,
                    "growth_rate": growth_rate
                }

        return {
            "trends": trends,
            "period": f"{current_year - years}-{current_year}",
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching health trends: {str(e)}")


@app.get("/api/education")
async def get_education_data():
    """Get education statistics (World Bank + UNESCO)"""
    try:
        education_data = await uganda_service.get_education_data()

        formatted_education = {}
        for code, indicator in education_data.items():
            formatted_education[code] = indicator.get('data', [])

        return {
            "education_data": formatted_education,
            "last_updated": datetime.now().isoformat(),
            "country": "Uganda",
            "country_code": "UG",
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching education data: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)