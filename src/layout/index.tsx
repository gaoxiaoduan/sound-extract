import { FC, ReactNode } from "react";
import { Navbar } from "../components";

export const Layout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>{children}</div>
    </>
  );
};
