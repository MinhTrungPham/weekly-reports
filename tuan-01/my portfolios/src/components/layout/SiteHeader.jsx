import { ArrowUpRight, Menu } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import IconButton from "../ui/IconButton";

const navigation = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Minh Tran home">
        MT<span>.</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <Button className="header-cta" href="#contact" type="primary" icon={<ArrowUpRight size={16} />}>
        Let&apos;s talk
      </Button>
      <IconButton className="menu-button" label="Open navigation" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </IconButton>
      <Drawer title="Navigate" placement="right" onClose={() => setOpen(false)} open={open}>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      </Drawer>
    </header>
  );
}

export default SiteHeader;
