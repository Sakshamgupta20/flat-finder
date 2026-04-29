import { PROPERTIES } from "@/lib/data";
import { PropertyDetailClient } from "./PropertyDetailClient";

// Static export needs every dynamic param enumerated at build time.
export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

// Don't try to render unknown ids on demand — they'd 404 from Pages anyway.
export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyDetailClient id={id} />;
}
