import { useState } from "react";

export const useForceUpdate = () => {
  const [, setFlag] = useState(0);
  return () => setFlag((flag) => flag + 1);
};
