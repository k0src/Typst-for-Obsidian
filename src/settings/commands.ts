import { Notice } from "obsidian";
import { CreateTypstFileModal } from "../ui/createTypstFileModal";
import { TypstView } from "../typstView";
import TypstForObsidian from "../main";

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
}
