import { Platform, normalizePath, requestUrl } from "obsidian";
import type TypstPlugin from "./main";
import { decompressSync } from "fflate";
import { TYPST_PACKAGES_URL } from "./util/constants";
import { DownloadPackageModal } from "./ui/downloadPackageModal";
// @ts-ignore
import untar from "js-untar";

export class PackageManager {
  private fs: any;

  constructor(private plugin: TypstPlugin) {
    if (Platform.isDesktopApp) {
      this.fs = require("fs");
    }
  }

  async preparePackage(spec: string): Promise<string | undefined> {
    if (Platform.isDesktopApp) {
      let subdir = "/typst/packages/" + spec;

      let dir = require("path").normalize(this.getDataDir() + subdir);
      if (this.fs.existsSync(dir)) {
        return dir;
      }

      dir = require("path").normalize(this.getCacheDir() + subdir);
      if (this.fs.existsSync(dir)) {
        return dir;
      }
    }

    const folder = this.plugin.packagePath + spec + "/";
    if (await this.plugin.app.vault.adapter.exists(folder)) {
      return folder;
    }

    if (spec.startsWith("preview")) {
      const [_namespace, name, version] = spec.split("/");

      if (this.plugin.settings.autoDownloadPackages) {
        try {
          await this.fetchPackage(folder, name, version);
          return folder;
        } catch (e) {
          console.error(e);
          throw new Error(`Failed to download package ${spec}`);
        }
      } else {
        return await this.promptPackageDownload(folder, name, version, spec);
      }
    }

    throw new Error(`Package not found: ${spec}`);
  }

  private async promptPackageDownload(
    folder: string,
    name: string,
    version: string,
    spec: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const modal = new DownloadPackageModal(
        this.plugin.app,
        name,
        async () => {
          try {
            await this.fetchPackage(folder, name, version);
            resolve(folder);
          } catch (e) {
            console.error(e);
            reject(new Error(`Failed to download package ${spec}`));
          }
        },
        () => {
          reject(new Error(`Package download cancelled: ${spec}`));
        },
      );
      modal.open();
    });
  }

  private async fetchPackage(
    folder: string,
    name: string,
    version: string,
  ): Promise<void> {
    const url = `${TYPST_PACKAGES_URL}/${name}-${version}.tar.gz`;
    const response = await requestUrl({ url });
    if (response.status == 404) {
      throw new Error(`Package not found: ${name}-${version}`);
    }
    await this.plugin.app.vault.adapter.mkdir(folder);
    const decompressed = decompressSync(new Uint8Array(response.arrayBuffer));
    const untarrer = untar(decompressed.buffer as ArrayBuffer);
    await (untarrer as any).progress(async (file: any) => {
      if (file.type == "5" && file.name != ".") {
        await this.plugin.app.vault.adapter.mkdir(folder + file.name);
      }
      if (file.type === "0") {
        await this.plugin.app.vault.adapter.writeBinary(
          folder + file.name,
          file.buffer,
        );
      }
    });
  }

  async getFileString(path: string): Promise<string> {
    try {
      if (Platform.isDesktopApp && require("path").isAbsolute(path)) {
        return await this.fs.promises.readFile(path, { encoding: "utf8" });
      } else {
        return await this.plugin.app.vault.adapter.read(normalizePath(path));
      }
    } catch (error) {
      console.error("Failed to read file:", path, error);
      throw new Error(`Failed to read file: ${path}`);
    }
  }

  async getFileBinary(path: string): Promise<ArrayBuffer> {
    try {
      if (Platform.isDesktopApp && require("path").isAbsolute(path)) {
        const buffer = await this.fs.promises.readFile(path);
        if (
          buffer.byteOffset === 0 &&
          buffer.byteLength === buffer.buffer.byteLength
        ) {
          return buffer.buffer;
        }
        return buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength,
        );
      } else {
        return await this.plugin.app.vault.adapter.readBinary(
          normalizePath(path),
        );
      }
    } catch (error) {
      console.error("Failed to read binary file:", path, error);
      throw new Error(`Failed to read binary file: ${path}`);
    }
  }

  private getDataDir(): string {
    if (Platform.isLinux) {
      if ("XDG_DATA_HOME" in process.env) {
        return process.env["XDG_DATA_HOME"]!;
      } else {
        return process.env["HOME"] + "/.local/share";
      }
    } else if (Platform.isWin) {
      return process.env["APPDATA"]!;
    } else if (Platform.isMacOS) {
      return process.env["HOME"] + "/Library/Application Support";
    }
    throw "Cannot find data directory on an unknown platform";
  }

  private getCacheDir(): string {
    if (Platform.isLinux) {
      if ("XDG_CACHE_HOME" in process.env) {
        return process.env["XDG_CACHE_HOME"]!;
      } else {
        return process.env["HOME"] + "/.cache";
      }
    } else if (Platform.isWin) {
      return process.env["LOCALAPPDATA"]!;
    } else if (Platform.isMacOS) {
      return process.env["HOME"] + "/Library/Caches";
    }
    throw "Cannot find cache directory on an unknown platform";
  }
}
