import { setIcon } from "obsidian";

export interface TypstError {
  file: string;
  line: number;
  column: number;
  errorLine: string;
  message: string;
}

export class ErrorsDropdown {
  private container: HTMLElement;
  private errors: TypstError[] = [];
  private onErrorClick: (line: number, column: number) => void;
  private onClose: () => void;
  private clickOutsideHandler: (e: MouseEvent) => void;
  private escapeHandler: (e: KeyboardEvent) => void;

  constructor(
    anchorEl: HTMLElement,
    errors: TypstError[],
    onErrorClick: (line: number, column: number) => void,
    onClose: () => void
  ) {
    this.errors = errors;
    this.onErrorClick = onErrorClick;
    this.onClose = onClose;

    this.container = document.body.createDiv("typst-errors-dropdown");

    const rect = anchorEl.getBoundingClientRect();
    this.container.style.top = `${rect.bottom + 4}px`;
    this.container.style.right = `${window.innerWidth - rect.right}px`;

    this.render();
    this.setupEventListeners();
  }

  private render(): void {
    this.container.empty();

    const header = this.container.createDiv("typst-errors-header");
    header.createSpan({ text: "Problems", cls: "typst-errors-title" });

    const closeBtn = header.createDiv("typst-errors-close clickable-icon");
    setIcon(closeBtn, "x");
    closeBtn.addEventListener("click", () => this.close());

    if (this.errors.length === 0) {
      const empty = this.container.createDiv("typst-errors-empty");
      empty.setText("No problems");
    } else {
      const list = this.container.createDiv("typst-errors-list");

      this.errors.forEach((error) => {
        const item = list.createDiv("typst-errors-item");
        item.addEventListener("click", () => {
          this.onErrorClick(error.line, error.column);
          this.close();
        });

        const icon = item.createDiv("typst-errors-item-icon");
        setIcon(icon, "x-circle");

        const content = item.createDiv("typst-errors-item-content");
        content.createDiv({
          text: error.message,
          cls: "typst-errors-item-msg",
        });

        const location = content.createDiv("typst-errors-item-location");
        const fileName = error.file.split("/").pop() || error.file;
        location.setText(`${fileName}:${error.line}:${error.column}`);
      });
    }
  }

  private setupEventListeners(): void {
    this.clickOutsideHandler = (e: MouseEvent) => {
      if (!this.container.contains(e.target as Node)) {
        this.close();
      }
    };

    this.escapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.close();
      }
    };

    setTimeout(() => {
      document.addEventListener("click", this.clickOutsideHandler);
      document.addEventListener("keydown", this.escapeHandler);
    }, 10);
  }

  close(): void {
    document.removeEventListener("click", this.clickOutsideHandler);
    document.removeEventListener("keydown", this.escapeHandler);
    this.container.remove();
    this.onClose();
  }
}

export function parseTypstError(errorMessage: string): TypstError | null {
  try {
    const lines = errorMessage.split("\n");
    let message = lines[0].replace(/^Error:\s*/, "").trim();

    const locationMatch = errorMessage.match(/╭─\[\s*([^:]+):(\d+):(\d+)\s*\]/);
    if (!locationMatch) {
      return null;
    }

    const file = locationMatch[1].trim();
    const line = parseInt(locationMatch[2], 10);
    const column = parseInt(locationMatch[3], 10);
    const errorLineMatch = errorMessage.match(/^\s*\d+\s*│\s*(.+)$/m);
    const errorLine = errorLineMatch ? errorLineMatch[1].trim() : "";

    return {
      file,
      line,
      column,
      errorLine,
      message,
    };
  } catch (e) {
    console.error("Failed to parse Typst error:", e);
    return null;
  }
}
