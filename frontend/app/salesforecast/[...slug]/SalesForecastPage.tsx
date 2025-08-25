"use client"
import React, { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { SalesForeCast, WeeklySalesList } from "@/types";
import { useLazyGetForeCastListQuery } from "@/redux/api/ForeCastApi";
import { useLazyGetWeeklySalesListQuery } from "@/redux/api/WeeklySalesApi";

interface SalesForeCasts {
  storeId: number;
  departmentId: number;
}

interface ChartDataPoint {
  date: string;
  forecast: number;
  actualSales: number;
  isHoliday: boolean;
}

// Utility function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate week dates going backward from start date
const generateWeekDates = (startDate: Date, numWeeks: number): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < numWeeks; i++) {
    dates.push(formatDate(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() - 7); // Go back one week
  }
  
  return dates.reverse(); // Return in chronological order
};

const BATCH_SIZE = 1000;

const SalesForecastPage = ({ storeId, departmentId }: SalesForeCasts) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(4);
  const startDate = new Date('2012-10-26');
  const [forecastData, setForecastData] = useState<SalesForeCast>([]);
  const [salesData, setSalesData] = useState<WeeklySalesList>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fetchForecast, { 
    isLoading: isForecastLoading, 
    error: forecastError 
  }] = useLazyGetForeCastListQuery();
  
  const [fetchSales, { 
    isLoading: isSalesLoading, 
    error: salesError 
  }] = useLazyGetWeeklySalesListQuery();
  
  const weekDates = useMemo(() => (
    generateWeekDates(startDate, selectedPeriod)
  ), [selectedPeriod]);

  const fetchAllData = async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      // Reset data on new fetch
      setForecastData([]);
      setSalesData([]);

      // Fetch forecast data in batches
      let forecastSkip = 0;
      let hasMoreForecast = true;
      const allForecastData: SalesForeCast = [];
      
      while (hasMoreForecast) {
        try {
          const { data: forecastBatch, error: batchForecastError } = await fetchForecast({ 
            limit: BATCH_SIZE, 
            skip: forecastSkip 
          });
          
          if (batchForecastError) {
            throw new Error('Failed to fetch forecast data');
          }
          
          if (!forecastBatch || forecastBatch.length === 0) {
            hasMoreForecast = false;
            break;
          }
          
          allForecastData.push(...forecastBatch);
          forecastSkip += BATCH_SIZE;
          hasMoreForecast = forecastBatch.length === BATCH_SIZE;
        } catch (err) {
          console.error('Error fetching forecast batch:', err);
          throw new Error('Failed to fetch forecast data');
        }
      }

      // Fetch sales data in batches
      let salesSkip = 0;
      let hasMoreSales = true;
      const allSalesData: WeeklySalesList = [];
      
      while (hasMoreSales) {
        try {
          const { data: salesBatch, error: batchSalesError } = await fetchSales({ 
            limit: BATCH_SIZE, 
            skip: salesSkip 
          });
          
          if (batchSalesError) {
            throw new Error('Failed to fetch sales data');
          }
          
          if (!salesBatch || salesBatch.length === 0) {
            hasMoreSales = false;
            break;
          }
          
          allSalesData.push(...salesBatch);
          salesSkip += BATCH_SIZE;
          hasMoreSales = salesBatch.length === BATCH_SIZE;
        } catch (err) {
          console.error('Error fetching sales batch:', err);
          throw new Error('Failed to fetch sales data');
        }
      }

      // Set all data at once to avoid multiple re-renders
      setForecastData(allForecastData);
      setSalesData(allSalesData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod, storeId, departmentId]);

  const filteredData = useMemo(() => {
    const result: ChartDataPoint[] = [];
    
    for (const weekDate of weekDates) {
      const forecast = forecastData.find(
        f => f.store_id === storeId && 
             f.department_id === departmentId && 
             f.week_date === weekDate
      );
      
      const sales = salesData.find(
        s => s.store_id === storeId && 
             s.department_id === departmentId && 
             s.week_date === weekDate
      );
      
      result.push({
        date: weekDate,
        forecast: forecast?.predicted_sales || 0,
        actualSales: sales?.weekly_sales || 0,
        isHoliday: sales?.is_holiday || false,
      });
    }
    
    return result;
  }, [forecastData, salesData, weekDates, storeId, departmentId]);

  // Combined loading state
  const isLoading = isLoadingData || isForecastLoading || isSalesLoading;
  
  // Combined error handling
  const combinedError = error || 
    (forecastError && 'error' in forecastError ? forecastError.error : null) ||
    (salesError && 'error' in salesError ? salesError.error : null);

  // Time period options
  const periodOptions = [
    { value: 4, label: '1 Month', weeks: 4 },
    { value: 8, label: '2 Months', weeks: 8 },
    { value: 12, label: '3 Months', weeks: 12 },
    { value: 24, label: '6 Months', weeks: 24 },
    { value: 52, label: '1 Year', weeks: 52 },
  ];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Week: ${label}`}</p>
          <p className="text-blue-600">
            {`Actual Sales: $${payload.find((p: any) => p.dataKey === 'actualSales')?.value?.toLocaleString() || 0}`}
          </p>
          <p className="text-green-600">
            {`Forecast: $${payload.find((p: any) => p.dataKey === 'forecast')?.value?.toLocaleString() || 0}`}
          </p>
          {data.isHoliday && (
            <p className="text-red-500 text-xs mt-1">🎉 Holiday Week</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Error component
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
      <p className="text-red-600 text-center mb-4 px-4">
        {typeof combinedError === 'string' ? combinedError : 'Failed to load sales data. Please try again.'}
      </p>
      <button
        onClick={fetchAllData}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Retry
      </button>
    </div>
  );

  // Loading component
  const LoadingDisplay = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <span className="text-gray-600">Loading sales data...</span>
      <span className="text-sm text-gray-500 mt-2">
        This may take a few moments for large datasets
      </span>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sales Forecast Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Store ID: {storeId} | Department ID: {departmentId}
          </p>
        </div>

        {/* Time Period Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Select Time Period</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {periodOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedPeriod === option.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {option.label}
                <span className="text-xs block mt-1 opacity-75">
                  {option.weeks} weeks
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {combinedError && !isLoading && <ErrorDisplay />}

        {/* Loading Display */}
        {isLoading && <LoadingDisplay />}

        {/* Chart - Only show when not loading and no error */}
        {!isLoading && !combinedError && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Sales vs Forecast Comparison
                </h2>
                <span className="text-sm text-gray-500 ml-auto">
                  ({periodOptions.find(p => p.value === selectedPeriod)?.label})
                </span>
              </div>
              
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actualSales" 
                      name="Actual Sales"
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      name="Forecast"
                      stroke="#10b981" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Actual Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${filteredData.reduce((sum, item) => sum + (item.actualSales || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Forecast</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${filteredData.reduce((sum, item) => sum + (item.forecast || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Holiday Weeks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredData.filter(item => item.isHoliday).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesForecastPage;