"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { ForeCastApi, useGetForeCastQuery } from "@/redux/api/ForeCastApi";
import {
  useGetWeeklySalesQuery,
  WeeklySalesApi,
} from "@/redux/api/WeeklySalesApi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";

interface SalesForeCast {
  storeId: number;
  departmentId: number;
}

// Utility function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Generate week dates going backward from start date
const generateWeekDates = (startDate: Date, numWeeks: number): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  for (let i = 0; i < numWeeks; i++) {
    dates.push(formatDate(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() - 7);
  }
  return dates.reverse();
};

// Custom hook to handle batch data fetching
const useBatchSalesData = (
  storeId: number,
  departmentId: number,
  weekDates: string[]
) => {
  const dispatch = useDispatch<AppDispatch>();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (weekDates.length === 0) {
      setSalesData([]);
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setError(false);

      try {
        // Create promises for all API calls
        const forecastPromises = weekDates.map(async (weekDate) => {
          const result = await dispatch(
            ForeCastApi.endpoints.getForeCast.initiate({
              store_id: storeId,
              department_id: departmentId,
              week_date: weekDate,
            })
          ).unwrap(); // unwrap to get raw result
          return { weekDate, forecast: result };
        });

        const salesPromises = weekDates.map(async (weekDate) => {
          const result = await dispatch(
            WeeklySalesApi.endpoints.getWeeklySales.initiate({
              store_id: storeId,
              department_id: departmentId,
              week_date: weekDate,
            })
          ).unwrap();
          return { weekDate, sales: result };
        });

        // Wait for all forecasts and sales data
        const [forecastResults, salesResults] = await Promise.all([
          Promise.all(forecastPromises),
          Promise.all(salesPromises),
        ]);

        // Combine the data
        const combinedData = weekDates.map((weekDate) => {
          const forecastData = forecastResults.find(
            (f) => f.weekDate === weekDate
          );
          const salesData = salesResults.find((s) => s.weekDate === weekDate);

          return {
            week_date: weekDate,
            forecast: forecastData?.forecast?.predicted_sales || 0,
            actual_sales: salesData?.sales?.weekly_sales || 0,
            is_holiday: salesData?.sales?.is_holiday || false,
            loading: false,
            error: false,
          };
        });

        setSalesData(combinedData);
      } catch (err) {
        console.error("Error fetching batch data:", err);
        // setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [storeId, departmentId, weekDates]);

  return { salesData, loading, error };
};

const New = ({ storeId, departmentId }: SalesForeCast) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(4);

  const startDate = new Date("2012-11-22");

  const weekDates = useMemo(() => {
    return generateWeekDates(startDate, selectedPeriod);
  }, [selectedPeriod]);

  // Use the custom hook instead of calling hooks in a loop
  const {
    salesData,
    loading: isLoading,
    error: hasError,
  } = useBatchSalesData(storeId, departmentId, weekDates);

  const periodOptions = [
    { value: 4, label: "1 Month", weeks: 4 },
    { value: 8, label: "2 Months", weeks: 8 },
    { value: 12, label: "3 Months", weeks: 12 },
    { value: 24, label: "6 Months", weeks: 24 },
    { value: 52, label: "1 Year", weeks: 52 },
  ];

  const chartData = salesData.map((item) => ({
    date: item.week_date,
    "Actual Sales": item.actual_sales,
    Forecast: item.forecast,
    Holiday: item.is_holiday,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Week: ${label}`}</p>
          <p className="text-blue-600">
            {`Actual Sales: $${payload[0]?.value?.toLocaleString() || 0}`}
          </p>
          <p className="text-green-600">
            {`Forecast: $${payload[1]?.value?.toLocaleString() || 0}`}
          </p>
          {data.Holiday && (
            <p className="text-red-500 text-xs mt-1">🎉 Holiday Week</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 font-semibold">Error loading sales data</p>
          <p className="text-gray-600 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading sales data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Forecast Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Store ID: {storeId} | Department ID: {departmentId}
          </p>
        </div>

        {/* Time Period Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Select Time Period
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  selectedPeriod === option.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
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

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sales vs Forecast Comparison
            </h2>
            <span className="text-sm text-gray-500 ml-auto">
              ({periodOptions.find((p) => p.value === selectedPeriod)?.label})
            </span>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
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
                  dataKey="Actual Sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Forecast"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Actual Sales
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {chartData
                    .reduce((sum, item) => sum + (item["Actual Sales"] || 0), 0)
                    .toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">
                  Total Forecast
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {chartData
                    .reduce((sum, item) => sum + (item["Forecast"] || 0), 0)
                    .toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">
                  Holiday Weeks
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.filter((item) => item.Holiday).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
