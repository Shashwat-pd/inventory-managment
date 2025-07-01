"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetInventoryQuery, useAddInventoryMutation } from "@/redux/api/InventoryApi";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface IInventoryData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  id: number;
}

interface IAddInventoryData {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

// Zod schema for form validation
const addInventorySchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  price: z.number().min(0.01, "Price must be greater than 0").max(999999, "Price is too high"),
  quantity: z.number().min(0, "Quantity cannot be negative").max(999999, "Quantity is too high"),
});

type AddInventoryFormData = z.infer<typeof addInventorySchema>;

// Mock data for demonstration
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

const AddInventoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddInventoryFormData) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddInventoryFormData>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
    },
  });

  const handleFormSubmit = (data: AddInventoryFormData) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Inventory</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product description"
                disabled={isLoading}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                {...register("price", { valueAsNumber: true })}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={isLoading}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                {...register("quantity", { valueAsNumber: true })}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                disabled={isLoading}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Inventory"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InventoryCard: React.FC<{ item: IInventoryData; onClick: () => void }> = ({ item, onClick }) => {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (quantity < 10) return { text: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  const stockStatus = getStockStatus(item.quantity);

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-gray-300"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
          {stockStatus.text}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Price</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-900">{item.quantity}</p>
          <p className="text-sm text-gray-500">Available</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">ID: {item.id}</p>
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    data: Inventory,
    isLoading: Loading,
    isError: Error,
  } = useGetInventoryQuery("");
  
  const [addInventory, { isLoading: isAdding }] = useAddInventoryMutation();

  // Use mock data if API data is not available
  const inventoryData =  mockInventoryData;

  const handleInventoryClick = (id: number) => {
    router.push(`/inventory/${id}`);
  };

  const handleAddInventory = async (data: AddInventoryFormData) => {
    try {
      await addInventory(data).unwrap();
      setIsModalOpen(false);
      // Optionally show success message
      console.log("Inventory added successfully!");
    } catch (error) {
      console.error("Failed to add inventory:", error);
      // Optionally show error message
    }
  };

  if (Loading) {
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
          <SiteHeader title={"Inventories"} />
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-10"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-6 bg-gray-200 rounded w-8 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

//   if (Error) {
//     return (
//       <SidebarProvider
//         style={
//           {
//             "--sidebar-width": "calc(var(--spacing) * 72)",
//             "--header-height": "calc(var(--spacing) * 12)",
//           } as React.CSSProperties
//         }
//       >
//         <AppSidebar variant="inset" />
//         <SidebarInset>
//           <SiteHeader title={"Inventories"} />
//           <div className="p-6">
//             <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//               <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Inventory</h3>
//               <p className="text-red-600">Failed to load inventory data. Please try again later.</p>
//             </div>
//           </div>
//         </SidebarInset>
//       </SidebarProvider>
//     );
//   }

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
        <SiteHeader title={"Inventories"} />
        
        <div className="p-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Inventory
            </button>
          </div>

          {/* Summary Stats */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800">Total Items</h4>
              <p className="text-2xl font-bold text-blue-900">{inventoryData.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="text-sm font-medium text-green-800">Total Stock</h4>
              <p className="text-2xl font-bold text-green-900">
                {inventoryData.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="text-sm font-medium text-purple-800">Total Value</h4>
              <p className="text-2xl font-bold text-purple-900">
                ${inventoryData.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Inventory Cards Grid */}
          {inventoryData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryData.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onClick={() => handleInventoryClick(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Inventory Items</h3>
              <p className="text-gray-500">Start by adding your first inventory item.</p>
            </div>
          )}
        </div>

        {/* Add Inventory Modal */}
        <AddInventoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddInventory}
          isLoading={isAdding}
        />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Page;