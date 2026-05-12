import { useRef } from "react";

export default function useScanSound() {
  const successRef = useRef(null);
  const errorRef = useRef(null);

  if (!successRef.current) {
    successRef.current = new Audio("/sounds/scan-success.mp3");
    successRef.current.volume = 0.7;
  }

  if (!errorRef.current) {
    errorRef.current = new Audio("/sounds/scan-error.mp3");
    errorRef.current.volume = 0.7;
  }

  const playSuccess = () => {
    successRef.current.currentTime = 0;
    successRef.current.play().catch(() => {});
  };

  const playError = () => {
    errorRef.current.currentTime = 0;
    errorRef.current.play().catch(() => {});
  };

  return { playSuccess, playError };
}
