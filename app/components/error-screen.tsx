import { ReactNode } from "react";
import { Header } from "./header";

type Props = {
  children: ReactNode;
};

export function ErrorScreen({ children }: Props) {
  return (
    <div className="flex flex-col justify-center items-center h-full p-12 bg-gray-900 text-center">
      <Header />
      {children}

      <img src="/logo.svg" alt="OneClip" className="h-14 w-14 mb-3 mt-auto" />
    </div>
  );
}
