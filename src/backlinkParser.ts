import { App, getLinkpath, parseLinktext } from "obsidian";

const BACKLINK_URI_PREFIX = "obsidian://open?";

export { BACKLINK_URI_PREFIX };

export class BacklinkParser {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  replaceBacklinks(source: string, sourcePath: string): string {
    const vaultName = this.app.vault.getName();

    return source.replace(/\[\[([^\[\]]+)\]\]/g, (match, inner: string) => {
      const pipeIndex = inner.indexOf("|");
      let linkTarget: string;
      let displayText: string;

      if (pipeIndex !== -1) {
        linkTarget = inner.substring(0, pipeIndex).trim();
        displayText = inner.substring(pipeIndex + 1).trim();
      } else {
        linkTarget = inner.trim();
        displayText = inner.trim();
      }

      const resolvedFile = this.app.metadataCache.getFirstLinkpathDest(
        getLinkpath(linkTarget),
        sourcePath,
      );

      if (!resolvedFile) return match;

      const { subpath } = parseLinktext(linkTarget);
      const filePath = resolvedFile.path;
      const params = new URLSearchParams({ vault: vaultName, file: filePath });
      if (subpath) {
        params.set("subpath", subpath);
      }
      const uri = BACKLINK_URI_PREFIX + params.toString();

      const escapedDisplay = this.escapeTypst(displayText);

      return `#link("${this.escapeString(uri)}")[${escapedDisplay}]`;
    });
  }

  private escapeTypst(text: string): string {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/#/g, "\\#")
      .replace(/\*/g, "\\*")
      .replace(/_/g, "\\_")
      .replace(/</g, "\\<")
      .replace(/>/g, "\\>")
      .replace(/@/g, "\\@")
      .replace(/\$/g, "\\$");
  }

  private escapeString(text: string): string {
    return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
}
