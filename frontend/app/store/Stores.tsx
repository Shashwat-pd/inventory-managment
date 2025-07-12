"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Store,
  MapPin,
  Ruler,
  MoreVertical,
  Edit,
  Trash2,
  Building2,
  Package,
} from "lucide-react";
import {
  useDeleteStoreMutation,
  useGetStoreQuery,
  usePostStoreMutation,
  usePutStoreMutation,
} from "@/redux/api/StoreApi";
import { IStoreData } from "@/types/types";

// Zod validation schema
const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  location: z.string().min(1, "Location is required"),
  size: z.string().min(1, "Size is required"),
});

type StoreFormData = z.infer<typeof storeSchema>;

interface StoreFormProps {
  store?: IStoreData;
  onClose: () => void;
}
interface StoreCardProps {
  store: IStoreData;    // Comes from stores array item
  onEdit: (store: IStoreData) => void;  // Comes from handleEdit function
}

const StoreForm: React.FC<StoreFormProps> = ({ store, onClose }) => {
  const [postStore] = usePostStoreMutation();
  const [putStore] = usePutStoreMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: store
      ? {
          name: store.name,
          location: store.location,
          size: store.size,
        }
      : undefined,
  });

  const onSubmit = async (data: StoreFormData) => {
    try {
      if (store) {
        await putStore({ id: store.id, data }).unwrap();
        toast("Store updated successfully");
      } else {
        await postStore(data).unwrap();
        toast("Store created successfully");
      }
      reset();
      onClose();
    } catch (error) {
      toast("Failed to save store");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Store Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter store name"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register("location")}
          placeholder="Enter store location"
          className={errors.location ? "border-red-500" : ""}
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="size">Size</Label>
        <Input
          id="size"
          {...register("size")}
          placeholder="Enter store size (e.g., 15ft)"
          className={errors.size ? "border-red-500" : ""}
        />
        {errors.size && (
          <p className="text-sm text-red-500">{errors.size.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : store ? "Update Store" : "Create Store"}
        </Button>
      </div>
    </form>
  );
};

const StoreCard: React.FC<StoreCardProps> = ({ store, onEdit }) => {
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
    <Card className="hover:shadow-lg transition-shadow duration-200">
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
              <DropdownMenuItem onClick={() => onEdit(store)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
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

export const StoreLoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
    </CardContent>
  </Card>
);

const StorePage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<IStoreData | null>(null);

  const { data: stores, isLoading, error } = useGetStoreQuery("");

  const handleEdit = (store: IStoreData) => {
    setSelectedStore(store);
    setIsEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedStore(null);
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Store Management
            </h1>
            <p className="text-gray-600">
              Manage your inventory stores and locations
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Store</DialogTitle>
            </DialogHeader>
            <StoreForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Stores
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores ? new Set(stores.map((s) => s.location)).size : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <StoreLoadingSkeleton key={index} />
          ))
        ) : stores && stores.length > 0 ? (
          stores.map((store) => (
            <StoreCard key={store.id} store={store} onEdit={handleEdit} />
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
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Store
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <StoreForm store={selectedStore} onClose={handleCloseEdit} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorePage;
