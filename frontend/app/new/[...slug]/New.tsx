"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  ComposedChart,
  ResponsiveContainer,
  ReferenceLine,
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Generate week dates going forward from start date
const generateFutureWeekDates = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 7); // Start from next week
  
  while (currentDate <= endDate) {
    dates.push(formatDate(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return dates;
};

// Custom hook to handle batch data fetching
const useBatchSalesData = (
  storeId: number,
  departmentId: number,
  weekDates: string[],
  futureWeekDates: string[],
  showFuture: boolean
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
        // Fetch historical data
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

        // Wait for historical data
        const [forecastResults, salesResults] = await Promise.all([
          Promise.all(forecastPromises),
          Promise.all(salesPromises),
        ]);

        // Combine historical data
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
            date: weekDate,
            forecast: forecastValue,
            forecast_error: hasForecastError,
            forecast_error_indicator: hasForecastError 
              ? (salesData?.sales?.weekly_sales || 0)
              : null,
            actual_sales: salesData?.sales?.weekly_sales || 0,
            is_holiday: salesData?.sales?.is_holiday || false,
            is_future: false,
            loading: false,
            error: false,
          };
        });

        // Fetch future forecast data if enabled
        if (showFuture && futureWeekDates.length > 0) {
          const futureForecastPromises = futureWeekDates.map(async (weekDate) => {
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
              console.error(`Future forecast error for ${weekDate}:`, err);
              return { weekDate, forecast: null, error: true };
            }
          });

          const futureForecastResults = await Promise.all(futureForecastPromises);

          const futureData = futureWeekDates.map((weekDate) => {
            const forecastData = futureForecastResults.find(
              (f) => f.weekDate === weekDate
            );

            const hasForecastError = forecastData?.error || false;
            const forecastValue = hasForecastError 
              ? null 
              : (forecastData?.forecast?.predicted_sales || 0);

            return {
              date: weekDate,
              forecast: forecastValue,
              forecast_error: hasForecastError,
              forecast_error_indicator: null,
              actual_sales: null,
              is_holiday: false,
              is_future: true,
              loading: false,
              error: false,
            };
          });

          setSalesData([...combinedData, ...futureData]);
        } else {
          setSalesData(combinedData);
        }
      } catch (err) {
        console.error("Error fetching batch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [storeId, departmentId, weekDates, futureWeekDates, showFuture]);

  return { salesData, loading, error };
};

const chartConfig = {
  actual_sales: {
    label: "Actual Sales",
    color: "hsl(var(--primary))",
  },
  forecast: {
    label: "Forecast",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const New = ({ storeId, departmentId }: SalesForeCast) => {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(4);
  const [showFutureForecast, setShowFutureForecast] = useState<boolean>(true);

  const TODAY_DATE = new Date("2012-10-26");
  const FORECAST_END_DATE = new Date("2014-01-31");

  const weekDates = useMemo(() => {
    return generateWeekDates(TODAY_DATE, selectedPeriod);
  }, [selectedPeriod]);

  const futureWeekDates = useMemo(() => {
    return generateFutureWeekDates(TODAY_DATE, FORECAST_END_DATE);
  }, []);

  // Use the custom hook
  const {
    salesData,
    loading: isLoading,
    error: hasError,
  } = useBatchSalesData(storeId, departmentId, weekDates, futureWeekDates, showFutureForecast);

  const periodOptions = [
    { value: 4, label: "1 Month", weeks: 4 },
    { value: 8, label: "2 Months", weeks: 8 },
    { value: 12, label: "3 Months", weeks: 12 },
    { value: 24, label: "6 Months", weeks: 24 },
    { value: 52, label: "1 Year", weeks: 52 },
  ];

  useEffect(() => {
    if (isMobile) {
      setSelectedPeriod(4);
    }
  }, [isMobile]);

  const chartData = salesData;

  const historicalData = salesData.filter(item => !item.is_future);
  const futureData = salesData.filter(item => item.is_future);
  const missingForecastCount = historicalData.filter(item => item.forecast_error).length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">
            {new Date(data.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {data.is_future && (
              <span className="ml-2 text-purple-600 font-semibold">(Future)</span>
            )}
          </p>
          {!data.is_future && (
            <p className="text-sm text-blue-600">
              Actual: ${data.actual_sales?.toLocaleString() || 0}
            </p>
          )}
          {data.forecast_error ? (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              Forecast N/A
            </p>
          ) : (
            <p className="text-sm text-green-600">
              Forecast: ${data.forecast?.toLocaleString() || 0}
            </p>
          )}
          {data.is_holiday && (
            <p className="text-xs text-purple-600 mt-1">🎉 Holiday</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (hasError) {
    return (
      <Card className="@container/card">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">Error loading sales data</p>
            <p className="text-gray-600 text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardContent className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Loading sales data...</span>
        </CardContent>
      </Card>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Chart Card */}
            <Card className="@container/card">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>
                      {showFutureForecast ? "Forecast Overview" : "Sales vs Forecast Comparison"}
                    </CardTitle>
                  </div>
                </div>

                <CardAction>
                  {/* <button */}
                  {/*   onClick={() => setShowFutureForecast(!showFutureForecast)} */}
                  {/*   className={`px-4 py-2 mb-3 text-sm font-medium rounded-lg transition-colors ${ */}
                  {/*     showFutureForecast */}
                  {/*       ? "bg-purple-600 text-white hover:bg-purple-700" */}
                  {/*       : "bg-gray-200 text-gray-700 hover:bg-gray-300" */}
                  {/*   }`} */}
                  {/* > */}
                  {/*   {showFutureForecast ? "Hide Future Forecast" : "Show Future Forecast"} */}
                  {/* </button> */}
                  <div className="px-4 py-2 mb-1 text-sm font-medium rounded-lg">
                        <p className=" ">For Comparison</p>
                                  </div>
                  <ToggleGroup
                    type="single"
                    value={selectedPeriod.toString()}
                    onValueChange={(value) => setSelectedPeriod(Number(value))}
                    variant="outline"
                    className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                  >
                     <ToggleGroupItem value="52">Last 1 year</ToggleGroupItem>
                    {/* <ToggleGroupItem value="24">Last 6 months</ToggleGroupItem> */}
                    {/* <ToggleGroupItem value="12">Last 3 months</ToggleGroupItem> */}
                    <ToggleGroupItem value="8">Last 2 months</ToggleGroupItem>
                    <ToggleGroupItem value="4">Last 1 month</ToggleGroupItem>
                  </ToggleGroup>
                  <Select 
                    value={selectedPeriod.toString()} 
                    onValueChange={(value) => setSelectedPeriod(Number(value))}
                  >
                    <SelectTrigger
                      className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                      size="sm"
                      aria-label="Select a value"
                    >
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="52" className="rounded-lg">
                        Last 1 year
                      </SelectItem>
                      <SelectItem value="24" className="rounded-lg">
                        Last 6 months
                      </SelectItem>
                      <SelectItem value="12" className="rounded-lg">
                        Last 3 months
                      </SelectItem>
                      <SelectItem value="8" className="rounded-lg">
                        Last 2 months
                      </SelectItem>
                      <SelectItem value="4" className="rounded-lg">
                        Last 1 month
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>

              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="fillActualSales" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-actual_sales)"
                          stopOpacity={1.0}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-actual_sales)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient id="fillForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-forecast)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-forecast)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Reference line to mark "today" */}
                    {showFutureForecast && (
                      <ReferenceLine
                        x={formatDate(TODAY_DATE)}
                        stroke="#9333ea"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                        label={{
                          value: "Today",
                          position: "top",
                          fill: "#9333ea",
                          fontSize: 12,
                          fontWeight: "bold"
                        }}
                      />
                    )}
                    <Area
                      dataKey="forecast"
                      type="natural"
                      fill="url(#fillForecast)"
                      stroke="var(--color-forecast)"
                      strokeWidth={2}
                      connectNulls
                    />
                    <Area
                      dataKey="actual_sales"
                      type="natural"
                      fill="url(#fillActualSales)"
                      stroke="var(--color-actual_sales)"
                      strokeWidth={2}
                      connectNulls
                    />
                    {/* Red dots for missing forecast data */}
                    <Scatter
                      dataKey="forecast_error_indicator"
                      fill="#ef4444"
                      shape="circle"
                      r={6}
                      name="Missing Forecast"
                    />
                  </ComposedChart>
                </ChartContainer>

                {/* Legend explanation */}
                <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[hsl(var(--primary))]"></div>
                    <span>Actual Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[hsl(var(--chart-2))]"></div>
                    <span>Forecast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Missing Forecast Data</span>
                  </div>
                  {showFutureForecast && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-purple-600 border-dashed border-t-2"></div>
                      <span>Today Marker</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Actual Sales
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        $
                        {historicalData
                          .reduce((sum, item) => sum + (item.actual_sales || 0), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Forecast
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        $
                        {chartData
                          .reduce((sum, item) => sum + (item.forecast || 0), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Holiday Weeks
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {historicalData.filter((item) => item.is_holiday).length}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default New;
