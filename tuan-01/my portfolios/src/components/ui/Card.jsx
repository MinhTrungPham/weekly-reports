import { Card as AntCard } from "antd";

function Card({ children, className = "", ...props }) {
  return (
    <AntCard className={`portfolio-card ${className}`} {...props}>
      {children}
    </AntCard>
  );
}

export default Card;
