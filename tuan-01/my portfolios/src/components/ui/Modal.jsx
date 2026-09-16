import { Modal as AntModal } from "antd";

function Modal({ children, ...props }) {
  return <AntModal {...props}>{children}</AntModal>;
}

export default Modal;
