const { z } = require("zod");

const trimmedString = (maxChars = 100, maxWords = 30) =>
  z
    .string()
    .trim()
    .min(1, "Field is required")
    .max(maxChars, `Maximum ${maxChars} characters allowed`)
    .refine((val) => val.split(/\s+/).length <= maxWords, {
      message: `Maximum ${maxWords} words allowed`,
    })
    .transform((val) => val.replace(/\s+/g, " ")); // collapse spaces

const contactSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Contact must be a 10-digit number");


const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{6}$/, "Pincode must be a 6-digit number");


const createAddressSchema = z.object({
  fullName: trimmedString(100, 30),
  contact: contactSchema,
  addressLine1: trimmedString(200, 50),
  addressLine2: z.string().trim().optional(),
  city: trimmedString(50, 10),
  state: trimmedString(50, 10),
  country: z.string().trim().default("India"),
  pincode: pincodeSchema,
  customLabel: z.string().trim().optional(),
  addressType: z
    .enum(["home",  "work", "other"], {
      errorMap: () => ({ message: "Address type is required and must be one of home, work or other" }),
    }),
});



const updateAddressSchema = z.object({
  fullName: trimmedString(100, 30).optional(),
  contact: contactSchema.optional(),
  addressLine1: trimmedString(200, 50).optional(),
  addressLine2: z.string().trim().optional(),
  city: trimmedString(50, 10).optional(),
  state: trimmedString(50, 10).optional(),
  country: trimmedString(50, 10).optional(),
  pincode: pincodeSchema.optional(),
  customLabel: z.string().trim().optional(),
  addressType: z
    .enum(["home", "work", "other"], {
      errorMap: () => ({ message: "Address type is required and must be one of home, work or other"  }),
    }).optional(),
     isDefault: z.boolean().optional(),
});



const deleteAddressParamsSchema = z.object({
  
  addressId: z.string().min(1, "Address ID is required"),
})

module.exports = { createAddressSchema, updateAddressSchema, deleteAddressParamsSchema };
