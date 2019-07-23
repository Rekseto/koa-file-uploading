import { Stream } from "stream";

export function onStreamFinish(stream: Stream) {
  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("err", reject);
  });
}
