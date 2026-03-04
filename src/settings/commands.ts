import { Notice, FuzzySuggestModal, App } from "obsidian";
import { CreateTypstFileModal } from "../ui/createTypstFileModal";
import { TypstView } from "../typstView";
import TypstForObsidian from "../main";
import { Snippet } from "../snippetManager";

interface SnippetItem {
  name: string;
  snippet: Snippet;
}

class InsertSnippetModal extends FuzzySuggestModal<SnippetItem> {
  private items: SnippetItem[];
  private onChoose: (item: SnippetItem) => void;

  constructor(app: App, items: SnippetItem[], onChoose: (item: SnippetItem) => void) {
    super(app);
    this.items = items;
    this.onChoose = onChoose;
    this.setPlaceholder("Insert snippet...");
  }

  getItems(): SnippetItem[] {
    return this.items;
  }

  getItemText(item: SnippetItem): string {
    return `${item.snippet.prefix} ${item.snippet.body.join(" ")}`;
  }

  onChooseItem(item: SnippetItem): void {
    this.onChoose(item);
  }
}

export function registerCommands(plugin: TypstForObsidian) {
  plugin.addCommand({
    id: "create-typst-file",
    name: "Create new Typst file",
    callback: () => {
      new CreateTypstFileModal(plugin.app).open();
    },
  });

  plugin.addCommand({
    id: "toggle-typst-mode",
    name: "Toggle between source and reading mode",
    checkCallback: (inTypstView: boolean) => {
      const view = plugin.app.workspace.getActiveViewOfType(TypstView);

      if (view instanceof TypstView) {
        if (!inTypstView) {
          view.toggleMode();
        }
        return true;
      }

      if (!inTypstView) {
        new Notice("Must be in a Typst (.typ) file");
      }
      return false;
    },
  });

  plugin.addCommand({
    id: "export-to-pdf",
    name: "Export to PDF",
    checkCallback: (inTypstView: boolean) => {
      const view = plugin.app.workspace.getActiveViewOfType(TypstView);

      if (view instanceof TypstView) {
        if (!inTypstView) {
          view.exportToPdf();
        }
        return true;
      }

      if (!inTypstView) {
        new Notice("Must be in a Typst (.typ) file");
      }
      return false;
    },
  });

  plugin.addCommand({
    id: "open-live-preview",
    name: "Open live preview in split pane",
    checkCallback: (checking: boolean) => {
      if (!plugin.settings.enableLivePreview) {
        return false;
      }

      const view = plugin.app.workspace.getActiveViewOfType(TypstView);

      if (view instanceof TypstView) {
        if (!checking) {
          view.openSplitPreview();
        }
        return true;
      }

      if (!checking) {
        new Notice("Must be in a Typst (.typ) file");
      }
      return false;
    },
  });

  plugin.addCommand({
    id: "export-and-open-pdf",
    name: "Export to PDF and open in split pane",
    checkCallback: (checking: boolean) => {
      const view = plugin.app.workspace.getActiveViewOfType(TypstView);

      if (view instanceof TypstView) {
        if (!checking) {
          view.exportAndOpenPdf();
        }
        return true;
      }

      if (!checking) {
        new Notice("Must be in a Typst (.typ) file");
      }
      return false;
    },
  });

  plugin.addCommand({
    id: "insert-snippet",
    name: "Insert snippet",
    checkCallback: (checking: boolean) => {
      const view = plugin.app.workspace.getActiveViewOfType(TypstView);
      if (!(view instanceof TypstView) || view.getCurrentMode() !== "source") {
        if (!checking) {
          new Notice("Must be in a Typst (.typ) file in source mode");
        }
        return false;
      }

      if (checking) return true;

      const items: SnippetItem[] = [];
      try {
        const parsed = JSON.parse(plugin.settings.customSnippets || "{}");
        for (const [name, snippet] of Object.entries(parsed)) {
          const s = snippet as any;
          if (s.prefix && Array.isArray(s.body)) {
            items.push({ name, snippet: { prefix: s.prefix, body: s.body } });
          }
        }
      } catch { }

      if (items.length === 0) {
        new Notice("No snippets defined");
        return true;
      }

      new InsertSnippetModal(plugin.app, items, (item) => {
        view.insertSnippet(item.snippet.body.join("\n"));
      }).open();

      return true;
    },
  });
}
