const { z } = require("zod");

const createCustomizationSchema = z.object({
  customizationName: z.string().min(1, "Customization name is required"),
  
  options: z.array(
    z.object({
      name: z.string().min(1, "Option name is required"),
      type: z.enum(['checkbox', 'radio']),
      required: z.boolean().optional().default(false),
      priceType: z.enum(['base', 'adjustment']).optional().default('adjustment'),
     choices: z.array(
        z.object({
          name: z.string().min(1, "Choice name is required"),
          isDefault: z.boolean().optional().default(false),
foodType: z.string().nullable().optional(),          priceAdjustment: z.preprocess(
            (val) => (val !== undefined ? Number(val) : 0),
            z.number().min(0, "Price adjustment must be 0 or more")
          ).optional(),
        })
      ).min(1, "At least one choice is required"),
      isActive: z.boolean().optional().default(true),
      isDeleted: z.boolean().optional().default(false),
    })
  ).optional().default([]),
  isActive: z.boolean().optional().default(true),
  isDeleted: z.boolean().optional().default(false),
});


const addOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  type: z.enum(['checkbox', 'radio']),
  required: z.boolean().optional().default(false),
  priceType: z.enum(['base', 'adjustment']).optional().default('adjustment'),
  choices: z.array(
    z.object({
      name: z.string().min(1, "Choice name is required"),
      isDefault: z.boolean().optional().default(false),
      foodType: z.string().nullable().optional(),         
      priceAdjustment: z.preprocess(
        (val) => (val !== undefined ? Number(val) : 0),
        z.number().min(0, "Price adjustment must be 0 or more")
      ).optional(),
    })
  ).min(1, "At least one choice is required"),
  isActive: z.boolean().optional().default(true),
  isDeleted: z.boolean().optional().default(false),
});

const editOptionSchema = z.object({
  name: z.string().min(1, "Option name is required").optional(),
  type: z.enum(['checkbox', 'radio']).optional(),
  required: z.boolean().optional(),
  priceType: z.enum(['base', 'adjustment']).optional().default('adjustment'),
  choices: z.array(
    z.object({
      name: z.string().min(1, "Choice name is required"),
      isDefault: z.boolean().optional().default(false),
      foodType: z.string().nullable().optional(),  
      priceAdjustment: z.preprocess(
        (val) => (val !== undefined ? Number(val) : 0),
        z.number().min(0, "Price adjustment must be 0 or more")
      ).optional(),
    })
  ).min(1, "At least one choice is required").optional(),

});

module.exports = { createCustomizationSchema, addOptionSchema, editOptionSchema };
