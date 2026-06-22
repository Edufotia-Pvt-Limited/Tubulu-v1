import { Catalogue } from "src/types/catalogue";

export function formatCatalogue(c: any): Catalogue {
  return {
    id: c.id || c._id,
    name: c.name,
    description: c.description,
    displayType: c.displayType || 'List View',
    deliveryType: c.deliveryType || 'Delivery',

    active: c.isActive,
    products: c.products || [],
    status:
      c.status === "complete"
        ? "Completed"
        : c.status === "pending"
        ? "In Progress"
        : c.status === "failed"
        ? "Failed"
        : c.status === "active"
        ? "Active"
        : "In Progress",
    createdAt: c.createdAt,
    // updatedAt: c.updatedAt,
  };
}
