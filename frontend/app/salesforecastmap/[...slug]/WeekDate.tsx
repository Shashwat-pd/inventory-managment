import { useGetForeCastQuery } from "@/redux/api/ForeCastApi";
import { useGetWeeklySalesQuery } from "@/redux/api/WeeklySalesApi";
export const WeekData = ({ storeId, departmentId, weekDate }: { 
  storeId: number; 
  departmentId: number; 
  weekDate: string 
}) => {
  const forecastQuery = useGetForeCastQuery({
    store_id: storeId,
    department_id: departmentId,
    week_date: weekDate,
  });

  const salesQuery = useGetWeeklySalesQuery({
    store_id: storeId,
    department_id: departmentId,
    week_date: weekDate,
  });

  return {
    week_date: weekDate,
    forecast: forecastQuery.data?.predicted_sales || 0,
    actual_sales: salesQuery.data?.weekly_sales || 0,
    is_holiday: salesQuery.data?.is_holiday || false,
    loading: forecastQuery.isLoading || salesQuery.isLoading,
    error: forecastQuery.isError || salesQuery.isError,
  };
}