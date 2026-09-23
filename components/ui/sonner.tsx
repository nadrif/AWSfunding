"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "!rounded-2xl !border-border !shadow-lg !font-sans",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
