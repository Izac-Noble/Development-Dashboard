# uganda-dashboard-backend/main.py - SIMPLIFIED VERSION
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Uganda Dashboard API - Simple Version")

# Enable CORS for your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple data storage (in real app, use a database)
MOCK_DATA = {
    "health": {
        "status": "success",
        "data": {
            "life_expectancy": 63.4,
            "infant_mortality": 34.2,
            "hospitals": 127,
            "health_centers": 1200
        },
        "last_updated": datetime.now().isoformat()
    },
    "summary": {
        "status": "success",
        "summary": {
            "total_indicators": 8,
            "latest_year": 2023,
            "data_points": 45
        },
        "last_updated": datetime.now().isoformat()
    },
    "trends": {
        "status": "success",
        "trends": [
            {
                "indicator": "life_expectancy",
                "data_points": [
                    {"year": 2018, "value": 61.2},
                    {"year": 2019, "value": 62.1},
                    {"year": 2020, "value": 62.8},
                    {"year": 2021, "value": 63.1},
                    {"year": 2022, "value": 63.4}
                ]
            }
        ],
        "last_updated": datetime.now().isoformat()
    }
}

# Helper function to fetch from external APIs (optional)
def fetch_external_data(url):
    """Fetch data from external APIs like WHO"""
    try:
        logger.info(f"Fetching from external API: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch from {url}: {str(e)}")
        return None

@app.get("/")
async def root():
    return {"message": "Uganda Dashboard API - Simple Version", "status": "running"}

@app.get("/api/uganda/health")
async def get_uganda_health():
    """Get Uganda health data"""
    try:
        logger.info("Fetching Uganda health data...")
        
        # Getting data from WHO
        who_url = "https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim eq 'USA'"
        external_data = fetch_external_data(who_url)
        
        if external_data and external_data.get('value'):
            # If we got real data, use it
            logger.info("Using real WHO data")
            return {
                "status": "success",
                "source": "WHO API",
                "data": external_data,
                "last_updated": datetime.now().isoformat()
            }
        else:
            # Fall back to mock data
            logger.info("Using mock health data")
            return MOCK_DATA["health"]
            
    except Exception as e:
        logger.error(f"Error in health endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/uganda/summary")
async def get_health_summary():
    """Get health summary"""
    try:
        logger.info("Fetching health summary...")
        return MOCK_DATA["summary"]
    except Exception as e:
        logger.error(f"Error in summary endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/uganda/trends")
async def get_trend_data():
    """Get trend data"""
    try:
        logger.info("Fetching trend data...")
        return MOCK_DATA["trends"]
    except Exception as e:
        logger.error(f"Error in trends endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Generic endpoint - fetch from any URL 
@app.get("/api/proxy")
async def proxy_api(url: str):
    """Proxy any external API call"""
    try:
        logger.info(f"Proxying request to: {url}")
        
        # Basic security check
        allowed_domains = ['api.github.com', 'jsonplaceholder.typicode.com', 'ghoapi.azureedge.net']
        if not any(domain in url for domain in allowed_domains):
            raise HTTPException(status_code=403, detail="Domain not allowed")
        
        data = fetch_external_data(url)
        if data:
            return {"status": "success", "data": data, "source_url": url}
        else:
            raise HTTPException(status_code=502, detail="Failed to fetch from external API")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in proxy endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Simple health check"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Uganda Dashboard API...")
    print("📊 Dashboard will be available at: http://localhost:3000")
    print("🔗 API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")