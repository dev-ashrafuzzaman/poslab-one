export const generateVariants = (variants = []) => {
  if (!variants.length) {
    return [];
  }

  const result = [];

  const recurse = (index, current) => {
    if (index === variants.length) {
      result.push(current);
      return;
    }

    const variant = variants[index];

    for (const value of variant.values) {
      recurse(index + 1, {
        ...current,
        [variant.name]: value,
      });
    }
  };

  recurse(0, {});

  return result;
};