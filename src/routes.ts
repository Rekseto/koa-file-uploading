import * as Router from "koa-router";
import * as Busboy from "busboy";
import * as path from "path";
import * as uuidv1 from "uuid/v1";
import * as fs from "fs";

import { onStreamFinish } from "./utils/streamUtils";
import { IParsedFields } from "./interfaces/IParsedFields.interface";
import { IParsedFile } from "./interfaces/IPrasedFile.interface";

const supportedExtensions: string[] = [".png", ".jpg", ".jpeg"];

const isSupportedExtension = (filename: string): boolean =>
  supportedExtensions.includes(path.extname(filename));

const uploadPath: string = path.join(__dirname, "../upload");

const savePath = (uuid: string, filename: string): string => {
  return path.join(uploadPath, uuid + path.extname(filename));
};
export default function(router: Router) {
  router.get("/", async ctx => {
    await ctx.render("uploadImage");
  });

  router.post("/", async ctx => {
    const { headers } = ctx;

    if (headers["content-length"] / (1024 * 1000) > 10) {
      throw new Error("Too big file");
    }

    const uploading = new Promise((resolve, reject) => {
      const busboy = new Busboy({ headers });
      const streams: Promise<any>[] = [];
      const parsingResult: { files: IParsedFile[]; fields: IParsedFields } = {
        files: [],
        fields: {}
      };

      busboy.on("file", function(
        fieldname: string,
        file: NodeJS.ReadableStream,
        filename: string,
        encoding: string,
        mimeType: string
      ) {
        if (!isSupportedExtension(filename)) {
          reject(new Error("File extension is not supported"));
        } else {
          const uuid: string = uuidv1(); // We will save file under uuid on disk

          const parsedFile = {
            filename: filename,
            filePath: savePath(uuid, filename),
            encoding,
            fieldname,
            mimeType,
            file
          };

          parsingResult.files.push(parsedFile);

          const write = fs.createWriteStream(parsedFile.filePath);

          file.pipe(write);

          streams.push(onStreamFinish(write));
        }

        file.resume();
      });

      busboy.on("field", function(fieldname, value) {
        parsingResult.fields[fieldname] = value;
      });

      busboy.on("finish", async () => {
        if (streams.length > 0) {
          Promise.all(streams)
            .then(resolve)
            .catch(reject);
        }
      });

      ctx.req.pipe(busboy);
    });

    try {
      await uploading;

      await ctx.render("uploadImage");
    } catch (error) {
      ctx.body = { success: false }; // Render template error
    }
  });
}
