export interface IParsedFile {
  fieldname: string;
  file: NodeJS.ReadableStream;
  filename: string;
  encoding: string;
  mimeType: string;
}
