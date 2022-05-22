import { IMG_PREFIX } from "~/constants";

function useCopyToClipboard() {
  return async (text: string) => {
    // We have to figure out if the other device wants to share an image or plain text first.
    const [prefix, ...data] = text.split(":");
    if (prefix === IMG_PREFIX) {
      const imageId = data.join("");
      const imageBlob = await fetch(`/api/images/${imageId}`).then(r =>
        r.blob()
      );

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": imageBlob
        })
      ]);

      return;
    }

    await navigator.clipboard.writeText(data.join(""));
  };
}

export { useCopyToClipboard };
