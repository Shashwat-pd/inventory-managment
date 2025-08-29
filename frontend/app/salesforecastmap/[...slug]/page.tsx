import SalesForeCastPageMap from "./SaleForeCastMap";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const SalesForeCastMap = async ({ params }: PageProps) => {
  const { slug } = await params;

  const slugArray = slug ?? [];

  const store_id = slugArray[0] ? parseInt(slugArray[0]) : null;
  const department_id = slugArray[1] ? parseInt(slugArray[1]) : null;

  if (!store_id || !department_id) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Invalid URL</h1>
        <p>Please provide both store ID and department ID in the URL.</p>
      </div>
    );
  }
  return (
    <div>
      <SalesForeCastPageMap storeId={store_id} departmentId={department_id} />
    </div>
  );
};

export default SalesForeCastMap;
