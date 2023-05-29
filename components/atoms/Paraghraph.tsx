import { cn } from "@/utils/twClassMerge";
import { VariantProps, cva } from "class-variance-authority";
import { HTMLAttributes, forwardRef } from "react";
import { RootState } from "@/redux/app/store";
import { useSelector } from "react-redux";

const paragraphVariants = cva("text-neutral800 font-poppins", {
  variants: {
    size: {
      default: "text-base",
      md: "text-lg",
      sm: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface ParagraphProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {}

const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, size, children, ...props }, ref) => {
    const themeConfiguration = useSelector((state: RootState) => state.theme);

    return (
      <p
        style={{
          color: !themeConfiguration.data.font_color
            ? "#172B4D"
            : themeConfiguration.data.font_color,
        }}
        ref={ref}
        {...props}
        className={cn(paragraphVariants({ size, className }))}
      >
        {children}
      </p>
    );
  }
);

Paragraph.displayName = "Paragraph";

export default Paragraph;
