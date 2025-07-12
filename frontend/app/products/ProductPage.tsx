"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDeleteProductMutation,
  useGetProductDetailQuery,
  useGetProductsQuery,
  usePostProductMutation,
  usePutProductMutation,
} from "@/redux/api/ProductApi";
import { useGetDepartmentsQuery } from "@/redux/api/DepartmentsApi";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be a positive number"),
  department_id: z.number().min(1, "Department is required"),
  description: z.string().min(1, "Description is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: number;
  name: string;
  price: number;
  department_id: number;
  description: string;
}

interface Department {
  id: number;
  name: string;
}

const ProductsPage: React.FC = () => {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);

  const router = useRouter();

  // RTK Query hooks
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery("");
  const { data: departmentsData } = useGetDepartmentsQuery("");
  const { data: productDetailData } = useGetProductDetailQuery(
    selectedProductId?.toString() || "",
    { skip: !selectedProductId }
  );

  const [postProduct, { isLoading: isCreating }] = usePostProductMutation();
  const [putProduct, { isLoading: isUpdating }] = usePutProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Form setup
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      department_id: 0,
      description: "",
    },
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  // Set default values for edit form when product detail is loaded
  useEffect(() => {
    if (productDetailData && showEditForm) {
      resetEditForm({
        price: productDetailData.price,
        department_id: productDetailData.department_id,
        description: productDetailData.description,
      });
    }
  }, [productDetailData, showEditForm, resetEditForm]);

  // Handle form submissions
  const onAddProduct = async (data: ProductFormData) => {
    try {
      await postProduct(data).unwrap();
      resetAddForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const onEditProduct = async (data: ProductFormData) => {
    if (!selectedProductId) return;

    try {
      await putProduct({ id: selectedProductId, data }).unwrap();
      setShowEditForm(false);
      setShowProductDetail(false);
      setSelectedProductId(null);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const onDeleteProduct = async () => {
    if (!selectedProductId) return;

    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(selectedProductId).unwrap();
        setShowProductDetail(false);
        setSelectedProductId(null);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  // Handle product card click
  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setShowProductDetail(true);
  };

  // Handle edit button click
  const handleEditClick = () => {
    setShowEditForm(true);
    setShowProductDetail(false);
  };

  const handleInventoryClick = (data: Product) => {
    router.push(`/inventory/${data.id}`);
  };

  // Close all modals
  const closeAllModals = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setShowProductDetail(false);
    setSelectedProductId(null);
  };

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading products...</div>
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
        <SiteHeader title={"Products"} />
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Products</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add New Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsData?.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
              >
                <h3
                  className="text-xl font-semibold mb-2"
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  ${product.price}
                </p>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {product.description}
                </p>
                <div>
                  <button onClick={() => handleInventoryClick(product)}>
                    {" "}
                    See Inventory
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Product Detail Modal */}
          {showProductDetail && productDetailData && (
            <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">
                    {productDetailData.name}
                  </h2>
                  <button
                    onClick={closeAllModals}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    ${productDetailData.price}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {productDetailData.description}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEditClick}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDeleteProduct}
                    disabled={isDeleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Product Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Add New Product</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={handleAddSubmit(onAddProduct)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Name
                    </label>
                    <Controller
                      name="name"
                      control={addControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter product name"
                        />
                      )}
                    />
                    {addErrors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {addErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price
                    </label>
                    <Controller
                      name="price"
                      control={addControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter price"
                        />
                      )}
                    />
                    {addErrors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {addErrors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Department
                    </label>
                    <Controller
                      name="department_id"
                      control={addControl}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={0}>Select a department</option>
                          {departmentsData?.map((dept: Department) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {addErrors.department_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {addErrors.department_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Controller
                      name="description"
                      control={addControl}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter product description"
                        />
                      )}
                    />
                    {addErrors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {addErrors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isCreating ? "Adding..." : "Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {showEditForm && productDetailData && (
            <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Edit Product</h2>
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={handleEditSubmit(onEditProduct)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Name
                    </label>
                    <Controller
                      name="name"
                      control={editControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter product name"
                        />
                      )}
                    />
                    {editErrors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {editErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price
                    </label>
                    <Controller
                      name="price"
                      control={editControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter price"
                        />
                      )}
                    />
                    {editErrors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {editErrors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Department
                    </label>
                    <Controller
                      name="department_id"
                      control={editControl}
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={0}>Select a department</option>
                          {departmentsData?.map((dept: Department) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {editErrors.department_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {editErrors.department_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Controller
                      name="description"
                      control={editControl}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter product description"
                        />
                      )}
                    />
                    {editErrors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {editErrors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? "Updating..." : "Update Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProductsPage;
