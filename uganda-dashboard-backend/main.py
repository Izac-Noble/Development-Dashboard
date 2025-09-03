# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import logging

# Import your service
from comprehensive_data_services import uganda_health_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Uganda Health Dashboard API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (your React build)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return {"message": "Uganda Health Dashboard API", "version": "1.0.0"}

@app.get("/api/uganda/health")
async def get_uganda_health():
    """Get comprehensive Uganda health data"""
    try:
        logger.info("Fetching Uganda health data...")
        data = uganda_health_service.get_health_data()
        logger.info(f"Successfully fetched {len(data.get('data', []))} data points")
        return data
    except Exception as e:
        logger.error(f"Error fetching Uganda health data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/uganda/summary")
async def get_health_summary():
    """Get health data summary statistics"""
    try:
        logger.info("Fetching health summary...")
        # First get the health data
        health_data = uganda_health_service.get_health_data()
        
        if health_data['status'] == 'error':
            raise HTTPException(status_code=500, detail=health_data['message'])
        
        # Then get summary stats
        summary = uganda_health_service.get_summary_stats(health_data['data'])
        logger.info("Successfully fetched health summary")
        
        return {
            'status': 'success',
            'summary': summary,
            'last_updated': health_data['last_updated']
        }
    except Exception as e:
        logger.error(f"Error fetching health summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/uganda/trends")
async def get_trend_data():
    """Get trend data for charts"""
    try:
        logger.info("Fetching trend data...")
        # First get the health data
        health_data = uganda_health_service.get_health_data()
        
        if health_data['status'] == 'error':
            raise HTTPException(status_code=500, detail=health_data['message'])
        
        # Then get trends
        trends = uganda_health_service.get_trends_data(health_data['data'])
        logger.info(f"Successfully fetched {len(trends)} trend datasets")
        
        return {
            'status': 'success',
            'trends': trends,
            'last_updated': health_data['last_updated']
        }
    except Exception as e:
        logger.error(f"Error fetching trend data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/uganda/indicators")
async def get_all_indicators():
    """Get all available health indicators"""
    try:
        logger.info("Fetching all indicators...")
        health_data = uganda_health_service.get_health_data()
        
        if health_data['status'] == 'error':
            raise HTTPException(status_code=500, detail=health_data['message'])
        
        # Extract unique indicators
        indicators = {}
        for item in health_data['data']:
            code = item['indicator_code']
            if code not in indicators:
                indicators[code] = {
                    'code': code,
                    'name': item['indicator_name'],
                    'data_points': 0
                }
            indicators[code]['data_points'] += 1
        
        return {
            'status': 'success',
            'indicators': list(indicators.values()),
            'total_count': len(indicators)
        }
    except Exception as e:
        logger.error(f"Error fetching indicators: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/uganda/indicators/{indicator_code}")
async def get_specific_indicator(indicator_code: str):
    """Get data for a specific indicator"""
    try:
        logger.info(f"Fetching data for indicator: {indicator_code}")
        health_data = uganda_health_service.get_health_data()
        
        if health_data['status'] == 'error':
            raise HTTPException(status_code=500, detail=health_data['message'])
        
        # Filter for specific indicator
        indicator_data = [
            item for item in health_data['data'] 
            if item['indicator_code'] == indicator_code
        ]
        
        if not indicator_data:
            raise HTTPException(status_code=404, detail=f"Indicator {indicator_code} not found")
        
        return {
            'status': 'success',
            'indicator_code': indicator_code,
            'data': indicator_data,
            'total_points': len(indicator_data)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching indicator {indicator_code}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Uganda Health Dashboard API"}

# Catch-all route for React Router (serve index.html for client-side routing)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Serve React app for client-side routing"""
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    index_file = "static/index.html"
    if os.path.exists(index_file):
        return FileResponse(index_file)
    else:
        return {"message": "React app not built. Run 'npm run build' first."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")