const { z } = require("zod");

 const createDealSchema = z.object({
  integrationId: z.string().optional().nullable(),
  catalogueId: z.string().optional().nullable(),

  name: z.string().optional(),

  couponCode: z.string().optional().transform(value =>
    value ? value.trim().toUpperCase() : ""
  ),

  descriptions: z.array(z.string()).optional().default([]),

  discountType: z.enum(["percentage", "flat", "bogo"]).optional(),
  discountValue: z.number().min(0).optional(),

  buyQuantity: z.number().min(0).optional().default(0),
  getQuantity: z.number().min(0).optional().default(0),

  startDate: z.string().optional(),
  endDate: z.string().optional(),

  minOrderValue: z.number().min(0).optional().default(0),
  maxDiscount: z.number().min(0).optional().default(0),

  usageLimit: z.number().min(0).optional().default(0),
  perUserLimit: z.number().min(0).optional().default(0),
});


 const updateDealSchema = z.object({
  integrationId: z.string().optional().nullable(),
  catalogueId: z.string().optional().nullable(),

  name: z.string().optional(),

  couponCode: z.string().optional().transform(value =>
    value ? value.trim().toUpperCase() : ""
  ),

  descriptions: z.array(z.string()).optional().default([]),

  discountType: z.enum(["percentage", "flat", "bogo"]).optional(),
  discountValue: z.number().min(0).optional(),

  buyQuantity: z.number().min(0).optional().default(0),
  getQuantity: z.number().min(0).optional().default(0),

  startDate: z.string().optional(),
  endDate: z.string().optional(),

  minOrderValue: z.number().min(0).optional().default(0),
  maxDiscount: z.number().min(0).optional().default(0),

  usageLimit: z.number().min(0).optional().default(0),
  perUserLimit: z.number().min(0).optional().default(0),

});


module.exports = { createDealSchema, updateDealSchema };