const { z } = require("zod");

const createAdvertisementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

module.exports = { createAdvertisementSchema };
