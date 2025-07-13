// Component (DepartmentProduct.tsx)
"use client"
import { useGetStoreInventoryQuery } from "@/redux/api/InventoryApi";
import { useGetProductDetailQuery } from "@/redux/api/ProductApi";
import React from "react";

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
  } = useGetStoreInventoryQuery({
    store_id: storeId,
    department_id: departmentId,
  });

  if (inventoryLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (inventoryError) {
    return (
      <div className="text-red-600 text-center">
        Error loading inventory data
      </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inventoryData.map((product) => (
        <ProductCard
          key={product.product_id}
          productId={product.product_id}
          stockLevel={product.stock_level}
        />
      ))}
    </div>
  );
};

// Individual Product Card Component
interface ProductCardProps {
  productId: number;
  stockLevel: number;
}

const ProductCard = ({ productId, stockLevel }: ProductCardProps) => {
  const {
    data: productDetails,
    isLoading,
    error,
  } = useGetProductDetailQuery(productId);

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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {productDetails?.name || `Product ${productId}`}
        </h3>
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            stockLevel > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          Stock: {stockLevel}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">
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
    </div>
  );
};

export default DepartmentProduct;
