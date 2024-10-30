import { FC } from "react";
import { Success, Error } from "../assets/svg/Success.tsx";
import ReactDOM from "react-dom/client";

// 定义消息类型
type MessageType = 'success' | 'error';

interface IAlertSuccessProps {
  message: string;
  type: MessageType;
}

export const Alert: FC<IAlertSuccessProps> = ({ message = "", type = 'success' }) => {
  return (
    <>
      {type === 'success' ? <Success /> : <Error />}
      <span>{message}</span>
    </>
  );
};

// 创建消息的通用函数
const createMessage = (message: string, type: MessageType) => {
  const container = document.createElement("div");
  container.role = "alert";
  container.className = `alert alert-${type} shadow-lg fixed top-[8px] w-auto left-1/2 transform -translate-x-1/2 z-50 transition duration-300`;

  document.body.appendChild(container);
  ReactDOM.createRoot(container).render(<Alert message={message} type={type} />);

  setTimeout(() => {
    container.remove();
  }, 1000 * 3);
};

export const messageApi = {
  success: (message: string) => createMessage(message, 'success'),
  error: (message: string) => createMessage(message, 'error')
};
