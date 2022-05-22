function useCopyToClipboard() {
  return async (text: string) => {
    await navigator.clipboard.writeText(text);
  };
}

export { useCopyToClipboard };
