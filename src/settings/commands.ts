import { MarkdownView, Notice } from "obsidian";
import { CreateTypstFileModal } from "../ui/createTypstFileModal";
import { TypstView } from "../typstView";
import { toggleMarkdownFormatting } from "../util/markdownUtils";
import TypstForObsidian from "../main";

export function registerCommands(plugin: TypstForObsidian) {
  plugin.addCommand({
    id: "typst-bold",
    name: "Toggle bold",
    checkCallback: (checking: boolean) => {
      const typstView = plugin.app.workspace.getActiveViewOfType(TypstView);
      if (typstView && typstView.getCurrentMode() === "source") {
        if (!checking) {
          typstView.toggleBold();
        }
        return true;
      }

      const markdownView =
        plugin.app.workspace.getActiveViewOfType(MarkdownView);
      if (markdownView && !(markdownView instanceof TypstView)) {
        if (!checking) {
          const editor = markdownView.editor;
          if (editor) {
            toggleMarkdownFormatting(editor, "**", "**");
          }
        }
        return true;
      }

      return false;
    },
  });

  plugin.addCommand({
    id: "typst-italic",
    name: "Toggle italic",
    checkCallback: (checking: boolean) => {
      const typstView = plugin.app.workspace.getActiveViewOfType(TypstView);
      if (typstView && typstView.getCurrentMode() === "source") {
        if (!checking) {
          typstView.toggleItalic();
        }
        return true;
      }

      const markdownView =
        plugin.app.workspace.getActiveViewOfType(MarkdownView);
      if (markdownView && !(markdownView instanceof TypstView)) {
        if (!checking) {
          const editor = markdownView.editor;
          if (editor) {
            toggleMarkdownFormatting(editor, "*", "*");
          }
        }
        return true;
      }

      return false;
    },
  });

  plugin.addCommand({
    id: "typst-underline",
    name: "Toggle underline",
    checkCallback: (checking: boolean) => {
      const typstView = plugin.app.workspace.getActiveViewOfType(TypstView);
      if (typstView && typstView.getCurrentMode() === "source") {
        if (!checking) {
          typstView.toggleUnderline();
        }
        return true;
      }
      return false;
    },
  });

  plugin.addCommand({
    id: "typst-heading-up",
    name: "Increase heading level",
    checkCallback: (checking: boolean) => {
      const typstView = plugin.app.workspace.getActiveViewOfType(TypstView);
      if (typstView && typstView.getCurrentMode() === "source") {
        if (!checking) {
          typstView.increaseHeadingLevel();
        }
        return true;
      }
      return false;
    },
  });

  plugin.addCommand({
    id: "typst-heading-down",
    name: "Decrease heading level",
    checkCallback: (checking: boolean) => {
      const typstView = plugin.app.workspace.getActiveViewOfType(TypstView);
      if (typstView && typstView.getCurrentMode() === "source") {
        if (!checking) {
          typstView.decreaseHeadingLevel();
        }
        return true;
      }
      return false;
    },
  });

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
