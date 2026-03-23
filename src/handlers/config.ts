import type { FileData, FileFormat, FormatHandler } from "../FormatHandler.ts";
import CommonFormats from "src/CommonFormats.ts";
import * as ini from 'ini';

class configHandler implements FormatHandler {
  public name: string = "config";
  public supportedFormats?: FileFormat[];
  public ready: boolean = false;

  private readonly cfgExt = ['ini', 'cfg', 'cnf', 'conf', 'cf'];

  async init() {
    this.supportedFormats = [
      CommonFormats.JSON.builder("json").allowFrom(true).allowTo(true),
      {
        name: "INI Configuration File",
        format: "ini",
        extension: "ini",
        mime: "text/plain",
        from: true,
        to: true,
        internal: "ini",
        lossless: true,
      },
      {
        name: "Configuration File",
        format: "cfg",
        extension: "cfg",
        mime: "text/plain",
        from: true,
        to: true,
        internal: "ini",
        lossless: true,
      },
      {
        name: "Configuration File",
        format: "cnf",
        extension: "cnf",
        mime: "text/plain",
        from: true,
        to: true,
        internal: "ini",
        lossless: true,
      },
      {
        name: "Configuration File",
        format: "conf",
        extension: "conf",
        mime: "text/plain",
        from: true,
        to: true,
        internal: "ini",
        lossless: true,
      },
      {
        name: "Configuration File",
        format: "cf",
        extension: "cf",
        mime: "text/plain",
        from: true,
        to: true,
        internal: "ini",
        lossless: true,
      },
      {
        name: "RIVALS Configuration File", // https://www.roblox.com/games/17625359962
        format: "txt",
        extension: "txt",
        mime: "text/plain",
        from: true,
        to: true,
        internal: "txt",
        lossless: true,
      },
    ];
    this.ready = true;
  }

  async doConvert(
    inputFiles: FileData[],
    inputFormat: FileFormat,
    outputFormat: FileFormat,
  ): Promise<FileData[]> {
    const outputFiles: FileData[] = [];
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const cfgRegex = new RegExp(`\\.(${this.cfgExt.join('|')})$`, 'i');

    // rivals -> json
    if (inputFormat.name === "RIVALS Configuration File" && outputFormat.internal === "json") {
      for (const file of inputFiles) {
        const content = decoder.decode(file.bytes);
        const decoded = content
          .split("")
          .reverse()
          .map((char) => String.fromCharCode(char.charCodeAt(0) - 1))
          .join("");

        outputFiles.push({
          name: file.name.replace(/\.txt$/i, ".json"),
          bytes: encoder.encode(decoded),
        });
      }
    }

    // json -> rivals
    if (inputFormat.internal === "json" && outputFormat.name === "RIVALS Configuration File") {
      for (const file of inputFiles) {
        const content = decoder.decode(file.bytes);
        const encoded = content
          .split("")
          .map((char) => String.fromCharCode(char.charCodeAt(0) + 1))
          .reverse()
          .join("");

        outputFiles.push({
          name: file.name.replace(/\.json$/i, ".txt"),
          bytes: encoder.encode(encoded),
        });
      }
    }

    // config -> json
    if (inputFormat.internal === "ini" && outputFormat.internal === "json") {
      for (const file of inputFiles) {
        const decode = decoder.decode(file.bytes);
        const parsed = ini.parse(decode);
        const stringified = JSON.stringify(parsed, null, 2);

        outputFiles.push({
          name: file.name.replace(cfgRegex, ".json"),
          bytes: encoder.encode(stringified),
        });
      }
    }

    // json -> config
    if (inputFormat.internal === "json" && outputFormat.internal === "ini") {
      for (const file of inputFiles) {
        const decode = decoder.decode(file.bytes);
        const parsed = JSON.parse(decode);
        const stringified = ini.stringify(parsed);

        outputFiles.push({
          name: file.name.replace(/\.json$/i, `.${outputFormat.extension}`),
          bytes: encoder.encode(stringified),
        });
      }
    }

    // config -> config
    if (inputFormat.internal === outputFormat.internal) {
      for (const file of inputFiles) {
        outputFiles.push({
          name: file.name.replace(cfgRegex, `.${outputFormat.extension}`),
          bytes: file.bytes,
        });
      }
    }

    if (outputFiles.length === 0) {
      throw new Error(
        `configHandler does not support route: ${inputFormat.internal} -> ${outputFormat.internal}`,
      );
    }

    return outputFiles;
  }
}

export default configHandler;
