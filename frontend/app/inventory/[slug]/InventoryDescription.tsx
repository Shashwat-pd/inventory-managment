"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  useGetInventoryQuery,
  usePutInventoryMutation,
} from "@/redux/api/InventoryApi";
import { useGetProductDetailQuery } from "@/redux/api/ProductApi";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDeleteStoreMutation, useGetStoreQuery } from "@/redux/api/StoreApi";
import { IStoreData } from "@/types/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Building2,
  Edit,
  MapPin,
  MoreVertical,
  Package,
  Plus,
  Ruler,
  Store,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import { StoreLoadingSkeleton } from "@/app/store/Stores";

// Zod schema for inventory update
const inventoryUpdateSchema = z.object({
  store_id: z.number().min(0, "Store id is required"),
  department_id: z.number().min(0, "Department id is required"),
  product_id: z.number().min(0, "Prouduct id is required"),
  stock_level: z.number().min(0, "Stock level cannot be negative"),
});

type InventoryUpdateFormData = z.infer<typeof inventoryUpdateSchema>;

interface StoreCardProps {
  store: IStoreData; // Comes from stores array item
}

interface Props {
  slug: string;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const [deleteStore] = useDeleteStoreMutation();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      try {
        await deleteStore(store.id).unwrap();
        toast("Store deleted successfully");
      } catch (error) {
        toast("Failed to delete store");
      }
    }
  };
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{store.name}</CardTitle>
              {/* to do this is only for development in production this is hidden  */}
              <CardDescription>Store ID: {store.id}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{store.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Ruler className="h-4 w-4 text-gray-500" />
            <Badge variant="secondary">{store.size}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InventoryDescription = ({ slug }: Props) => {    
  const [showInventory, setShowInventory] = useState(false);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: stores, isLoading, error } = useGetStoreQuery("");
  const { data: product } = useGetProductDetailQuery(slug);
  const [putInventory, { isLoading: isUpdating }] = usePutInventoryMutation();

  const { data: productInventory, refetch } = useGetInventoryQuery(
    {
      store_id: storeId || 0,
      department_id: product?.department_id || 0,
      product_id: product?.id || 0,
    },
    { skip: !storeId }
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<InventoryUpdateFormData>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
       store_id: storeId || 0,
      department_id: product?.department_id || 0,
      product_id: product?.id || 0,
      stock_level: 0,
    },
  });

  // Update form when productInventory changes
  useEffect(() => {
    if (productInventory) {
      setValue("stock_level", productInventory.stock_level);
    }
  }, [productInventory, setValue]);

  const handleInventory = (id: number) => {
    setShowInventory(true);
    setStoreId(id);
    setIsEditing(false);
  };

  const closeAllModals = () => {
    setShowInventory(false);
    setStoreId(null);
    setIsEditing(false);
    reset();
  };

  const handleEditClick = () => {
    setIsEditing(true);
    if (productInventory) {
      setValue("stock_level", productInventory.stock_level);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (productInventory) {
      setValue("stock_level", productInventory.stock_level);
    }
  };

  const onSubmit = async (data: InventoryUpdateFormData) => {
    if (!storeId || !product) return;

    // debugger;

    try {
      await putInventory({
        store_id: storeId,
        department_id: product.department_id,
        product_id: product.id,
        data: data,
      }).unwrap();

      toast.success("Inventory updated successfully!");
      setIsEditing(false);
      refetch(); // Refresh the inventory data
    } catch (error) {
      toast.error("Failed to update inventory");
      console.error("Error updating inventory:", error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error loading stores
          </h2>
          <p className="text-gray-600">
            Unable to fetch store data. Please try again.
          </p>
        </div>
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
        <SiteHeader title={"Your Inventory"} />

        <div className="flex items-center space-x-3 m-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Select Store</h1>
            <p className="text-gray-600">See the inventory of your Store</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <StoreLoadingSkeleton key={index} />
            ))
          ) : stores && stores.length > 0 ? (
            stores.map((store) => (
              <div
                key={store.id}
                onClick={() => {
                  handleInventory(store.id);
                }}
              >
                <StoreCard store={store} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No stores found
              </h2>
              <p className="text-gray-600 mb-4">
                Get started by creating your first store
              </p>
            </div>
          )}
        </div>

        {showInventory && productInventory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {product?.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Inventory Management
                  </p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-green-600">
                    ${product?.price}
                  </span>
                  <Badge variant="outline" className="text-blue-600">
                    {stores?.find((s) => s.id === storeId)?.name}
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {product?.description}
                </p>
              </div>

              <div className="space-y-4 mb-6">
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
                        {productInventory.stock_level}
                      </span>
                      <Badge
                        variant={
                          productInventory.stock_level > 10
                            ? "default"
                            : "destructive"
                        }
                        className="text-white"
                      >
                        {productInventory.stock_level > 10
                          ? "In Stock"
                          : "Low Stock"}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Last Updated
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(
                      productInventory.last_updated
                    ).toLocaleDateString()}{" "}
                    at{" "}
                    {new Date(
                      productInventory.last_updated
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default InventoryDescription;
