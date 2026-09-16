import { Tag as AntTag } from "antd";

function Tag({ children, ...props }) {
  return <AntTag {...props}>{children}</AntTag>;
}

export default Tag;
