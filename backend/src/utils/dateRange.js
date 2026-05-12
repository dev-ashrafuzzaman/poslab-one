export const resolveDateRange = (range) => {
  const now = new Date();

  let from = null;
  let to = new Date();

  switch (range) {
    case "today": {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }

    case "this_week": {
      const day = now.getDay() || 7;
      from = new Date(now);
      from.setDate(now.getDate() - day + 1);
      from.setHours(0, 0, 0, 0);
      break;
    }

    case "this_month": {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }

    case "this_year": {
      from = new Date(now.getFullYear(), 0, 1);
      break;
    }

    default: {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  }

  return { from, to };
};