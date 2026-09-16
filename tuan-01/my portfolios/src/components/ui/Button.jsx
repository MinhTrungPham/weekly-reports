import { Button as AntButton } from "antd";

function Button({ children, href, icon, type = "default", ...props }) {
  return (
    <AntButton href={href} icon={icon} type={type} {...props}>
      {children}
    </AntButton>
  );
}

export default Button;
