import { FC, ReactNode } from "react";
import { Navbar } from "../compoents";

export const Layout: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto">{children}</div>
    </>
  );
};
