# comprehensive_data_services.py
import requests
import pandas as pd
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UgandaHealthDataService:
    """Service for fetching and processing Uganda health data from WHO API"""
    
    def __init__(self):
        self.base_url = "https://ghoapi.azureedge.net/api"
        self.country_code = "UGA"  # Uganda
        
    def get_health_data(self):
        """Get comprehensive health data for Uganda"""
        try:
            # Key health indicators for Uganda
            indicators = [
                'WHOSIS_000001',  # Life expectancy at birth
                'WHOSIS_000015',  # Infant mortality rate
                'MDG_0000000001', # Maternal mortality ratio
                'NUTRITION_ANAEMIA_CHILDREN_PREV', # Anaemia in children
                'WHS9_86',        # Tuberculosis incidence
                'MALARIA_EST_DEATHS', # Malaria deaths
                'HIV_0000000026'  # HIV prevalence
            ]
            
            all_data = []
            
            for indicator in indicators:
                try:
                    url = f"{self.base_url}/{indicator}?$filter=SpatialDim eq '{self.country_code}'"
                    response = requests.get(url, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if 'value' in data and data['value']:
                            processed_data = self._process_indicator_data(data['value'], indicator)
                            all_data.extend(processed_data)
                    else:
                        logger.warning(f"Failed to fetch data for {indicator}: {response.status_code}")
                        
                except requests.exceptions.RequestException as e:
                    logger.error(f"Request failed for {indicator}: {str(e)}")
                    continue
            
            return {
                'status': 'success',
                'data': all_data,
                'country': 'Uganda',
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in get_health_data: {str(e)}")
            return {
                'status': 'error',
                'message': str(e),
                'data': []
            }
    
    def _process_indicator_data(self, data, indicator_code):
        """Process individual indicator data"""
        processed = []
        
        for item in data:
            try:
                processed_item = {
                    'indicator_code': indicator_code,
                    'indicator_name': item.get('IndicatorCode', ''),
                    'country': 'Uganda',
                    'year': item.get('TimeDim', ''),
                    'value': item.get('NumericValue'),
                    'display_value': item.get('DisplayValue', ''),
                    'dim1': item.get('Dim1', ''),
                    'dim2': item.get('Dim2', ''),
                    'dim3': item.get('Dim3', '')
                }
                processed.append(processed_item)
            except Exception as e:
                logger.error(f"Error processing item: {str(e)}")
                continue
                
        return processed
    
    def get_summary_stats(self, data=None):
        """Get summary statistics"""
        if not data:
            health_data = self.get_health_data()
            data = health_data.get('data', [])
        
        if not data:
            return {
                'total_indicators': 0,
                'latest_year': None,
                'data_points': 0
            }
        
        df = pd.DataFrame(data)
        
        return {
            'total_indicators': len(df['indicator_code'].unique()) if not df.empty else 0,
            'latest_year': df['year'].max() if not df.empty and 'year' in df.columns else None,
            'data_points': len(data),
            'indicators_available': df['indicator_code'].unique().tolist() if not df.empty else []
        }
    
    def get_trends_data(self, data=None):
        """Get trend data for charts"""
        if not data:
            health_data = self.get_health_data()
            data = health_data.get('data', [])
        
        if not data:
            return []
        
        df = pd.DataFrame(data)
        
        # Filter for numeric values and valid years
        df = df.dropna(subset=['value', 'year'])
        df['year'] = pd.to_numeric(df['year'], errors='coerce')
        df = df.dropna(subset=['year'])
        
        trends = []
        
        for indicator in df['indicator_code'].unique():
            indicator_data = df[df['indicator_code'] == indicator]
            indicator_data = indicator_data.sort_values('year')
            
            trend_data = {
                'indicator': indicator,
                'indicator_name': indicator_data['indicator_name'].iloc[0] if not indicator_data.empty else '',
                'data_points': [
                    {
                        'year': int(row['year']),
                        'value': float(row['value'])
                    }
                    for _, row in indicator_data.iterrows()
                    if pd.notna(row['value']) and pd.notna(row['year'])
                ]
            }
            
            if trend_data['data_points']:  # Only add if there's data
                trends.append(trend_data)
        
        return trends

# Create a global instance
uganda_health_service = UgandaHealthDataService()