import { useCallback, useEffect, useState } from "react";

function useClipboard() {
  let [error, setError] = useState<string | null>(null);
  let [text, setText] = useState("");

  useEffect(() => {
    async function readClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        setText(text);
      } catch (error) {
        setError(error);
      }
    }

    readClipboard();
  }, []);

  let copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setText(text);
  }, []);

  return {
    text,
    error,
    copy
  };
}

export { useClipboard };
