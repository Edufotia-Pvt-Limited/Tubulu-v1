const { z } = require("zod");

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number().positive("Price must be greater than 0")
  ),
  currency: z.string().optional().default("INR"),
  sku: z.string().optional(),
  category: z.string().optional().default("General"),
  foodType:z.string().optional(),
  subCategory: z.string().optional(),
  speciality: z.string().optional(),
  quantity: z.preprocess(
    (val) => (val !== undefined ? Number(val) : 0),
    z.number().int().nonnegative("Quantity must be 0 or more")
  ).optional().default(0),

  // NEW: Optional number fields
  discountPercentage: z.preprocess(
    (val) => (val !== undefined ? Number(val) : 0),
    z.number().min(0, "Discount percentage must be 0 or more")
  ).optional(),
  discountPrice: z.preprocess(
    (val) => (val !== undefined ? Number(val) : 0),
    z.number().min(0, "Discount price must be 0 or more")
  ).optional(),
  cgst: z.preprocess(
    (val) => (val !== undefined ? Number(val) : 0),
    z.number().min(0, "CGST must be 0 or more")
  ).optional(),
  sgst: z.preprocess(
    (val) => (val !== undefined ? Number(val) : 0),
    z.number().min(0, "SGST must be 0 or more")
  ).optional(),
  otherTaxes: z.preprocess(
    (val) => (val !== undefined ? Number(val) : 0),
    z.number().min(0, "Other taxes must be 0 or more")
  ).optional(),
  isBestseller: z.boolean().optional().default(false),
});

module.exports = { createProductSchema };
