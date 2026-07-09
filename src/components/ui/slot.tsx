import * as React from "react";

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const Slot = React.forwardRef<HTMLElement, SlotProps>((props, ref) => {
  const { children, ...rest } = props;
  if (children && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...rest,
      // @ts-expect-error - merge refs
      ref,
    });
  }
  return null;
});
Slot.displayName = "Slot";

export { Slot };
export type { SlotProps };
