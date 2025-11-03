"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { useGetStoreQuery } from "@/redux/api/StoreApi";
import { ForeCastApi } from "@/redux/api/ForeCastApi";
import { WeeklySalesApi } from "@/redux/api/WeeklySalesApi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { Info, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const DEPARTMENT_ID = 3;

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
  storeId: number | null,
  departmentId: number,
  weekDates: string[]
) => {
  const dispatch = useDispatch<AppDispatch>();
  const [salesData, setSalesData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!storeId || weekDates.length === 0) {
      setSalesData([]);
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);

      try {
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
            return { weekDate, sales: null, error: true };
          }
        });

        const [forecastResults, salesResults] = await Promise.all([
          Promise.all(forecastPromises),
          Promise.all(salesPromises),
        ]);

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
            actual_sales: salesData?.sales?.weekly_sales || 0,
            is_holiday: salesData?.sales?.is_holiday || false,
            forecast_error: hasForecastError,
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
  }, [storeId, departmentId, weekDates, dispatch]);

  return { salesData, loading };
};

const chartConfig = {
  actual_sales: {
    label: "Actual Sales",
    color: "var(--primary)",
  },
  forecast: {
    label: "Forecast",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [timeRange, setTimeRange] = React.useState("180d");
  const [selectedStore, setSelectedStore] = React.useState<number | null>(null);
  
  const { data: stores, isLoading: storesLoading, error: storesError } = useGetStoreQuery("");

  const startDate = new Date("2012-10-26");
  
  const numWeeks = React.useMemo(() => {
    if (timeRange === "180d") return 24;
    if (timeRange === "30d") return 4;
    return 12; // 90d = ~12 weeks
  }, [timeRange]);

  const weekDates = React.useMemo(() => {
    return generateWeekDates(startDate, numWeeks);
  }, [numWeeks]);

  const { salesData, loading: dataLoading } = useBatchSalesData(
    selectedStore,
    DEPARTMENT_ID,
    weekDates
  );

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (stores && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0].id);
    }
  }, [stores, selectedStore]);

  const handleStoreInfo = () => {
    if (selectedStore) {
      router.push(`/store/${selectedStore}`);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
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
          </p>
          <p className="text-sm text-blue-600">
            Actual: ${data.actual_sales?.toLocaleString() || 0}
          </p>
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

  if (storesLoading) {
    return (
      <Card className="@container/card">
        <CardContent className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Loading stores...</span>
        </CardContent>
      </Card>
    );
  }

  if (storesError) {
    return (
      <Card className="@container/card">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">Error loading stores</p>
            <p className="text-gray-600 text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedStoreData = stores?.find((s: any) => s.id === selectedStore);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Total Sales Vs  ForeCast</CardTitle>
            {/* <CardDescription> */}
            {/*   <span className="hidden @[540px]/card:block"> */}
            {/*     {selectedStoreData?.name} - Department {DEPARTMENT_ID} */}
            {/*   </span> */}
            {/*   <span className="@[540px]/card:hidden"> */}
            {/*     Store {selectedStore} - Dept {DEPARTMENT_ID} */}
            {/*   </span> */}
            {/* </CardDescription> */}
          </div>
          
          {/* Store Selection */}
          <div className="flex items-center gap-2">
            <Select 
              value={selectedStore?.toString()} 
              onValueChange={(value) => setSelectedStore(Number(value))}
            >
              <SelectTrigger className="w-[200px]" size="sm">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[300px]">
                {stores?.map((store: any) => (
                  <SelectItem 
                    key={store.id} 
                    value={store.id.toString()} 
                    className="rounded-lg"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {store.name.length > 25 
                          ? `${store.name.substring(0, 22)}...` 
                          : store.name}
                      </span>
                      <span className="text-xs text-gray-500">#{store.id}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <button
              onClick={handleStoreInfo}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Store Information"
            >
              <Info className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="180d">Last 6 months</ToggleGroupItem>
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 1 months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 6 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="180d" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 1 months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {dataLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600 text-sm">Loading sales data...</span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={salesData}>
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
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
