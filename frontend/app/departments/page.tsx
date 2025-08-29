"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorCard from "@/components/ui/Error";
import Loader from "@/components/ui/Loader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DepartmentCard from "@/components/ui/universeIoUi/DepartmentCard";
import { useGetDepartmentsQuery } from "@/redux/api/DepartmentsApi";
import { IconBuildingBridge2Filled } from "@tabler/icons-react";
import { Home } from "lucide-react";

import React from "react";

const StoreDepartments = () => {
  const {
    data: Departments,
    isError: DepartmentError,
    isLoading: DepartmentLoading,
  } = useGetDepartmentsQuery("");

  if (DepartmentLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  if (DepartmentError) {
    return (
      <div>
        <ErrorCard />
      </div>
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
        <SiteHeader title={"Departments"} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <IconBuildingBridge2Filled className="h-5 w-5 text-gray-600" />
              </div>
              <div className="">
                <h1 className="text-2xl  font-semibold ">Departments</h1>
                <p className=" font-small">These are your departments</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {Departments?.map((department) => (
              <DepartmentCard key={department.id} title={department.name} />
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default StoreDepartments;
