
import React from 'react'
import InventoryDescription from './InventoryDescription';

interface PageProps {
  params: Promise<{ slug: string }>; // params is now a Promise
}

const DescriptionPage = async ({ params }: PageProps) => {
  const { slug } = await params; // Await the entire params object
  return <InventoryDescription id= {slug} />
};

export const dynamic = "force-dynamic";
export default DescriptionPage;
