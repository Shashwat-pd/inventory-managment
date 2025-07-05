"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetIndividualInventoryQuery } from "@/redux/api/InventoryApi";
import { IInventoryData } from "@/types/types";
import React from "react";

interface Props {
  slug: string;
}

const mockInventoryData: IInventoryData[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "High-quality bluetooth headphones with noise cancellation",
    price: 299.99,
    quantity: 45
  },
  {
    id: 2,
    name: "Gaming Mouse",
    description: "Ergonomic gaming mouse with RGB lighting and programmable buttons",
    price: 79.99,
    quantity: 23
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    description: "Cherry MX Blue switches with backlit keys",
    price: 149.99,
    quantity: 12
  },
  {
    id: 4,
    name: "4K Monitor",
    description: "27-inch 4K UHD monitor with HDR support",
    price: 399.99,
    quantity: 8
  },
  {
    id: 5,
    name: "USB-C Hub",
    description: "Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader",
    price: 49.99,
    quantity: 67
  },
  {
    id: 6,
    name: "Smartphone Stand",
    description: "Adjustable aluminum smartphone and tablet stand",
    price: 24.99,
    quantity: 156
  }
];

const InventoryDescription = ({slug}:Props) => {
  const {
    data: DescriptionData,
    isError,
    isLoading,
  } = useGetIndividualInventoryQuery(slug);
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
