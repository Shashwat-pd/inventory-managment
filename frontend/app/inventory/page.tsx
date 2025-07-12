"use client";
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
  Edit,
  MapPin,
  MoreVertical,
  Package,
  Plus,
  Ruler,
  Store,
  Trash2,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { StoreLoadingSkeleton } from "../store/Stores";

interface StoreCardProps {
  store: IStoreData; // Comes from stores array item
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
    <Card className="hover:shadow-lg transition-shadow duration-200" onClick={() =>{}}>
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
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => onEdit(store)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem> */}
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

const InventoryPage = () => {
  const { data: stores, isLoading, error } = useGetStoreQuery("");

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <StoreLoadingSkeleton key={index} />
        ))
      ) : stores && stores.length > 0 ? (
        stores.map((store) => <StoreCard key={store.id} store={store} />)
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
  );
};

export default InventoryPage;
