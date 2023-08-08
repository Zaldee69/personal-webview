import { cn } from "@/utils/twClassMerge";
import { VariantProps, cva } from "class-variance-authority";
import { HTMLAttributes, forwardRef } from "react";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";

const headingVariants = cva(
  "text-neutral800 font-poppins font-semibold",
  {
    variants: {
      size: {
        default: "text-lg",
        lg: "text-3xl",
        md: "text-xl",
        sm: "text-base"
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size, children, ...props }, ref) => {
    const themeConfiguration = useSelector((state: RootState) => state.theme);
    return (
      <h1
      style={{
        color: !themeConfiguration.data.font_color
          ? "#172B4D"
          : themeConfiguration.data.font_color,
      }}
        ref={ref}
        {...props}
        className={cn(headingVariants({ size, className }))}
      >
        {children}
      </h1>
    );
  }
);

Heading.displayName = "Heading";

export default Heading;
