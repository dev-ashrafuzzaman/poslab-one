export const STOCK_TYPE = Object.freeze({
  IN: "in",
  OUT: "out",
  ADJUSTMENT: "adjustment"
});

export const STOCK_REASON = Object.freeze({
  PURCHASE: "purchase",
  SALE: "sale",
  RETURN: "return",
  DAMAGE: "damage",
  MANUAL: "manual"
});

export const PRODUCT_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive"
});

export const VARIANT_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive"
});


export const SALE_STATUS = Object.freeze({
  DRAFT: "draft",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RETURNED: "returned"
});

export const PAYMENT_STATUS = Object.freeze({
  PAID: "paid",
  PARTIAL: "partial",
  UNPAID: "unpaid"
});


export const PURCHASE_STATUS = Object.freeze({
  DRAFT: "draft",
  RECEIVED: "received",
  CANCELLED: "cancelled"
});
