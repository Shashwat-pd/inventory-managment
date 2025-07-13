import DepartmentProduct from "./DepartmentProduct";

// Page Component (DepartmentProducts.tsx)
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const DepartmentProducts = async ({ params }: PageProps) => {
  // Await params first
  const { slug } = await params;
  const slugArray = slug ?? [];
  
  // Extract store_id and department_id from slug
  const store_id = slugArray[0] ? parseInt(slugArray[0]) : null;
  const department_id = slugArray[1] ? parseInt(slugArray[1]) : null;

  // Handle case where we don't have both IDs
  if (!store_id || !department_id) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Invalid URL</h1>
        <p>Please provide both store ID and department ID in the URL.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Department Products</h1>
      <p className="text-gray-600 mb-4">
        Store ID: {store_id} | Department ID: {department_id}
      </p>
      <DepartmentProduct storeId={store_id} departmentId={department_id} />
    </div>
  );
};

export default DepartmentProducts;