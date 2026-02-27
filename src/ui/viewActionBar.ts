import { setIcon } from "obsidian";

export class ViewActionBar {
  private modeIconContainer: HTMLElement | null = null;
  private exportButton: HTMLElement | null = null;
  private splitPreviewButton: HTMLElement | null = null;
  private errorsButton: HTMLElement | null = null;
  private errorDot: HTMLElement | null = null;
  private currentMode: "source" | "reading" = "source";

  constructor(
    private viewActions: Element,
    private onModeToggle: () => void,
    private onExport: () => void,
    private onSplitPreview: () => void,
    private onShowErrors: (anchorEl: HTMLElement) => void,
  ) {}

  initialize(
    initialMode: "source" | "reading",
    enableLivePreview: boolean = true,
  ): void {
    this.currentMode = initialMode;
    this.createModeToggleButton();
    if (enableLivePreview) {
      this.createSplitPreviewButton();
    }
    this.createExportButton();
    this.createErrorsButton();
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
      "Open live preview in split pane",
    );
    setIcon(this.splitPreviewButton, "columns-2");
    this.splitPreviewButton.addEventListener("click", () => {
      this.onSplitPreview();
    });

    if (this.modeIconContainer?.nextSibling) {
      this.viewActions.insertBefore(
        this.splitPreviewButton,
        this.modeIconContainer.nextSibling,
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

    const prevButton = this.splitPreviewButton || this.modeIconContainer;
    if (prevButton?.nextSibling) {
      this.viewActions.insertBefore(this.exportButton, prevButton.nextSibling);
    } else {
      this.viewActions.appendChild(this.exportButton);
    }
  }

  private createErrorsButton(): void {
    this.errorsButton = createDiv("clickable-icon");
    this.errorsButton.addClass("view-action");
    this.errorsButton.addClass("typst-errors-btn");
    this.errorsButton.setAttribute("aria-label", "Problems");
    setIcon(this.errorsButton, "circle-alert");

    this.errorDot = this.errorsButton.createDiv("typst-error-dot");
    this.errorsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.onShowErrors(this.errorsButton!);
    });

    if (this.exportButton?.nextSibling) {
      this.viewActions.insertBefore(
        this.errorsButton,
        this.exportButton.nextSibling,
      );
    } else {
      this.viewActions.appendChild(this.errorsButton);
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
        "Click to switch to reading mode.",
      );
    } else {
      setIcon(this.modeIconContainer, "book-open");
      this.modeIconContainer.setAttribute(
        "aria-label",
        "Click to switch to source mode.",
      );
    }
  }

  setLivePreviewEnabled(enabled: boolean): void {
    if (enabled && !this.splitPreviewButton) {
      this.createSplitPreviewButton();
    } else if (!enabled && this.splitPreviewButton) {
      this.splitPreviewButton.remove();
      this.splitPreviewButton = null;
    }
  }

  updateErrorCount(count: number): void {
    if (!this.errorDot) return;

    if (count > 0) {
      this.errorDot.addClass("visible");
    } else {
      this.errorDot.removeClass("visible");
    }
  }

  destroy(): void {
    this.modeIconContainer?.remove();
    this.splitPreviewButton?.remove();
    this.errorsButton?.remove();
    this.exportButton?.remove();
  }
}
