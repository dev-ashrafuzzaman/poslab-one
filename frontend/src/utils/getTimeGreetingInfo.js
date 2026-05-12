const getTimeGreetingInfo = () => {
  const hour = new Date().getHours();

  if (hour < 6) return { greeting: "Early Morning", icon: "🌌" };
  if (hour < 12) return { greeting: "Good Morning", icon: "☀️" };
  if (hour < 17) return { greeting: "Good Afternoon", icon: "🌤️" };
  if (hour < 20) return { greeting: "Good Evening", icon: "🌇" };
  return { greeting: "Good Night", icon: "🌙" };
};

export default getTimeGreetingInfo;