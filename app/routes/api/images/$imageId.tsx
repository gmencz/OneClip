import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { brotliDecompress } from "zlib";
import { redis } from "~/utils/redis.server";

export const loader: LoaderFunction = async ({ params }) => {
  const { imageId } = params;
  if (!imageId) {
    return json({ error: "Missing imageId param" }, { status: 400 });
  }

  const compressedImageBuf = await redis.getBuffer(imageId);
  if (!compressedImageBuf) {
    return json({ error: "Invalid imageId" }, { status: 400 });
  }

  const imageBuf = await new Promise<Buffer>((res, rej) => {
    brotliDecompress(compressedImageBuf, (error, result) => {
      if (error) return rej(error);
      res(result);
    });
  });

  return new Response(imageBuf, {
    headers: {
      "Content-Type": "image/png"
    }
  });
};
