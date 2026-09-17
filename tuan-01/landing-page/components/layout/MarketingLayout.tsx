import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type MarketingLayoutProps = {
  children: ReactNode;
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
