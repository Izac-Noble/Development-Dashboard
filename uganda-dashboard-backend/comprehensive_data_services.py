import requests
import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional

class UgandaDataService:
    def __init__(self):
        self.country_code = "UGA"
        self.country_code_iso2 = "UG"
        
        # API Base URLs
        self.world_bank_url = "https://api.worldbank.org/v2/country/UGA/indicator/"
        self.unesco_url = "https://api.uis.unesco.org/sdg/"
        self.who_url = "https://ghoapi.azureedge.net/api/"
        self.rest_countries_url = "https://restcountries.com/v3.1/alpha/UG"
        
    async def get_education_data(self):
        """Get education statistics from World Bank and UNESCO"""
        education_indicators = {
            # World Bank Education Indicators
            'SE.PRM.NENR': 'Primary school enrollment rate (%)',
            'SE.SEC.NENR': 'Secondary school enrollment rate (%)',
            'SE.ADT.LITR.ZS': 'Adult literacy rate (%)',
            'SE.PRM.CMPT.ZS': 'Primary completion rate (%)',
            'SE.SEC.CMPT.LO.ZS': 'Lower secondary completion rate (%)',
            'SE.XPD.TOTL.GD.ZS': 'Government expenditure on education (% of GDP)',
            'SE.PRM.TCHR': 'Primary school teachers',
            'SE.SEC.TCHR': 'Secondary school teachers',
        }
        
        return await self._fetch_world_bank_indicators(education_indicators)
    
    async def get_economic_data(self):
        """Get economic indicators"""
        economic_indicators = {
            'NY.GDP.MKTP.CD': 'GDP (current US$)',
            'NY.GDP.PCAP.CD': 'GDP per capita (current US$)',
            'SL.UEM.TOTL.ZS': 'Unemployment rate (%)',
            'SL.AGR.EMPL.ZS': 'Employment in agriculture (%)',
            'NV.AGR.TOTL.ZS': 'Agriculture value added (% of GDP)',
            'NV.IND.TOTL.ZS': 'Industry value added (% of GDP)',
            'NV.SRV.TOTL.ZS': 'Services value added (% of GDP)',
            'FP.CPI.TOTL.ZG': 'Inflation rate (%)',
            'BX.KLT.DINV.CD.WD': 'Foreign direct investment',
        }
        
        return await self._fetch_world_bank_indicators(economic_indicators)
    
    async def get_demographic_data(self):
        """Get population and demographic data"""
        demographic_indicators = {
            'SP.POP.TOTL': 'Total population',
            'SP.POP.GROW': 'Population growth rate (%)',
            'SP.DYN.TFRT.IN': 'Fertility rate (births per woman)',
            'SP.POP.0014.TO.ZS': 'Population ages 0-14 (% of total)',
            'SP.POP.1564.TO.ZS': 'Population ages 15-64 (% of total)',
            'SP.POP.65UP.TO.ZS': 'Population ages 65+ (% of total)',
            'SP.URB.TOTL.IN.ZS': 'Urban population (% of total)',
            'SP.RUR.TOTL.ZS': 'Rural population (% of total)',
            'SP.POP.DPND': 'Age dependency ratio',
        }
        
        return await self._fetch_world_bank_indicators(demographic_indicators)
    
    async def get_infrastructure_data(self):
        """Get infrastructure and technology indicators"""
        infrastructure_indicators = {
            'EG.ELC.ACCS.ZS': 'Access to electricity (% of population)',
            'SH.H2O.BASW.ZS': 'Access to basic drinking water (%)',
            'SH.STA.BASS.ZS': 'Access to basic sanitation (%)',
            'IT.NET.USER.ZS': 'Internet users (% of population)',
            'IT.CEL.SETS.P2': 'Mobile cellular subscriptions (per 100 people)',
            'IS.ROD.PAVE.ZS': 'Roads, paved (% of total roads)',
            'IS.AIR.PSGR': 'Air transport, passengers carried',
        }
        
        return await self._fetch_world_bank_indicators(infrastructure_indicators)
    
    async def _fetch_who_indicator(self, indicator_code: str):
        """Fetch single indicator from WHO API"""
        url = f"{self.who_url}{indicator_code}"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        return [
                            {
                                'year': item.get('TimeDim', None),
                                'value': item.get('NumericValue', None),
                                'indicator': indicator_code,
                                'indicator_name': item.get('IndicatorName', 'WHO Indicator')
                            }
                            for item in data.get('value', []) if item.get('SpatialDim') == self.country_code_iso2
                        ]
            return []
        except Exception as e:
            print(f"Error fetching WHO {indicator_code}: {e}")
            return []
        
    async def _fetch_unesco_data(self, indicator_code: str):
        """Fetch UNESCO UIS indicator data"""
        url = f"{self.unesco_url}{indicator_code}"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        return [
                            {
                                'year': item.get('TIME_PERIOD'),
                                'value': item.get('OBS_VALUE'),
                                'indicator': indicator_code,
                                'indicator_name': item.get('Indicator', 'UNESCO Indicator')
                            }
                            for item in data.get('data', []) if item.get('REF_AREA') == self.country_code_iso2
                        ]
            return []
        except Exception as e:
            print(f"Error fetching UNESCO {indicator_code}: {e}")
            return []    

    async def get_health_data(self):
        """Get health indicators (WHO + World Bank)"""
        health_indicators = {
            'SP.DYN.LE00.IN': 'Life expectancy at birth',
            'SH.STA.MORT': 'Under-5 mortality rate',
            'SH.STA.MMRT': 'Maternal mortality ratio',
            'SH.MED.PHYS.ZS': 'Physicians per 1,000 people',
            'SH.XPD.CHEX.GD.ZS': 'Health expenditure (% of GDP)',
            'SH.IMM.MEAS': 'Measles immunization (%)',
            'SH.STA.MALN.ZS': 'Malnutrition prevalence (%)',
        }
        
        return await self._fetch_world_bank_indicators(health_indicators)
    
    async def get_environment_data(self):
        """Get environmental indicators"""
        environment_indicators = {
            'AG.LND.FRST.ZS': 'Forest area (% of land area)',
            'EN.ATM.CO2E.PC': 'CO2 emissions per capita',
            'ER.H2O.FWTL.K3': 'Annual freshwater withdrawals',
            'AG.LND.AGRI.ZS': 'Agricultural land (% of land area)',
            'EN.POP.DNST': 'Population density',
            'NY.GDP.DEFL.KD.ZG': 'GDP deflator growth rate',
        }
        
        return await self._fetch_world_bank_indicators(environment_indicators)
    
    async def _fetch_world_bank_indicators(self, indicators: Dict[str, str], start_year: int = 2018, end_year: int = 2023):
        """Fetch multiple indicators from World Bank API"""
        results = {}
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for code, name in indicators.items():
                task = self._fetch_single_wb_indicator(session, code, name, start_year, end_year)
                tasks.append((code, task))
            
            responses = await asyncio.gather(*[task for _, task in tasks], return_exceptions=True)
            
            for i, response in enumerate(responses):
                code = tasks[i][0]
                if isinstance(response, Exception):
                    print(f"Error fetching {code}: {response}")
                    results[code] = {'name': indicators[code], 'data': []}
                else:
                    results[code] = {
                        'name': indicators[code],
                        'data': response
                    }
                    
        return results
    
    async def _fetch_single_wb_indicator(self, session: aiohttp.ClientSession, indicator_code: str, name: str, start_year: int, end_year: int):
        """Fetch single indicator from World Bank"""
        url = f"{self.world_bank_url}{indicator_code}"
        params = {
            'format': 'json',
            'date': f"{start_year}:{end_year}",
            'per_page': 100
        }
        
        try:
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
            print(f"Error fetching {indicator_code}: {e}")
            return []
    
    async def get_country_profile(self):
        """Get basic country information"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.rest_countries_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        country_info = data[0] if data else {}
                        
                        return {
                            'name': country_info.get('name', {}).get('common', 'Uganda'),
                            'official_name': country_info.get('name', {}).get('official', 'Republic of Uganda'),
                            'capital': country_info.get('capital', ['Kampala'])[0] if country_info.get('capital') else 'Kampala',
                            'region': country_info.get('region', 'Africa'),
                            'subregion': country_info.get('subregion', 'Eastern Africa'),
                            'languages': country_info.get('languages', {}),
                            'currencies': country_info.get('currencies', {}),
                            'area': country_info.get('area', 241038),  # km²
                            'borders': country_info.get('borders', []),
                            'timezones': country_info.get('timezones', []),
                            'flag': country_info.get('flags', {}).get('png', ''),
                        }
        except Exception as e:
            print(f"Error fetching country profile: {e}")
            return {'name': 'Uganda', 'capital': 'Kampala'}
    
    async def get_comprehensive_dashboard_data(self):
        """Get all data for comprehensive dashboard"""
        try:
            # Fetch all data concurrently
            results = await asyncio.gather(
                self.get_country_profile(),
                self.get_demographic_data(),
                self.get_economic_data(),
                self.get_education_data(),
                self.get_health_data(),
                self.get_infrastructure_data(),
                self.get_environment_data(),
                return_exceptions=True
            )
            
            # Process results
            dashboard_data = {
                'country_profile': results[0] if not isinstance(results[0], Exception) else {},
                'demographics': results[1] if not isinstance(results[1], Exception) else {},
                'economics': results[2] if not isinstance(results[2], Exception) else {},
                'education': results[3] if not isinstance(results[3], Exception) else {},
                'health': results[4] if not isinstance(results[4], Exception) else {},
                'infrastructure': results[5] if not isinstance(results[5], Exception) else {},
                'environment': results[6] if not isinstance(results[6], Exception) else {},
                'last_updated': datetime.now().isoformat(),
                'status': 'success'
            }
            
            return dashboard_data
            
        except Exception as e:
            raise Exception(f"Error fetching comprehensive data: {str(e)}")

# Utility class for data processing
class DataProcessor:
    @staticmethod
    def get_latest_value(data_list):
        """Get the most recent data point"""
        if not data_list:
            return None
        return max(data_list, key=lambda x: int(x['year']) if x['year'] else 0)
    
    @staticmethod
    def calculate_growth_rate(data_list, years_back=5):
        """Calculate growth rate over specified years"""
        if len(data_list) < 2:
            return None
        
        sorted_data = sorted(data_list, key=lambda x: int(x['year']))
        if len(sorted_data) < years_back:
            return None
        
        old_value = sorted_data[0]['value']
        new_value = sorted_data[-1]['value']
        
        if old_value and new_value and old_value != 0:
            years = int(sorted_data[-1]['year']) - int(sorted_data[0]['year'])
            if years > 0:
                return ((new_value / old_value) ** (1/years) - 1) * 100
        
        return None
    
    @staticmethod
    def format_large_number(value):
        """Format large numbers with appropriate units"""
        if value is None:
            return "N/A"
        
        try:
            value = float(value)
            if value >= 1_000_000_000:
                return f"{value/1_000_000_000:.1f}B"
            elif value >= 1_000_000:
                return f"{value/1_000_000:.1f}M"
            elif value >= 1_000:
                return f"{value/1_000:.1f}K"
            else:
                return f"{value:.1f}"
        except:
            return str(value)