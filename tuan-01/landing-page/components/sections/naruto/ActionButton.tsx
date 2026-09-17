"use client";

import { Button } from "@buildo/bento-design-system";

export function ActionButton({ label }: { label: string }) {
  return <Button label={label} onPress={() => {}} kind="solid" hierarchy="primary" />;
}
