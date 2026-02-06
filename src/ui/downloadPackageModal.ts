import { App, Modal } from "obsidian";

export class DownloadPackageModal extends Modal {
  private packageName: string;
  private errorEl: HTMLElement | null = null;
  private onDownload: () => Promise<void>;
  private onCancel: () => void;
  private isResolved: boolean = false;

  constructor(
    app: App,
    packageName: string,
    onDownload: () => Promise<void>,
    onCancel: () => void,
  ) {
    super(app);
    this.packageName = packageName;
    this.onDownload = onDownload;
    this.onCancel = onCancel;
  }

  onOpen() {
    const { contentEl, titleEl } = this;
    contentEl.empty();
    contentEl.addClass("typst-modal");

    titleEl.createEl("span", {
      text: `Download package "${this.packageName}"?`,
      cls: "typst-modal-title",
    });

    const description = contentEl.createEl("span", {
      cls: "typst-modal-description",
    });
    description.appendText("Package will be downloaded from ");
    description.createEl("a", {
      text: "typst.app/universe",
      href: "https://typst.app/universe/",
    });

    const modalFooter = contentEl.createDiv("typst-modal-footer");
    this.errorEl = modalFooter.createDiv("typst-modal-error");

    const buttonContainer = modalFooter.createDiv("typst-modal-buttons");

    const cancelButton = buttonContainer.createEl("button", {
      text: "Cancel",
    });
    cancelButton.addEventListener("click", () => {
      this.isResolved = true;
      this.onCancel();
      this.close();
    });

    const downloadButton = buttonContainer.createEl("button", {
      text: "Download",
      cls: "mod-cta",
    });

    downloadButton.addEventListener("click", async () => {
      try {
        downloadButton.disabled = true;
        downloadButton.textContent = "Downloading...";
        await this.onDownload();
        this.isResolved = true;
        this.close();
      } catch (error) {
        console.error("Error downloading package:", error);
        this.showError("Failed to download package");
        downloadButton.disabled = false;
        downloadButton.textContent = "Download";
      }
    });
  }

  private showError(message: string) {
    if (this.errorEl) {
      this.errorEl.textContent = message;
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();

    if (!this.isResolved) {
      this.onCancel();
    }
  }
}
