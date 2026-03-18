import type { FileData, FileFormat, FormatHandler } from "../FormatHandler.ts";
import CommonFormats from "src/CommonFormats.ts";
import * as ini from 'ini';
import * as yaml from 'yaml';

class configHandler implements FormatHandler {
  public name: string = "cfg";
  public supportedFormats?: FileFormat[];
  public ready: boolean = false;

  private readonly cfgExt = ['ini', 'cfg', 'cnf', 'conf', 'cf'];
  private readonly yamlExt = ['yaml', 'yml'];

  async init() {
    this.supportedFormats = [
      CommonFormats.JSON.builder("json").markLossless().allowFrom(true).allowTo(true),
      CommonFormats.YML.builder("yaml").markLossless().allowFrom(true).allowTo(true),
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
    const yamlRegex = new RegExp(`\\.(${this.yamlExt.join('|')})$`, 'i');

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

    // yaml -> config
    if (inputFormat.internal === "yaml" && outputFormat.internal === "ini") {
      for (const file of inputFiles) {
        const decode = decoder.decode(file.bytes);
        const parsed = yaml.parse(decode);
        const stringified = ini.stringify(parsed);

        outputFiles.push({
          name: file.name.replace(yamlRegex, `.${outputFormat.extension}`),
          bytes: encoder.encode(stringified),
        });
      }
    }

    // config -> yaml
    if (inputFormat.internal === "ini" && outputFormat.internal === "yaml") {
      for (const file of inputFiles) {
        const decode = decoder.decode(file.bytes);
        const parsed = ini.parse(decode);
        const stringified = yaml.stringify(parsed);

        outputFiles.push({
          name: file.name.replace(cfgRegex, ".yaml"),
          bytes: encoder.encode(stringified),
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
