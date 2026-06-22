const { z } = require("zod");

// Helper to trim, collapse spaces, limit characters and words


const trimmedString = (maxChars = 50, maxWords = 30) =>
  z.string()
    .trim()
    .max(maxChars, `Maximum ${maxChars} characters allowed`)
    .refine((val) => val.split(/\s+/).length <= maxWords, {
      message: `Maximum ${maxWords} words allowed`,
    })
    .transform((val) => val.replace(/\s+/g, " "));


// Upload validation
const uploadCatalogueSchema = z.object({
  name: trimmedString(50, 30),
  description: trimmedString(500, 100),
  displayType: z.enum(["Grid View", "List View"]).optional(),
  deliveryType: z.array(
    z.enum(["Delivery", "Pick-up", "Dine-in", "Room-service"])
  ).optional()
});

// Update validation
const updateCatalogueSchema = z.object({
  name: trimmedString(50, 30).optional(),
  description: trimmedString(500, 100).optional(),
  mode: z.enum(["replace", "append"]).optional(),
  displayType: z.enum(["Grid View", "List View"]).optional(),
  deliveryType: z.array(z.enum(['Delivery', 'Pick-up', 'Dine-in', 'Room-service'])).optional()


});

module.exports = {
  uploadCatalogueSchema,
  updateCatalogueSchema,
};
