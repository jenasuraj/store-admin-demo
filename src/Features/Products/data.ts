import type { VariantAttribute } from "./ProductTypes"

export const MOCK_ATTRIBUTES: VariantAttribute[] = [
  {
    id: "color",
    name: "Color",
    type: "color",
    options: ["Red", "Blue", "Green", "Black", "White"],
  },
  {
    id: "size",
    name: "Size",
    type: "select",
    options: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "material",
    name: "Material",
    type: "select",
    options: ["Cotton", "Polyester", "Wool", "Silk"],
  },
  {
    id: "style",
    name: "Style",
    type: "text",
  },
  {
    id: "weight",
    name: "Weight (g)",
    type: "number",
  },
]

