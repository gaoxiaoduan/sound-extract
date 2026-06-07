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
  
  const bgColor = type === 'success' ? '#10b981' : '#ef4444';
  
  container.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    background-color: ${bgColor};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    animation: fadeIn 0.3s ease;
  `;

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
