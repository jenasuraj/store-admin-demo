import { z } from "zod"

export const variantAttributeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "color", "number", "select"]),
  options: z.array(z.string()).optional(),
})

export const variantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.number().min(0),
  quantity: z.number().min(0),
  attributes: z.record(z.string(), z.string()),
  imageUrl: z.string().optional(),
  isDefault: z.boolean(),
})

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subheading: z.string(),
  description: z.string(),
  productType: z.string().min(1, "Product type is required"),
  selectedAttributes: z.array(z.string()),
  variants: z.array(variantSchema),
  tags: z.array(z.string()),
  status: z.enum(["draft", "active", "archived"]),
})

export type ProductFormData = z.infer<typeof productSchema>
export type VariantAttribute = z.infer<typeof variantAttributeSchema>
export type Variant = z.infer<typeof variantSchema>

