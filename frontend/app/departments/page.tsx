"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorCard from "@/components/ui/Error";
import Loader from "@/components/ui/Loader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetDepartmentsQuery } from "@/redux/api/DepartmentsApi";
import { Home } from "lucide-react";

import React from "react";

const StoreDepartments = () => {
  const {
    data: Departments,
    isError: DepartmentError,
    isLoading: DepartmentLoading,
  } = useGetDepartmentsQuery("");

  if (DepartmentLoading) {
    return <div><Loader/></div>;
  }
  if (DepartmentError) {
    return <div><ErrorCard/></div>;
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
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 md:grid-cols-3  lg:grid-cols-4">
            {Departments?.map((department) => (
              <Card
                className="hover:shadow-lg transition-shadow duration-200"
                key={department.id}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Home className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-medium">
                          {department.name}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        
      </SidebarInset>
    </SidebarProvider>
  );
};

export default StoreDepartments;
