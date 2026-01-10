import { Events } from "obsidian";
import TypstForObsidian from "./main";

export interface CompilationResult {
  pdfData: Uint8Array;
  source: string;
  filePath: string;
}

export class CompilationManager extends Events {
  private debounceTimer: NodeJS.Timeout | null = null;
  private pendingSource: string | null = null;
  private pendingPath: string | null = null;
  private isCompiling: boolean = false;
  private plugin: TypstForObsidian;

  constructor(plugin: TypstForObsidian) {
    super();
    this.plugin = plugin;
  }

  scheduleCompile(source: string, filePath: string, delay: number): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.pendingSource = source;
    this.pendingPath = filePath;

    this.debounceTimer = setTimeout(() => {
      this.executeCompilation();
    }, delay);
  }

  cancelPending(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingSource = null;
    this.pendingPath = null;
  }

  async compileNow(
    source: string,
    filePath: string
  ): Promise<Uint8Array | null> {
    this.cancelPending();

    if (this.isCompiling) {
      return null;
    }

    return await this.performCompilation(source, filePath);
  }

  isCompilingNow(): boolean {
    return this.isCompiling;
  }

  private async executeCompilation(): Promise<void> {
    if (!this.pendingSource || !this.pendingPath) {
      return;
    }

    const source = this.pendingSource;
    const filePath = this.pendingPath;

    this.pendingSource = null;
    this.pendingPath = null;

    await this.performCompilation(source, filePath);
  }

  private async performCompilation(
    source: string,
    filePath: string
  ): Promise<Uint8Array | null> {
    if (this.isCompiling) {
      return null;
    }

    this.isCompiling = true;
    this.trigger("compilation-start", { source, filePath });

    try {
      const pdfData = await this.plugin.compileToPdf(source, filePath);

      const result: CompilationResult = {
        pdfData,
        source,
        filePath,
      };

      this.trigger("compilation-complete", result);
      return pdfData;
    } catch (error) {
      this.trigger("compilation-error", error);
      return null;
    } finally {
      this.isCompiling = false;
    }
  }

  destroy(): void {
    this.cancelPending();
  }
}
