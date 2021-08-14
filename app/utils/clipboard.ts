import { useCallback, useEffect, useState } from "react";

type Clipboard = {
  status: "loading" | "success" | "error";
  text: string;
};

function useClipboard() {
  let [clipboard, setClipboard] = useState<Clipboard>({
    status: "loading",
    text: ""
  });

  useEffect(() => {
    async function init() {
      try {
        const text = await navigator.clipboard.readText();
        setClipboard({
          status: "success",
          text
        });
      } catch (error) {
        setClipboard({
          status: "error",
          text: ""
        });
      }
    }

    init();
  }, []);

  let copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setClipboard(c => ({
      ...c,
      text
    }));
  }, []);

  return {
    ...clipboard,
    copy
  };
}

export { Clipboard, useClipboard };
