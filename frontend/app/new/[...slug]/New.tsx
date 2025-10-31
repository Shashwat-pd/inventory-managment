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
  Scatter,
  ComposedChart,
} from "recharts";
import { Calendar, TrendingUp, BarChart3, AlertCircle, Loader } from "lucide-react";
import { ForeCastApi, useGetForeCastQuery } from "@/redux/api/ForeCastApi";
import {
  useGetWeeklySalesQuery,
  WeeklySalesApi,
} from "@/redux/api/WeeklySalesApi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

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
          try {
            const result = await dispatch(
              ForeCastApi.endpoints.getForeCast.initiate({
                store_id: storeId,
                department_id: departmentId,
                week_date: weekDate,
              })
            ).unwrap();
            return { weekDate, forecast: result, error: false };
          } catch (err) {
            console.error(`Forecast error for ${weekDate}:`, err);
            return { weekDate, forecast: null, error: true };
          }
        });

        const salesPromises = weekDates.map(async (weekDate) => {
          try {
            const result = await dispatch(
              WeeklySalesApi.endpoints.getWeeklySales.initiate({
                store_id: storeId,
                department_id: departmentId,
                week_date: weekDate,
              })
            ).unwrap();
            return { weekDate, sales: result, error: false };
          } catch (err) {
            console.error(`Sales error for ${weekDate}:`, err);
            return { weekDate, sales: null, error: true };
          }
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

          const hasForecastError = forecastData?.error || false;
          const forecastValue = hasForecastError 
            ? null 
            : (forecastData?.forecast?.predicted_sales || 0);

          return {
            week_date: weekDate,
            forecast: forecastValue,
            forecast_error: hasForecastError,
            // For red error dot, we need a value at the sales level
            forecast_error_indicator: hasForecastError 
              ? (salesData?.sales?.weekly_sales || 0)
              : null,
            actual_sales: salesData?.sales?.weekly_sales || 0,
            is_holiday: salesData?.sales?.is_holiday || false,
            loading: false,
            error: false,
          };
        });

        setSalesData(combinedData);
      } catch (err) {
        console.error("Error fetching batch data:", err);
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

  const startDate = new Date("2012-10-26");

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
    "Forecast Error": item.forecast_error_indicator,
    Holiday: item.is_holiday,
    forecastError: item.forecast_error,
  }));

  const missingForecastCount = salesData.filter(item => item.forecast_error).length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Week: ${label}`}</p>
          <p className="text-blue-600">
            {`Actual Sales: $${data["Actual Sales"]?.toLocaleString() || 0}`}
          </p>
          {data.forecastError ? (
            <p className="text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Forecast: Not Available
            </p>
          ) : (
            <p className="text-green-600">
              {`Forecast: $${data.Forecast?.toLocaleString() || 0}`}
            </p>
          )}
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
      <Loader />
    );
  }

  return (
      <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
           <AppSidebar variant="inset" />
   <SidebarInset>
        <SiteHeader title={"Sales Forecast Dashboard"} />



    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-8"> */}
        {/*   <div className="flex items-center gap-3 mb-4"> */}
        {/*     <TrendingUp className="h-8 w-8 text-blue-600" /> */}
        {/*     <h1 className="text-3xl font-bold text-gray-900"> */}
        {/*       Sales Forecast Dashboard */}
        {/*     </h1> */}
        {/*   </div> */}
        {/*   <p className="text-gray-600"> */}
        {/*     Store ID: {storeId} | Department ID: {departmentId} */}
        {/*   </p> */}
        {/* </div> */}

        {/* {/* Warning Banner for Missing Forecasts */} 
        {/*  {missingForecastCount > 0 && ( */}
        {/*   <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"> */}
        {/*     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" /> */}
        {/*     <div> */}
        {/*       <p className="text-red-900 font-semibold"> */}
        {/*         Missing Forecast Data */}
        {/*       </p> */}
        {/*       <p className="text-red-700 text-sm"> */}
        {/*         {missingForecastCount} week{missingForecastCount > 1 ? 's' : ''} {missingForecastCount > 1 ? 'have' : 'has'} no forecast data available.  */}
        {/*         These are indicated by red dots on the chart. */}
        {/*       </p> */}
        {/*     </div> */}
        {/*   </div> */}
        {/* )}  
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
              <ComposedChart
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
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Forecast"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                  connectNulls
                />
                {/* Red dots for missing forecast data */}
                <Scatter
                  dataKey="Forecast Error"
                  fill="#ef4444"
                  shape="circle"
                  r={6}
                  name="Missing Forecast"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend explanation */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-600"></div>
              <span>Actual Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-600 border-t-2 border-dashed border-green-600"></div>
              <span>Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Missing Forecast Data</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Missing Forecasts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {missingForecastCount}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </SidebarInset>

        </SidebarProvider>

  );
};

export default New;
