"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGetStoreInventoryQuery, usePutInventoryMutation } from "@/redux/api/InventoryApi";
import { useGetProductDetailQuery } from "@/redux/api/ProductApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, MoreVertical, Save, X, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ErrorCard from "@/components/ui/Error";
import Loader from "@/components/ui/Loader";

const inventoryUpdateSchema = z.object({
  store_id: z.number().min(0, "Store id is required"),
  department_id: z.number().min(0, "Department id is required"),
  product_id: z.number().min(0, "Product id is required"),
  stock_level: z.number().min(0, "Stock level cannot be negative"),
});
type InventoryUpdateFormData = z.infer<typeof inventoryUpdateSchema>;

interface DepartmentProductProps {
  storeId: number;
  departmentId: number;
}

const DepartmentProduct = ({
  storeId,
  departmentId,
}: DepartmentProductProps) => {
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useGetStoreInventoryQuery({
    store_id: storeId,
    department_id: departmentId,
  });

  if (inventoryLoading) {
    return (
     <Loader/>
    );
  }

  if (inventoryError) {
    return (
     <ErrorCard/>
    );
  }

  if (!inventoryData || inventoryData.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No products found for this department
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventoryData.map((product) => (
            <ProductCard
              key={product.product_id}
              productId={product.product_id}
              stockLevel={product.stock_level}
              storeId={storeId}
              departmentId={departmentId}
              lastUpdated={product.last_updated}
              onInventoryUpdate={refetchInventory}
            />
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

// Individual Product Card Component
interface ProductCardProps {
  productId: number;
  stockLevel: number;
  storeId: number;
  departmentId: number;
  lastUpdated: string;
  onInventoryUpdate: () => void;
}

const ProductCard = ({ 
  productId, 
  stockLevel, 
  storeId, 
  departmentId, 
  lastUpdated, 
  onInventoryUpdate 
}: ProductCardProps) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: productDetails,
    isLoading,
    error,
  } = useGetProductDetailQuery(productId);
  
  const [putInventory, { isLoading: isUpdating }] = usePutInventoryMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InventoryUpdateFormData>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      store_id: storeId,
      department_id: departmentId,
      product_id: productId,
      stock_level: stockLevel,
    },
  });

  // Update form when stockLevel changes
  useEffect(() => {
    setValue("store_id", storeId);
    setValue("department_id", departmentId);
    setValue("product_id", productId);
    setValue("stock_level", stockLevel);
  }, [setValue, storeId, departmentId, productId, stockLevel]);

  const handleInventoryClick = () => {
    setOpen(true);
    setIsEditing(false);
  };

  const closeAllModals = () => {
    setOpen(false);
    setIsEditing(false);
    reset();
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setValue("stock_level", stockLevel);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValue("stock_level", stockLevel);
  };

  const onSubmit = async (data: InventoryUpdateFormData) => {
    if (!productDetails) return;

    try {
      await putInventory({
        store_id: storeId,
        department_id: departmentId,
        product_id: productId,
        data: data,
      }).unwrap();

      toast.success("Inventory updated successfully!");
      setIsEditing(false);
      setOpen(false);
      onInventoryUpdate(); // Refresh the inventory data
    } catch (error) {
      toast.error("Failed to update inventory");
      console.error("Error updating inventory:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-300 rounded mb-4"></div>
        <div className="h-20 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Product ID: {productId}
        </h3>
        <p className="text-red-500">Error loading product details</p>
        <div className="mt-4">
          <span
            className={`px-2 py-1 rounded text-sm ${
              stockLevel > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Stock: {stockLevel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-medium">
              {productDetails?.name || `Product ${productId}`}
              <span
                className={`px-2 py-1 ml-1.5 rounded text-sm font-medium ${
                  stockLevel > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                Stock: {stockLevel}
              </span>
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleInventoryClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Inventory
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 line-clamp-3 mb-4">
            {productDetails?.description || "No description available"}
          </p>

          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">
              ${productDetails?.price || "0.00"}
            </span>

            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">ID: {productId}</span>
              <div
                className={`w-3 h-3 rounded-full ${
                  stockLevel > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
          </div>

          {stockLevel === 0 && (
            <div className="mt-4 text-center">
              <span className="text-red-600 font-medium">Out of Stock</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Management Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {productDetails?.name}
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Inventory Management
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-green-600">
                  ${productDetails?.price}
                </span>
                <Badge variant="outline" className="text-blue-600">
                  Store ID: {storeId}
                </Badge>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {productDetails?.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Stock Level</h3>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditClick}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <Label
                        htmlFor="stock_level"
                        className="text-sm font-medium"
                      >
                        Current Stock
                      </Label>
                      <Input
                        id="stock_level"
                        type="number"
                        {...register("stock_level", { valueAsNumber: true })}
                        className="mt-1"
                        placeholder="Enter stock level"
                      />
                      {errors.stock_level && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.stock_level.message}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isUpdating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {stockLevel}
                    </span>
                    <Badge
                      variant={stockLevel > 10 ? "default" : "destructive"}
                      className="text-white"
                    >
                      {stockLevel > 10 ? "In Stock" : "Low Stock"}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Last Updated
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(lastUpdated).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DepartmentProduct;