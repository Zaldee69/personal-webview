import { cn } from "@/utils/twClassMerge";
import { VariantProps, cva } from "class-variance-authority";
import { HTMLAttributes, forwardRef } from "react";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";

const labelVariants = cva("block text-neutral200 font-poppins", {
  variants: {
    size: {
      default: "text-sm",
      lg: "text-2xl",
      md: "text-xl",
      base: "text-base"
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface LabelProps
  extends HTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
      htmlFor: string,
      disabled?: boolean
    }

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size, children, disabled, htmlFor,  ...props }, ref) => {
    const themeConfiguration = useSelector((state: RootState) => state.theme);
    return (
      <label
      style={{
        color: !themeConfiguration.data.font_color
          ? "#6B778C"
          : themeConfiguration.data.font_color,
      }}
        htmlFor={htmlFor}
        ref={ref}
        {...props}
        className={cn(labelVariants({ size, className }))}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

export default Label;
