export const sendCustomerNotification = async ({
  customer,
  message,
  channel = "SMS"
}) => {
  if (!customer.phone) return;

  if (channel === "SMS") {
    console.log("📩 SMS Sent:", customer.phone, message);
  }

  if (channel === "WHATSAPP") {
    console.log("💬 WhatsApp Sent:", customer.phone, message);
  }
};
