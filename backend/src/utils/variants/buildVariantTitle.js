export const buildVariantTitle = (
  productName,
  attributes = {},
) => {
  return `${productName} - ${Object.values(attributes).join(" / ")}`;
};