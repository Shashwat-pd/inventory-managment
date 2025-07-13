import React from "react";
import StoreDepartments from "./StoreDepartments";
interface PageProps {
  params: Promise<{ slug: string }>; // params is now a Promise
}
const Departments = async ({ params }: PageProps) => {
  const { slug } = await params;
  return <StoreDepartments slug={slug} />;
};
export const dynamic = "force-dynamic";
export default Departments;
