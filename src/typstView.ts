import {
  TextFileView,
  WorkspaceLeaf,
  Notice,
  normalizePath,
  TFile,
} from "obsidian";
import { TypstEditor } from "./typstEditor";
import TypstForObsidian from "./main";
import { PdfRenderer } from "./pdfRenderer";
import { ViewActionBar } from "./ui/viewActionBar";
import { EditorStateManager } from "./editorStateManager";
import { CompilationManager, CompilationResult } from "./compilationManager";
import { ErrorsDropdown, TypstError, parseTypstError } from "./ui/errorsPane";

export class TypstView extends TextFileView {
  private currentMode: "source" | "reading" = "source";
  private typstEditor: TypstEditor | null = null;
  private fileContent: string = "";
  private plugin: TypstForObsidian;
  private pdfRenderer: PdfRenderer;
  private actionBar: ViewActionBar | null = null;
  private stateManager: EditorStateManager;
  private livePreviewActive: boolean = false;
  private compilationManager: CompilationManager;
  private pairedView: TypstView | null = null;
  private currentErrors: TypstError[] = [];
  private errorsDropdown: ErrorsDropdown | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: TypstForObsidian) {
    super(leaf);
    this.plugin = plugin;
    this.currentMode = plugin.settings.defaultMode;
    this.pdfRenderer = new PdfRenderer();
    this.stateManager = new EditorStateManager();
    this.compilationManager = new CompilationManager(plugin);
  }

  getViewType(): string {
    return "typst-view";
  }

  getDisplayText(): string {
    return this.file?.basename || "Typst File";
  }

  getIcon(): string {
    return "typst-file";
  }

  async onOpen(): Promise<void> {
    await super.onOpen();
    this.initializeActionBar();

    const viewContent = this.getContentElement();
    if (viewContent) {
      viewContent.dataset.mode = this.currentMode;
    }
  }

  onResize(): void {
    super.onResize();
    if (this.typstEditor) {
      this.typstEditor.onResize();
    }
  }

  onClose(): Promise<void> {
    this.cleanupEditor();
    this.actionBar?.destroy();
    this.stateManager.clear();
    this.compilationManager.destroy();

    if (this.pairedView) {
      this.pairedView.clearPairedView();
      this.pairedView = null;
    }

    return super.onClose();
  }

  private initializeActionBar(): void {
    const viewActions = this.containerEl.querySelector(".view-actions");
    if (viewActions) {
      this.actionBar = new ViewActionBar(
        viewActions,
        () => this.toggleMode(),
        () => this.exportToPdf(),
        () => this.openSplitPreview(),
        (anchorEl: HTMLElement) => this.showErrorsPane(anchorEl),
      );
      this.actionBar.initialize(
        this.currentMode,
        this.plugin.settings.enableLivePreview,
      );
      this.actionBar.updateErrorCount(this.currentErrors.length);
    }
  }

  public toggleBold(): void {
    if (!this.typstEditor) {
      console.warn("Editor not available");
      return;
    }
    this.typstEditor.toggleFormatting("*", "*");
  }

  public toggleItalic(): void {
    if (!this.typstEditor) {
      console.warn("Editor not available");
      return;
    }
    this.typstEditor.toggleFormatting("_", "_");
  }

  public toggleUnderline(): void {
    if (!this.typstEditor) {
      console.warn("Editor not available");
      return;
    }
    this.typstEditor.toggleFormatting("#underline[", "]");
  }

  public increaseHeadingLevel(): void {
    if (!this.typstEditor) {
      console.warn("Editor not available");
      return;
    }
    this.typstEditor.increaseHeadingLevel();
  }

  public decreaseHeadingLevel(): void {
    if (!this.typstEditor) {
      console.warn("Editor not available");
      return;
    }
    this.typstEditor.decreaseHeadingLevel();
  }

  public showErrorsPane(anchorEl: HTMLElement): void {
    if (this.errorsDropdown) {
      this.errorsDropdown.close();
      this.errorsDropdown = null;
      return;
    }

    this.errorsDropdown = new ErrorsDropdown(
      anchorEl,
      this.currentErrors,
      (line: number, column: number) => {
        if (this.currentMode !== "source") {
          this.toggleMode();
        }
        setTimeout(() => {
          if (this.typstEditor) {
            this.typstEditor.goToLine(line, column);
          }
        }, 100);
      },
      () => {
        this.errorsDropdown = null;
      },
    );
  }

  public async exportToPdf(): Promise<string | null> {
    if (!this.file) {
      console.error("No file available for export");
      return null;
    }

    try {
      const content = this.getViewData();
      const filePath = this.file.path;
      const pdfData = await this.plugin.compileToPdf(
        content,
        filePath,
        "export",
      );
      if (!pdfData) {
        console.error("PDF compilation failed");
        return null;
      }

      const baseName = this.file.basename.replace(/\.typ$/, "");
      const pdfFileName = `${baseName}.pdf`;

      let pdfPath: string;
      const exportPath = this.plugin.settings.pdfExportPath;
      if (exportPath) {
        const normalizedExportPath = normalizePath(exportPath);
        if (!(await this.app.vault.adapter.exists(normalizedExportPath))) {
          await this.app.vault.adapter.mkdir(normalizedExportPath);
        }
        pdfPath = normalizePath(`${normalizedExportPath}/${pdfFileName}`);
      } else {
        const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
        pdfPath = folderPath ? `${folderPath}/${pdfFileName}` : pdfFileName;
      }

      const arrayBuffer = pdfData.buffer.slice(
        pdfData.byteOffset,
        pdfData.byteOffset + pdfData.byteLength,
      ) as ArrayBuffer;
      const existingFile = this.app.vault.getAbstractFileByPath(pdfPath);
      if (existingFile) {
        await this.app.vault.modifyBinary(existingFile as any, arrayBuffer);
      } else {
        await this.app.vault.createBinary(pdfPath, arrayBuffer);
      }

      if (!this.plugin.settings.suppressPdfExportNotice) {
        new Notice(`PDF exported to: ${pdfPath}`);
      }

      if (this.plugin.settings.openPdfOnExport) {
        await this.openPdfInSplitPane(pdfPath);
      }

      return pdfPath;
    } catch (error) {
      new Notice("Failed to export PDF. See console for details.");
      console.error("Failed to export PDF:", error);
      return null;
    }
  }

  public async exportAndOpenPdf(): Promise<void> {
    const pdfPath = await this.exportToPdf();
    if (pdfPath && !this.plugin.settings.openPdfOnExport) {
      await this.openPdfInSplitPane(pdfPath);
    }
  }

  private async openPdfInSplitPane(pdfPath: string): Promise<void> {
    const pdfFile = this.app.vault.getAbstractFileByPath(pdfPath);
    if (!(pdfFile instanceof TFile)) return;

    const activeLeaf = this.app.workspace.getLeaf(false);
    const activeParent = activeLeaf.parent;

    let pdfLeafInOtherGroup: WorkspaceLeaf | null = null;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (
        leaf.parent !== activeParent &&
        (leaf.view as any)?.file instanceof TFile &&
        (leaf.view as any).file.path === pdfPath
      ) {
        pdfLeafInOtherGroup = leaf;
      }
    });

    if (pdfLeafInOtherGroup) {
      this.app.workspace.setActiveLeaf(pdfLeafInOtherGroup, { focus: false });
    } else {
      const newLeaf = this.app.workspace.getLeaf("split");
      await newLeaf.openFile(pdfFile);
    }
  }

  public async openSplitPreview(): Promise<void> {
    if (!this.file) {
      new Notice("No file to preview");
      return;
    }

    if (this.pairedView) {
      this.app.workspace.setActiveLeaf(this.pairedView.leaf, { focus: true });
      return;
    }

    const newLeaf = this.app.workspace.getLeaf("split");
    await newLeaf.openFile(this.file);

    const newView = newLeaf.view;
    if (newView instanceof TypstView) {
      this.pairedView = newView;
      newView.pairedView = this;

      this.setLivePreviewActive(true);
      newView.setLivePreviewActive(true);

      if (newView.getCurrentMode() === "source") {
        await newView.toggleMode();
      }

      if (this.getCurrentMode() === "reading") {
        await this.toggleMode();
      }
    }
  }

  public setLivePreviewActive(active: boolean): void {
    this.livePreviewActive = active;

    if (active) {
      this.compilationManager.on(
        "compilation-complete",
        this.handleCompilationComplete.bind(this),
      );
      this.compilationManager.on(
        "compilation-error",
        this.handleCompilationError.bind(this),
      );
    } else {
      this.compilationManager.off(
        "compilation-complete",
        this.handleCompilationComplete.bind(this),
      );
      this.compilationManager.off(
        "compilation-error",
        this.handleCompilationError.bind(this),
      );
    }
  }

  public clearPairedView(): void {
    this.pairedView = null;
    this.setLivePreviewActive(false);
  }

  private async handleCompilationComplete(
    result: CompilationResult,
  ): Promise<void> {
    if (this.currentMode === "reading" && this.pairedView) {
      await this.showReadingMode(result.pdfData);
    }
    if (this.currentMode === "source" && this.pairedView) {
      this.clearErrors();
    }
  }

  private handleCompilationError(error: any): void {
    if (this.currentMode === "source") {
      const errorMsg = error instanceof Error ? error.message : String(error);

      let lineOffset = 0;
      if (this.plugin.settings.useDefaultLayoutFunctions) {
        lineOffset =
          (this.plugin.settings.customLayoutFunctions.match(/\n/g) || [])
            .length + 1;
      } else {
        lineOffset = 1;
      }

      const parsedError = parseTypstError(errorMsg);
      if (parsedError) {
        parsedError.line = Math.max(1, parsedError.line - lineOffset);
        this.currentErrors = [parsedError];
      } else {
        this.currentErrors = [
          {
            file: this.file?.path || "unknown",
            line: 0,
            column: 0,
            errorLine: "",
            message: errorMsg,
          },
        ];
      }

      this.actionBar?.updateErrorCount(this.currentErrors.length);
    }
  }

  public async toggleMode(): Promise<void> {
    if (this.currentMode === "source") {
      await this.switchToReadingMode();
    } else {
      this.switchToSourceMode();
    }
  }

  public getCurrentMode(): string {
    return this.currentMode;
  }

  public async recompileIfInReadingMode(): Promise<void> {
    if (this.currentMode === "reading") {
      const pdfData = await this.compile();
      if (pdfData) {
        await this.showReadingMode(pdfData);
      }
    }
  }

  public async updateEditorTheme(): Promise<void> {
    if (this.typstEditor && this.currentMode === "source") {
      await this.typstEditor.updateTheme();
    }
  }

  public updateActionBar(): void {
    this.actionBar?.setLivePreviewEnabled(
      this.plugin.settings.enableLivePreview,
    );
  }

  private async switchToReadingMode(): Promise<void> {
    this.saveEditorState();

    const pdfData = await this.compile();
    if (!pdfData) return;

    this.setMode("reading");
    await this.showReadingMode(pdfData);
  }

  private switchToSourceMode(): void {
    this.saveEditorState();

    this.setMode("source");
    this.showSourceMode();
    this.restoreEditorState();
  }

  private setMode(mode: "source" | "reading"): void {
    this.currentMode = mode;
    this.actionBar?.setMode(mode);

    const viewContent = this.getContentElement();
    if (viewContent) {
      viewContent.dataset.mode = mode;
    }
  }

  private async compile(): Promise<Uint8Array | null> {
    const content = this.getViewData();
    try {
      const filePath = this.file?.path || "/main.typ";

      if (this.livePreviewActive && this.plugin.settings.enableLivePreview) {
        const result = await this.plugin.compileToPdf(content, filePath);
        this.clearErrors();
        return result;
      } else {
        const result = await this.plugin.compileToPdf(content, filePath);
        this.clearErrors();
        return result;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Compilation error:", errorMsg);

      let lineOffset = 0;
      if (this.plugin.settings.useDefaultLayoutFunctions) {
        lineOffset =
          (this.plugin.settings.customLayoutFunctions.match(/\n/g) || [])
            .length + 1;
      } else {
        lineOffset = 1;
      }

      const parsedError = parseTypstError(errorMsg);
      if (parsedError) {
        parsedError.line = Math.max(1, parsedError.line - lineOffset);
        this.currentErrors = [parsedError];
      } else {
        this.currentErrors = [
          {
            file: this.file?.path || "unknown",
            line: 0,
            column: 0,
            errorLine: "",
            message: errorMsg,
          },
        ];
      }

      this.actionBar?.updateErrorCount(this.currentErrors.length);
      return null;
    }
  }

  private clearErrors(): void {
    this.currentErrors = [];
    this.actionBar?.updateErrorCount(0);
  }

  async setViewData(data: string, clear: boolean): Promise<void> {
    this.fileContent = data;

    if (this.currentMode === "source") {
      this.showSourceMode();
    } else {
      await this.loadReadingMode(data);
    }
  }

  private async loadReadingMode(data: string): Promise<void> {
    const pdfData = await this.compile();

    if (!pdfData) {
      if (!this.livePreviewActive) {
        this.setMode("source");
        this.showSourceMode();
      }
    } else {
      await this.showReadingMode(pdfData);
    }
  }

  getViewData(): string {
    if (this.currentMode === "source" && this.typstEditor) {
      return this.typstEditor.getContent();
    }
    return this.fileContent;
  }

  private getContentElement(): HTMLElement | null {
    return this.containerEl.querySelector(".view-content") as HTMLElement;
  }

  private cleanupEditor(): void {
    if (this.typstEditor) {
      this.typstEditor.destroy();
      this.typstEditor = null;
    }
  }

  public showSourceMode(): void {
    const contentEl = this.getContentElement();
    if (!contentEl) return;

    contentEl.empty();
    this.cleanupEditor();

    this.typstEditor = new TypstEditor(
      contentEl,
      this.plugin,
      (content: string) => {
        this.fileContent = content;
        this.handleContentChange(content);
      },
    );

    this.typstEditor.initialize(this.fileContent).catch((err) => {
      console.error("Failed to initialize Typst editor:", err);
    });
  }

  private handleContentChange(content: string): void {
    this.requestSave();

    if (
      this.livePreviewActive &&
      this.plugin.settings.enableLivePreview &&
      this.file
    ) {
      const debounceDelay = this.plugin.settings.livePreviewDebounce;
      this.compilationManager.scheduleCompile(
        content,
        this.file.path,
        debounceDelay,
      );
    }
  }

  private saveEditorState(): void {
    if (this.currentMode === "source") {
      this.stateManager.saveEditorState(this.typstEditor);
    } else if (this.currentMode === "reading") {
      const contentEl = this.getContentElement();
      this.stateManager.saveReadingScrollTop(contentEl);
    }
  }

  private restoreEditorState(): void {
    this.stateManager.restoreEditorState(this.typstEditor);
  }

  private async showReadingMode(pdfData: Uint8Array): Promise<void> {
    const contentEl = this.getContentElement();
    if (!contentEl) return;

    contentEl.empty();
    this.cleanupEditor();

    const readingDiv = contentEl.createDiv("typst-reading-mode");

    try {
      await this.pdfRenderer.renderPdf(
        pdfData,
        readingDiv,
        this.plugin.settings.enableTextLayer,
      );
      const savedScroll = this.stateManager.getSavedReadingScrollTop();

      if (savedScroll > 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (contentEl) {
              contentEl.scrollTop = savedScroll;
            }
          });
        });
      }
    } catch (error) {
      console.error("PDF rendering failed:", error);
    }
  }

  clear(): void {
    this.fileContent = "";
    if (this.typstEditor) {
      this.typstEditor.setContent("");
    }
  }
}
