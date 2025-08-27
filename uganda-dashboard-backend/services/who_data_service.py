import requests
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional

class WHODataService:
    def __init__(self):
        self.base_url = "https://ghoapi.azureedge.net/api/"
        self.country_code = "UGA"  # Uganda's ISO code
        
    async def get_health_indicators(self, indicator_codes: List[str], start_year: int = 2018, end_year: int = 2023):
        """
        Fetch health indicators from WHO GHO API asynchronously
        """
        results = {}
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for indicator in indicator_codes:
                task = self._fetch_indicator(session, indicator, start_year, end_year)
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, response in enumerate(responses):
                indicator = indicator_codes[i]
                if isinstance(response, Exception):
                    print(f"Error fetching {indicator}: {response}")
                    results[indicator] = None
                else:
                    results[indicator] = response
                    
        return results
    
    async def _fetch_indicator(self, session: aiohttp.ClientSession, indicator: str, start_year: int, end_year: int):
        """Fetch single indicator data"""
        try:
            url = f"{self.base_url}{indicator}"
            params = {
                '$filter': f"SpatialDim eq '{self.country_code}' and TimeDim ge {start_year} and TimeDim le {end_year}"
            }
            
            async with session.get(url, params=params, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    if 'value' in data:
                        return self.process_indicator_data(data['value'])
                return None
                
        except Exception as e:
            raise e
    
    def process_indicator_data(self, raw_data: List[Dict]) -> List[Dict]:
        """Process and clean WHO API response data"""
        processed = []
        
        for item in raw_data:
            processed_item = {
                'year': item.get('TimeDim'),
                'value': item.get('NumericValue'),
                'display_value': item.get('DisplayValue'),
                'indicator': item.get('IndicatorCode'),
                'country': item.get('SpatialDim'),
                'date_modified': item.get('DateModified')
            }
            processed.append(processed_item)
            
        # Sort by year
        return sorted(processed, key=lambda x: x['year'] or 0)
    
    async def get_uganda_health_summary(self) -> Dict:
        """Get key health indicators specifically for Uganda"""
        key_indicators = [
            'WHOSIS_000001',  # Life expectancy
            'MDG_0000000001', # Under-5 mortality
            'WHOSIS_000015',  # Maternal mortality
            'WHS4_100',       # Physicians density
        ]
        
        return await self.get_health_indicators(key_indicators)

class WorldBankHealthService:
    def __init__(self):
        self.base_url = "https://api.worldbank.org/v2/country/UGA/indicator/"
        
    async def get_indicator(self, indicator_code: str, start_year: int = 2018, end_year: int = 2023) -> List[Dict]:
        """Fetch indicator from World Bank API asynchronously"""
        url = f"{self.base_url}{indicator_code}"
        params = {
            'format': 'json',
            'date': f"{start_year}:{end_year}",
            'per_page': 100
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if len(data) > 1 and data[1]:
                            return [
                                {
                                    'year': item['date'],
                                    'value': item['value'],
                                    'indicator': item['indicator']['id'],
                                    'indicator_name': item['indicator']['value']
                                }
                                for item in data[1] if item['value'] is not None
                            ]
            return []
            
        except Exception as e:
            print(f"Error fetching World Bank data: {e}")
            return []
    
    async def get_multiple_indicators(self, indicator_codes: Dict[str, str]) -> Dict:
        """Fetch multiple indicators concurrently"""
        results = {}
        
        tasks = []
        for code, name in indicator_codes.items():
            task = self.get_indicator(code)
            tasks.append((code, task))
        
        responses = await asyncio.gather(*[task for _, task in tasks], return_exceptions=True)
        
        for i, response in enumerate(responses):
            code = tasks[i][0]
            if isinstance(response, Exception):
                print(f"Error fetching {code}: {response}")
                results[code] = []
            else:
                results[code] = response
                
        return results