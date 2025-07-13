import { useGetDepartmentsQuery } from "@/redux/api/DepartmentsApi";
import React from "react";
interface Props {
  slug: string;
}
const StoreDepartments = ({slug}:Props) => {
  const {
    data: Departments,
    isError: DepartmentError,
    isLoading: DepartmentLoading,
  } = useGetDepartmentsQuery("");

  
  return <div></div>;
};

export default StoreDepartments;
