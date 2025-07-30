import React from "react";

const Button = React.forwardRef(({ className, type, children, ...props }, ref) => {
  return (
    <button
      type={type}
      className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };