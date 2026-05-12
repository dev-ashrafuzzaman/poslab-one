import { useRef } from "react";
import { printHtml } from "../utils/printHelper";

export default function usePrint(options = {}) {
  const ref = useRef(null);

  const handlePrint = () => {
    if (!ref.current) return;

    printHtml({
      title: options.title,
      pageSize: options.pageSize,
      margin: options.margin,
      styles: options.styles,
      content: ref.current.innerHTML,
    });
  };

  return {
    printRef: ref,
    print: handlePrint,
  };
}
