"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetIndividualInventoryQuery } from "@/redux/api/InventoryApi";
import React from "react";

interface DescriptionProps {
  id?: React.ReactNode;
}

const InventoryDescription = (props: DescriptionProps) => {
  const {
    data: DescriptionData,
    isError,
    isLoading,
  } = useGetIndividualInventoryQuery("props");
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
        <SiteHeader title={""} />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default InventoryDescription;
