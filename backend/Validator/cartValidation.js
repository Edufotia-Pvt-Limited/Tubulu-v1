const { z } = require("zod");


const selectedOptionSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
 selectedChoices: z.array(z.string().min(1, "Choice ID is required"))
});

const createCartForCustomizedProductSchema = z.object({
  integrationId: z.string().min(1, "Integration ID is required"),
  catalogueId: z.string().min(1, "Catalogue ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive().default(1),
   customizationId: z.string().nullable().optional(),
  selectedOptions: z.array(selectedOptionSchema).optional().default([]),
  specialRequest: z.string().optional().default(""),

});



module.exports = {
  createCartForCustomizedProductSchema
};
