import { FC, ReactNode } from "react";
import { Navbar } from "../components";

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
