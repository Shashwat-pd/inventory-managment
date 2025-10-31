"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetDepartmentsQuery } from "@/redux/api/DepartmentsApi";
import { IconHome2 } from "@tabler/icons-react";
import { Home, Loader } from "lucide-react";
import Link from "next/link";
import React from "react";
interface Props {
  slug: string;
}
const StoreDepartments = ({ slug }: Props) => {
  const {
    data: Departments,
    isError: DepartmentError,
    isLoading: DepartmentLoading,
  } = useGetDepartmentsQuery("");

  if (DepartmentLoading) {
    return <Loader/>;
  }
  if (DepartmentError) {
    return <div>error loading data</div>;
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
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-blue-100 rounded-lg">
              <IconHome2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-base font-medium ">Select Department</h1>
              <p className=" font-small">
                Choose a Department to View Your Stores Descriptions
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                <CardDescription className="flex items-center justify-between">
                  <Link href={`/products/${slug}/${department.id}`}>
                    <Button
                      variant="secondary"
                      className="mx-4 cursor-pointer border-2"
                    >
                      Inventory
                    </Button>
                  </Link>
                  <Link href={`/new/${slug}/${department.id}`}>
                  <Button
                    variant="secondary"
                    className="d-flex justify-content-end mx-4 cursor-pointer border-2"
                  >
                    Sales and Forecast
                  </Button>
                  </Link>
                </CardDescription>
                {/* </Link> */}
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default StoreDepartments;
