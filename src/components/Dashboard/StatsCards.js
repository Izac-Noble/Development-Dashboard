// src/components/Dashboard/StatsCards.js
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Building, GraduationCap, Heart, Activity } from 'lucide-react';
import apiService from '../../services/api';

const StatsCards = ({ ugandaStats }) => {
  const [healthSummary, setHealthSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load key health indicators
  useEffect(() => {
    const loadKeyHealthData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the consistent method from apiService
        const data = await apiService.getHealthData();
        setHealthSummary(data);
        console.log('Health summary loaded for stats cards:', data);
        
      } catch (error) {
        console.error('Error loading health summary for stats cards:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadKeyHealthData();
  }, []);

  // Safe function to extract health values
  const getHealthValue = (indicator, fallback = 'N/A') => {
    if (!healthSummary) return fallback;
    
    try {
      // Check WHO data first
      if (healthSummary.who_data && healthSummary.who_data[indicator]) {
        const values = Array.isArray(healthSummary.who_data[indicator]) ? healthSummary.who_data[indicator] : [];
        if (values.length > 0) {
          const latest = values[values.length - 1];
          return latest.display_value || apiService.formatHealthValue(latest.value, indicator);
        }
      }
      
      // Check World Bank data
      if (healthSummary.world_bank_data && healthSummary.world_bank_data[indicator]) {
        const values = Array.isArray(healthSummary.world_bank_data[indicator]) ? healthSummary.world_bank_data[indicator] : [];
        if (values.length > 0) {
          const latest = values[0]; // World Bank data is newest first
          return apiService.formatHealthValue(latest.value, indicator);
        }
      }
      
      // Check direct data structure
      if (healthSummary.data && healthSummary.data[indicator]) {
        const value = healthSummary.data[indicator];
        if (typeof value === 'object' && value.value !== undefined) {
          return value.display_value || apiService.formatHealthValue(value.value, indicator);
        } else if (typeof value === 'number') {
          return apiService.formatHealthValue(value, indicator);
        }
      }
      
      return fallback;
    } catch (err) {
      console.error(`Error getting health value for ${indicator}:`, err);
      return fallback;
    }
  };

  // Safe function to get stats values with fallbacks
  const getStatValue = (path, fallback) => {
    if (!ugandaStats) return fallback;
    
    try {
      const keys = path.split('.');
      let current = ugandaStats;
      
      for (const key of keys) {
        if (current && current[key] !== undefined) {
          current = current[key];
        } else {
          return fallback;
        }
      }
      
      return current;
    } catch (err) {
      return fallback;
    }
  };

  const statsData = [
    // Original development stats with safe access
    {
      title: 'Total Hospitals',
      value: getStatValue('healthcare.hospitals', '127'),
      icon: Building,
      category: 'infrastructure'
    },
    {
      title: 'Schools',
      value: (() => {
        const primary = getStatValue('education.primary_schools', 15420);
        const secondary = getStatValue('education.secondary_schools', 2960);
        return (primary + secondary).toLocaleString();
      })(),
      icon: GraduationCap,
      category: 'education'
    },
    {
      title: 'Population',
      value: (() => {
        const total = getStatValue('population.total', 47100000);
        return (total / 1000000).toFixed(1) + 'M';
      })(),
      icon: Users,
      category: 'demographics'
    },
    {
      title: 'GDP Growth',
      value: getStatValue('economy.gdp_growth', '5.2') + '%',
      icon: TrendingUp,
      category: 'economy'
    },
    // Health indicators with better error handling
    {
      title: 'Life Expectancy',
      value: loading ? 'Loading...' : error ? 'N/A' : 
        getHealthValue('WHOSIS_000001', getHealthValue('SP.DYN.LE00.IN', 'N/A')),
      icon: Heart,
      category: 'health'
    },
    {
      title: 'Under-5 Mortality',
      value: loading ? 'Loading...' : error ? 'N/A' :
        getHealthValue('MDG_0000000001', getHealthValue('SH.STA.MORT', 'N/A')),
      icon: Activity,
      category: 'health'
    }
  ];

  // Color scheme based on category
  const getCategoryColors = (category) => {
    switch (category) {
      case 'infrastructure':
        return { border: 'border-blue-500', icon: 'text-blue-400' };
      case 'education':
        return { border: 'border-green-500', icon: 'text-green-400' };
      case 'demographics':
        return { border: 'border-purple-500', icon: 'text-purple-400' };
      case 'economy':
        return { border: 'border-yellow-500', icon: 'text-yellow-400' };
      case 'health':
        return { border: 'border-red-500', icon: 'text-red-400' };
      default:
        return { border: 'border-gray-500', icon: 'text-gray-400' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const colors = getCategoryColors(stat.category);
        
        return (
          <div 
            key={index} 
            className={`bg-navy bg-opacity-50 p-4 rounded-lg ${colors.border} hover:bg-opacity-70 transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-300 text-sm mb-1">{stat.title}</p>
                <p className={`text-xl font-bold text-white ${loading && stat.category === 'health' ? 'animate-pulse' : ''}`}>
                  {stat.value}
                </p>
                {stat.category === 'health' && !error && (
                  <p className="text-xs text-gray-400 mt-1">WHO Data</p>
                )}
                {stat.category === 'health' && error && (
                  <p className="text-xs text-red-400 mt-1">Error loading</p>
                )}
              </div>
              <Icon className={`${colors.icon} ml-3`} size={28} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;