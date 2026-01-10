import { setIcon } from "obsidian";

export class ViewActionBar {
  private modeIconContainer: HTMLElement | null = null;
  private exportButton: HTMLElement | null = null;
  private splitPreviewButton: HTMLElement | null = null;
  private currentMode: "source" | "reading" = "source";

  constructor(
    private viewActions: Element,
    private onModeToggle: () => void,
    private onExport: () => void,
    private onSplitPreview: () => void
  ) {}

  initialize(initialMode: "source" | "reading"): void {
    this.currentMode = initialMode;
    this.createModeToggleButton();
    this.createSplitPreviewButton();
    this.createExportButton();
  }

  private createModeToggleButton(): void {
    this.modeIconContainer = createDiv("clickable-icon");
    this.modeIconContainer.addClass("view-action");
    this.modeIconContainer.addEventListener("click", () => {
      this.onModeToggle();
    });

    this.updateModeIcon();
    this.viewActions.prepend(this.modeIconContainer);
  }

  private createSplitPreviewButton(): void {
    this.splitPreviewButton = createDiv("clickable-icon");
    this.splitPreviewButton.addClass("view-action");
    this.splitPreviewButton.setAttribute(
      "aria-label",
      "Open live preview in split pane"
    );
    setIcon(this.splitPreviewButton, "columns-2");
    this.splitPreviewButton.addEventListener("click", () => {
      this.onSplitPreview();
    });

    if (this.modeIconContainer?.nextSibling) {
      this.viewActions.insertBefore(
        this.splitPreviewButton,
        this.modeIconContainer.nextSibling
      );
    } else {
      this.viewActions.appendChild(this.splitPreviewButton);
    }
  }

  private createExportButton(): void {
    this.exportButton = createDiv("clickable-icon");
    this.exportButton.addClass("view-action");
    this.exportButton.setAttribute("aria-label", "Export to PDF");
    setIcon(this.exportButton, "file-text");
    this.exportButton.addEventListener("click", async () => {
      await this.onExport();
    });

    if (this.modeIconContainer?.nextSibling) {
      this.viewActions.insertBefore(
        this.exportButton,
        this.modeIconContainer.nextSibling
      );
    } else {
      this.viewActions.appendChild(this.exportButton);
    }
  }

  setMode(mode: "source" | "reading"): void {
    this.currentMode = mode;
    this.updateModeIcon();
  }

  private updateModeIcon(): void {
    if (!this.modeIconContainer) return;

    this.modeIconContainer.empty();

    if (this.currentMode === "source") {
      setIcon(this.modeIconContainer, "pencil-line");
      this.modeIconContainer.setAttribute(
        "aria-label",
        "Currently in source mode. Click to switch to reading mode."
      );
    } else {
      setIcon(this.modeIconContainer, "book-open");
      this.modeIconContainer.setAttribute(
        "aria-label",
        "Currently in reading mode. Click to switch to source mode."
      );
    }
  }

  destroy(): void {
    this.modeIconContainer?.remove();
    this.splitPreviewButton?.remove();
    this.exportButton?.remove();
  }
}
