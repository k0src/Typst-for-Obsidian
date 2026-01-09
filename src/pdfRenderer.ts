import { init, WrappedPdfiumModule } from "@embedpdf/pdfium";
import { requestUrl } from "obsidian";
import { PDFIUM_WASM_URL } from "./util/constants";

export class PdfRenderer {
  private pdfium: WrappedPdfiumModule | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {}

  private async ensurePdfiumInitialized(): Promise<void> {
    if (this.pdfium) return;

    if (!this.initPromise) {
      this.initPromise = this.initializePdfium();
    }

    await this.initPromise;
  }

  private async initializePdfium(): Promise<void> {
    try {
      const response = await requestUrl({ url: PDFIUM_WASM_URL });
      const wasmBinary = response.arrayBuffer;

      this.pdfium = await init({
        wasmBinary,
        locateFile: (path: string, prefix: string) => {
          if (path.endsWith(".wasm")) {
            return PDFIUM_WASM_URL;
          }
          return prefix + path;
        },
      });

      this.pdfium.PDFiumExt_Init();
    } catch (error) {
      console.error("PdfRenderer: PDFium initialization failed:", error);
      throw error;
    }
  }

  async renderPdf(
    pdfData: Uint8Array,
    container: HTMLElement,
    enableTextLayer: boolean = true
  ): Promise<void> {
    try {
      await this.ensurePdfiumInitialized();

      if (!this.pdfium) {
        throw new Error("PDFium not initialized");
      }

      // Allocate memory for the PDF data
      const filePtr = this.pdfium.pdfium.wasmExports.malloc(pdfData.length);

      // Write PDF data to WASM memory
      const pdfiumModule = this.pdfium.pdfium as any;
      pdfiumModule.HEAPU8.set(pdfData, filePtr);

      // Load the document
      const docPtr = this.pdfium.FPDF_LoadMemDocument(
        filePtr,
        pdfData.length,
        ""
      );

      if (!docPtr) {
        const error = this.pdfium.FPDF_GetLastError();
        this.pdfium.pdfium.wasmExports.free(filePtr);
        throw new Error(`Failed to load PDF: ${error}`);
      }

      try {
        // Get page count
        const pageCount = this.pdfium.FPDF_GetPageCount(docPtr);

        // Render all pages
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
          await this.renderPage(docPtr, pageIndex, container, enableTextLayer);
        }
      } finally {
        // Clean up document
        this.pdfium.FPDF_CloseDocument(docPtr);
        this.pdfium.pdfium.wasmExports.free(filePtr);
      }
    } catch (error) {
      console.error("PdfRenderer: PDFium rendering failed:", error);
      throw error;
    }
  }

  private async renderPage(
    docPtr: number,
    pageIndex: number,
    container: HTMLElement,
    enableTextLayer: boolean
  ): Promise<void> {
    if (!this.pdfium) throw new Error("PDFium not initialized");

    // Load the page
    const pagePtr = this.pdfium.FPDF_LoadPage(docPtr, pageIndex);
    if (!pagePtr) {
      throw new Error(`Failed to load page ${pageIndex}`);
    }

    try {
      // Get page dimensions
      const width = this.pdfium.FPDF_GetPageWidthF(pagePtr);
      const height = this.pdfium.FPDF_GetPageHeightF(pagePtr);
      const scale = 1.5;
      const dpr = window.devicePixelRatio || 1;
      const effectiveScale = scale * dpr;
      const scaledWidth = Math.floor(width * effectiveScale);
      const scaledHeight = Math.floor(height * effectiveScale);

      // Create page container
      const pageContainer = container.createDiv("typst-pdf-page");
      pageContainer.style.position = "relative";
      pageContainer.style.width = `${scaledWidth / dpr}px`;
      pageContainer.style.height = `${scaledHeight / dpr}px`;
      pageContainer.style.marginBottom = "20px";
      pageContainer.style.setProperty("--scale-factor", scale.toString());
      pageContainer.style.opacity = "0";

      // Create canvas
      const canvas = pageContainer.createEl("canvas");
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      canvas.style.display = "block";
      canvas.style.width = `${scaledWidth / dpr}px`;
      canvas.style.height = `${scaledHeight / dpr}px`;

      // Create bitmap for rendering
      const bitmapPtr = this.pdfium.FPDFBitmap_Create(
        scaledWidth,
        scaledHeight,
        0
      );
      if (!bitmapPtr) {
        throw new Error("Failed to create bitmap");
      }

      try {
        this.pdfium.FPDFBitmap_FillRect(
          bitmapPtr,
          0,
          0,
          scaledWidth,
          scaledHeight,
          0xffffffff
        );

        this.pdfium.FPDF_RenderPageBitmap(
          bitmapPtr,
          pagePtr,
          0,
          0,
          scaledWidth,
          scaledHeight,
          0, // No rotation
          0x10 | 0x01 | 0x800 // FPDF_REVERSE_BYTE_ORDER | FPDF_ANNOT | FPDF_LCD_TEXT
        );

        // Get the bitmap buffer
        const bufferPtr = this.pdfium.FPDFBitmap_GetBuffer(bitmapPtr);
        if (!bufferPtr) {
          throw new Error("Failed to get bitmap buffer");
        }

        const bufferSize = scaledWidth * scaledHeight * 4; // RGBA
        const pdfiumModule = this.pdfium.pdfium as any;
        const buffer = new Uint8Array(
          pdfiumModule.HEAPU8.buffer,
          pdfiumModule.HEAPU8.byteOffset + bufferPtr,
          bufferSize
        ).slice();
        const imageData = new ImageData(
          new Uint8ClampedArray(buffer.buffer),
          scaledWidth,
          scaledHeight
        );

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get 2D context from canvas");
        }
        ctx.putImageData(imageData, 0, 0);

        // Render text layer
        if (enableTextLayer) {
          await this.renderTextLayer(
            pagePtr,
            pageContainer,
            width,
            height,
            scale,
            dpr
          );

          // Render link layer
          await this.renderLinkLayer(
            docPtr,
            pagePtr,
            pageContainer,
            width,
            height,
            scale,
            dpr
          );
        }

        pageContainer.style.opacity = "1";
      } finally {
        this.pdfium.FPDFBitmap_Destroy(bitmapPtr);
      }
    } finally {
      this.pdfium.FPDF_ClosePage(pagePtr);
    }
  }

  private async renderTextLayer(
    pagePtr: number,
    pageContainer: HTMLElement,
    pageWidth: number,
    pageHeight: number,
    scale: number,
    dpr: number
  ): Promise<void> {
    if (!this.pdfium) return;

    const textPagePtr = this.pdfium.FPDFText_LoadPage(pagePtr);
    if (!textPagePtr) {
      console.warn("Failed to load text page");
      return;
    }

    try {
      const charCount = this.pdfium.FPDFText_CountChars(textPagePtr);
      if (charCount <= 0) return;

      const textLayerDiv = pageContainer.createDiv("textLayer");
      const rectCount = this.pdfium.FPDFText_CountRects(
        textPagePtr,
        0,
        charCount
      );
      if (rectCount <= 0) return;

      const pdfiumModule = this.pdfium.pdfium as any;
      const leftPtr = pdfiumModule._malloc(8);
      const topPtr = pdfiumModule._malloc(8);
      const rightPtr = pdfiumModule._malloc(8);
      const bottomPtr = pdfiumModule._malloc(8);

      const textBufferSize = 1000;
      const textBufferPtr = pdfiumModule._malloc(textBufferSize * 2);

      try {
        for (let rectIndex = 0; rectIndex < rectCount; rectIndex++) {
          const success = this.pdfium.FPDFText_GetRect(
            textPagePtr,
            rectIndex,
            leftPtr,
            topPtr,
            rightPtr,
            bottomPtr
          );

          if (!success) continue;

          const left = pdfiumModule.HEAPF64[leftPtr >> 3];
          const top = pdfiumModule.HEAPF64[topPtr >> 3];
          const right = pdfiumModule.HEAPF64[rightPtr >> 3];
          const bottom = pdfiumModule.HEAPF64[bottomPtr >> 3];

          const textLength = this.pdfium.FPDFText_GetBoundedText(
            textPagePtr,
            left,
            top,
            right,
            bottom,
            textBufferPtr,
            textBufferSize
          );

          if (textLength > 1) {
            const text = this.pdfium.pdfium.UTF16ToString(textBufferPtr);

            const textSpan = textLayerDiv.createEl("span");
            textSpan.textContent = text;

            const x = left * scale;
            const y = (pageHeight - top) * scale;
            const fontSize = (top - bottom) * scale;
            const pdfWidth = (right - left) * scale;

            textSpan.style.left = `${x}px`;
            textSpan.style.top = `${y}px`;
            textSpan.style.fontSize = `${fontSize}px`;

            const naturalWidth = textSpan.offsetWidth;

            if (naturalWidth > 0) {
              const scaleX = pdfWidth / naturalWidth;
              textSpan.style.transform = `scaleX(${scaleX})`;
              textSpan.style.width = `${pdfWidth}px`;
              textSpan.style.transformOrigin = "0 0";
            }
          }
        }
      } finally {
        pdfiumModule._free(textBufferPtr);
        pdfiumModule._free(leftPtr);
        pdfiumModule._free(topPtr);
        pdfiumModule._free(rightPtr);
        pdfiumModule._free(bottomPtr);
      }
    } finally {
      this.pdfium.FPDFText_ClosePage(textPagePtr);
    }
  }

  private async renderLinkLayer(
    docPtr: number,
    pagePtr: number,
    pageContainer: HTMLElement,
    pageWidth: number,
    pageHeight: number,
    scale: number,
    dpr: number
  ): Promise<void> {
    if (!this.pdfium) return;

    const pdfiumModule = this.pdfium.pdfium as any;

    if (typeof this.pdfium.FPDFLink_Enumerate !== "function") {
      console.warn("FPDFLink_Enumerate not available");
      return;
    }

    const linkLayerDiv = pageContainer.createDiv("linkLayer");

    const rectBuffer = pdfiumModule._malloc(16); // FS_RECTF: 4 floats * 4 bytes
    const posPtr = pdfiumModule._malloc(4); // int for startPos
    const linkPtr = pdfiumModule._malloc(4); // FPDF_LINK pointer
    const urlBufferSize = 2048;
    const urlBufferPtr = pdfiumModule._malloc(urlBufferSize);

    pdfiumModule.HEAP32[posPtr >> 2] = 0;

    try {
      while (this.pdfium.FPDFLink_Enumerate(pagePtr, posPtr, linkPtr)) {
        const link = pdfiumModule.HEAP32[linkPtr >> 2];
        if (!link) break;

        const hasRect = this.pdfium.FPDFLink_GetAnnotRect(link, rectBuffer);
        if (!hasRect) continue;

        const left = pdfiumModule.HEAPF32[(rectBuffer >> 2) + 0];
        const bottom = pdfiumModule.HEAPF32[(rectBuffer >> 2) + 1];
        const right = pdfiumModule.HEAPF32[(rectBuffer >> 2) + 2];
        const top = pdfiumModule.HEAPF32[(rectBuffer >> 2) + 3];

        const action = this.pdfium.FPDFLink_GetAction(link);
        const linkElement = linkLayerDiv.createEl("a");

        if (!action) {
          const dest = this.pdfium.FPDFLink_GetDest(docPtr, link);
          if (dest) {
            this.handleInternalLink(
              linkElement,
              docPtr,
              dest,
              pageHeight,
              scale
            );
          } else {
            continue;
          }
        } else {
          const actionType = this.pdfium.FPDFAction_GetType(action);

          if (actionType === 3) {
            const uriLength = this.pdfium.FPDFAction_GetURIPath(
              docPtr,
              action,
              0,
              0
            );
            if (uriLength <= 0) continue;

            this.pdfium.FPDFAction_GetURIPath(
              docPtr,
              action,
              urlBufferPtr,
              urlBufferSize
            );

            const urlBytes = new Uint8Array(
              pdfiumModule.HEAPU8.buffer,
              pdfiumModule.HEAPU8.byteOffset + urlBufferPtr,
              uriLength - 1
            );
            const url = new TextDecoder().decode(urlBytes);

            if (!url) continue;

            linkElement.href = url;
            linkElement.addEventListener("click", (e) => {
              e.preventDefault();
              window.open(url, "_blank");
            });
          } else if (actionType === 1) {
            const dest = this.pdfium.FPDFAction_GetDest(docPtr, action);
            if (dest) {
              this.handleInternalLink(
                linkElement,
                docPtr,
                dest,
                pageHeight,
                scale
              );
            } else {
              continue;
            }
          } else {
            console.warn("Unsupported action type:", actionType);
            continue;
          }
        }

        const x = left * scale;
        const y = (pageHeight - top) * scale;
        const width = (right - left) * scale;
        const height = Math.abs((bottom - top) * scale);

        linkElement.style.position = "absolute";
        linkElement.style.left = `${x}px`;
        linkElement.style.top = `${y}px`;
        linkElement.style.width = `${width}px`;
        linkElement.style.height = `${height}px`;
        linkElement.style.cursor = "pointer";
      }
    } finally {
      pdfiumModule._free(rectBuffer);
      pdfiumModule._free(posPtr);
      pdfiumModule._free(linkPtr);
      pdfiumModule._free(urlBufferPtr);
    }
  }

  private handleInternalLink(
    linkElement: HTMLAnchorElement,
    docPtr: number,
    dest: number,
    pageHeight: number,
    scale: number
  ): void {
    if (!this.pdfium) return;

    const destPageIndex = this.pdfium.FPDFDest_GetDestPageIndex(docPtr, dest);
    const pdfiumModule = this.pdfium.pdfium as any;

    const hasXPtr = pdfiumModule._malloc(4);
    const hasYPtr = pdfiumModule._malloc(4);
    const hasZoomPtr = pdfiumModule._malloc(4);
    const xPtr = pdfiumModule._malloc(4);
    const yPtr = pdfiumModule._malloc(4);
    const zoomPtr = pdfiumModule._malloc(4);

    try {
      const hasLocation = this.pdfium.FPDFDest_GetLocationInPage(
        dest,
        hasXPtr,
        hasYPtr,
        hasZoomPtr,
        xPtr,
        yPtr,
        zoomPtr
      );

      let scrollY: number | null = null;
      if (hasLocation) {
        const hasY = pdfiumModule.HEAP32[hasYPtr >> 2];
        if (hasY) {
          scrollY = pdfiumModule.HEAPF32[yPtr >> 2];
        }
      }

      linkElement.href = "#";
      linkElement.addEventListener("click", (e) => {
        e.preventDefault();

        const scrollContainer = linkElement.closest(
          ".view-content"
        ) as HTMLElement;
        const pages = document.querySelectorAll(".typst-pdf-page");
        const targetPage = pages[destPageIndex] as HTMLElement;

        if (!targetPage) return;

        if (scrollY !== null && scrollContainer) {
          const pageHeightPx = parseFloat(targetPage.style.height);
          const screenY = pageHeightPx / scale - scrollY;
          const scrollTop = targetPage.offsetTop + screenY * scale;
          scrollContainer.scrollTo({ top: scrollTop, behavior: "smooth" });
        } else if (scrollContainer) {
          const scrollTop = targetPage.offsetTop;
          scrollContainer.scrollTo({ top: scrollTop, behavior: "smooth" });
        } else if (targetPage) {
          targetPage.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } finally {
      pdfiumModule._free(hasXPtr);
      pdfiumModule._free(hasYPtr);
      pdfiumModule._free(hasZoomPtr);
      pdfiumModule._free(xPtr);
      pdfiumModule._free(yPtr);
      pdfiumModule._free(zoomPtr);
    }
  }

  cleanup(): void {}
}
