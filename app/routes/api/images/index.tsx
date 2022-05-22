import type { ActionFunction } from "@remix-run/node";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import { unstable_composeUploadHandlers } from "@remix-run/node";
import { unstable_parseMultipartFormData, json } from "@remix-run/node";
import { nanoid } from "nanoid";
import { Writable } from "stream";
import { brotliCompress } from "zlib";
import { redis } from "~/utils/redis.server";

class WritableFileStream extends Writable {
  private chunks: any[] = [];
  private buffer: Buffer = Buffer.from([]);

  _write(
    chunk: any,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.chunks.push(chunk);
    callback();
  }

  _final(callback: (error?: Error | null) => void): void {
    this.buffer = Buffer.concat(this.chunks);
    callback();
  }

  getBuffer() {
    return this.buffer;
  }
}

async function uploadImageToRedis(data: AsyncIterable<Uint8Array>) {
  const compressedBuf = await new Promise<Buffer>(async (res, rej) => {
    const stream = new WritableFileStream();

    stream.on("finish", async () => {
      const buffer = stream.getBuffer();
      const compressedBuf = await new Promise<Buffer>((res, rej) => {
        brotliCompress(buffer, (error, result) => {
          if (error) return rej(error);
          res(result);
        });
      });

      res(compressedBuf);
    });

    await writeAsyncIterableToWritable(data, stream);
  });

  const imageId = `img-${nanoid()}`;
  await redis.set(imageId, compressedBuf, "EX", 86400); // Expires in 24 hours.
  return imageId;
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  const uploadHandler = unstable_composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== "image") {
        return undefined;
      }

      const imageId = uploadImageToRedis(data);
      return imageId;
    }
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const imageId = formData.get("image");
  return json({ imageId });
};
