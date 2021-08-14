import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ErrorScreen({ children }: Props) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-12 bg-gray-900 text-center">
      {children}

      <img src="/logo.svg" alt="OneClip" className="h-14 w-14 mb-3 mt-auto" />
    </div>
  );
}
