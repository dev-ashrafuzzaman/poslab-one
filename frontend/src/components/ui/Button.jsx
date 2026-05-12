import { motion } from "framer-motion";
import clsx from "clsx";
import { sizeMap, variantMap } from "../../constants/uiConfig";


const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  prefix,
  suffix,
  onClick,
  className = "",
  disabled = false,
  style = {},
  ...props
}) => {
  // For action button size, override size classes
  const isActionSize = size === "ac";
  const computedClass = clsx(
    isActionSize ? "action-btn" : sizeMap[size],
    isActionSize ? variantMap[variant] : variantMap[variant],
    className
  );

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      type={type}
      onClick={onClick}
      className={computedClass}
      disabled={disabled}
      style={style}
      {...props}>
      {prefix && <span className="mr-2 flex items-center">{prefix}</span>}
      {children}
      {suffix && <span className="ml-2 flex items-center">{suffix}</span>}
    </motion.button>
  );
};

export default Button;
