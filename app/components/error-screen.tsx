import type { ReactNode } from "react";

interface ErrorScreenProps {
  children: ReactNode;
}

export function ErrorScreen({ children }: ErrorScreenProps) {
  return (
    <div className="h-full flex flex-1 items-center justify-center text-center">
      {children}
    </div>
  );
}
