import { cn } from "@/utils/twClassMerge";
import { VariantProps, cva } from "class-variance-authority";
import { ButtonHTMLAttributes, FC, forwardRef } from "react";

export const buttonVariants = cva(
  "poppins-regular flex items-center justify-center hover:opacity-50 hover:cursor-pointer disabled:hover:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "rounded-md px-6 text-white disabled:bg-primary70 mx-auto disabled:opacity-75 rounded-sm",
        ghost: "bg-transparent data-[state=open]:bg-transparent ",
        link: "underline bg-transparent data-[state=open]:bg-transparent ",
      },
      size: {
        default: "px-6 py-2.5 md:mx-auto md:block md:w-1/4",
        sm: "px-4 h-9 md:mx-auto md:block md:w-1/4",
        md: "px-4 h-9",
        lg: "px-8 py-4",
        none: "",
        full: "w-full"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isDisable?: boolean;
}

const Button: FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant, isDisable, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisable}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
