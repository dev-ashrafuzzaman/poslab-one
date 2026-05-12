// discounts/discount.utils.js

/* ================================
   Bangladesh Business Date Utils
================================ */
export const getBDNow = () => {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    })
  );
};

export const getBDMidnight = (date = new Date()) => {
  const bd = new Date(
    new Date(date).toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
    })
  );
  bd.setHours(0, 0, 0, 0);
  return bd;
};

/* ================================
   Discount Calculation
================================ */
export const calculateDiscount = ({
  salePrice,
  type,
  value,
}) => {
  // Convert to poisha
  const priceInMinor = Math.round(salePrice * 100);

  let discountInMinor = 0;

  if (type === "PERCENT") {
    discountInMinor = Math.round(
      (priceInMinor * value) / 100
    );
  }

  if (type === "FLAT") {
    discountInMinor = Math.round(value * 100);
  }

  // Prevent negative
  const finalInMinor = Math.max(
    priceInMinor - discountInMinor,
    0
  );

  return {
    discountAmount: discountInMinor / 100,
    finalPrice: finalInMinor / 100,
  };
};
