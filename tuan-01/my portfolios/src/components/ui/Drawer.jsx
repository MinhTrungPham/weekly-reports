import { Drawer as AntDrawer } from "antd";

function Drawer({ children, ...props }) {
  return <AntDrawer {...props}>{children}</AntDrawer>;
}

export default Drawer;
