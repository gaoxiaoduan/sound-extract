import { FC } from "react";
import { Success } from "../assets/svg/Success.tsx";
import ReactDOM from "react-dom/client";

interface IAlertSuccessProps {
  message: string;
}

export const AlertSuccess: FC<IAlertSuccessProps> = ({ message = "" }) => {
  return (
    <>
      <Success />
      <span>{message}</span>
    </>
  );
};

export const messageApi = {
  success: (message: string) => {
    const container = document.createElement("div");
    container.role = "alert";
    container.className =
      "alert alert-success shadow-lg fixed top-[8px] w-auto left-1/2 transform -translate-x-1/2 z-50 transition duration-300";
    document.body.appendChild(container);
    ReactDOM.createRoot(container).render(<AlertSuccess message={message} />);

    setTimeout(() => {
      container.remove();
    }, 1000 * 3);
  },
};
