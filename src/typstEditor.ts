import * as monaco from "monaco-editor";
import { ensureLanguageRegistered } from "./grammar/typstLanguage";
import TypstForObsidian from "./main";
import { SnippetManager } from "./snippetManager";

interface MonacoLineEdit {
  line: number;
  trimmedFrom: number;
  trimmedTo: number;
  trimmedText: string;
  isFormatted: boolean;
  originalFrom: number;
  originalTo: number;
}

export class TypstEditor {
  private monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private container: HTMLElement;
  private content: string = "";
  private onContentChange?: (content: string) => void;
  private plugin: TypstForObsidian;
  private snippetManager: SnippetManager;
  private completionDisposable: monaco.IDisposable | null = null;

  constructor(
    container: HTMLElement,
    plugin: TypstForObsidian,
    onContentChange?: (content: string) => void
  ) {
    this.container = container;
    this.plugin = plugin;
    this.onContentChange = onContentChange;
    this.snippetManager = new SnippetManager();
  }

  public async initialize(initialContent: string = ""): Promise<void> {
    this.content = initialContent;
    const isDarkTheme = document.body.classList.contains("theme-dark");
    await ensureLanguageRegistered(isDarkTheme);
    this.createEditor();
  }

  public destroy(): void {
    if (this.completionDisposable) {
      this.completionDisposable.dispose();
      this.completionDisposable = null;
    }
    if (this.monacoEditor) {
      this.monacoEditor.dispose();
      this.monacoEditor = null;
    }
  }

  public goToLine(line: number, column: number = 1): void {
    if (!this.monacoEditor) return;

    this.monacoEditor.revealLineInCenter(line);
    this.monacoEditor.setPosition({ lineNumber: line, column: column });
    this.monacoEditor.focus();
  }

  private createEditor(): void {
    this.container.empty();
    this.container.addClass("typst-monaco-editor-container");

    const isDarkTheme = document.body.classList.contains("theme-dark");

    let fontFamily: string;
    if (this.plugin.settings.useObsidianMonospaceFont) {
      fontFamily =
        getComputedStyle(document.body)
          .getPropertyValue("--font-monospace")
          .trim() || "monospace";
    } else {
      fontFamily = "Consolas, 'Courier New', monospace";
    }

    const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      value: this.content,
      language: "typst",
      theme: isDarkTheme ? "vs-dark" : "vs",
      automaticLayout: false,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      minimap: { enabled: false },
      lineNumbers: "on",
      fontSize: 14,
      fontFamily: fontFamily,
      tabSize: 2,
      insertSpaces: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
      wordBasedSuggestions: "off",
      parameterHints: { enabled: false },
      padding: { top: 16, bottom: 64 },
      autoClosingBrackets: "always",
      autoClosingQuotes: "always",
      autoIndent: "full",
      formatOnType: true,
      formatOnPaste: true,
    };

    this.monacoEditor = monaco.editor.create(this.container, editorOptions);

    requestAnimationFrame(() => {
      if (this.monacoEditor) {
        this.monacoEditor.layout();
      }
    });

    this.registerSnippets();

    this.monacoEditor.onDidChangeModelContent(() => {
      if (this.monacoEditor) {
        this.content = this.monacoEditor.getValue();
        if (this.onContentChange) {
          this.onContentChange(this.content);
        }
      }
    });

    this.monacoEditor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV,
      async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && this.monacoEditor) {
            const selection = this.monacoEditor.getSelection();
            if (selection) {
              this.monacoEditor.executeEdits("paste", [
                {
                  range: selection,
                  text: text,
                },
              ]);
            }
          }
        } catch (err) {
          console.error("Failed to read clipboard:", err);
        }
      }
    );

    this.monacoEditor.onKeyDown((e) => {
      if (
        e.keyCode === monaco.KeyCode.Enter &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        const model = this.monacoEditor?.getModel();
        const position = this.monacoEditor?.getPosition();

        if (!model || !position) return;

        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);
        const afterCursor = lineContent.substring(position.column - 1);

        const openBrackets = ["{", "[", "("];
        const bracketPairs = [
          ["{", "}"],
          ["[", "]"],
          ["(", ")"],
        ];

        for (let i = 0; i < bracketPairs.length; i++) {
          const [open, close] = bracketPairs[i];
          if (beforeCursor.endsWith(open) && afterCursor.startsWith(close)) {
            e.preventDefault();
            e.stopPropagation();

            const currentIndent = beforeCursor.match(/^\s*/)?.[0] || "";
            const indentUnit = "  ";

            this.monacoEditor?.executeEdits("smart-indent", [
              {
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  position.column
                ),
                text: "\n" + currentIndent + indentUnit + "\n" + currentIndent,
              },
            ]);

            this.monacoEditor?.setPosition({
              lineNumber: position.lineNumber + 1,
              column: currentIndent.length + indentUnit.length + 1,
            });

            return;
          }
        }

        for (const open of openBrackets) {
          if (beforeCursor.trimEnd().endsWith(open)) {
            e.preventDefault();
            e.stopPropagation();

            const currentIndent = beforeCursor.match(/^\s*/)?.[0] || "";
            const indentUnit = "  ";

            this.monacoEditor?.executeEdits("smart-indent", [
              {
                range: new monaco.Range(
                  position.lineNumber,
                  position.column,
                  position.lineNumber,
                  position.column
                ),
                text: "\n" + currentIndent + indentUnit,
              },
            ]);

            this.monacoEditor?.setPosition({
              lineNumber: position.lineNumber + 1,
              column: currentIndent.length + indentUnit.length + 1,
            });

            return;
          }
        }
      }
    });
  }

  private registerSnippets(): void {
    this.snippetManager.parseSnippets(this.plugin.settings.customSnippets);

    this.completionDisposable = monaco.languages.registerCompletionItemProvider(
      "typst",
      {
        provideCompletionItems: (model, position) => {
          const suggestions: monaco.languages.CompletionItem[] = [];

          const wordInfo = model.getWordUntilPosition(position);
          const word = wordInfo.word.toLowerCase();

          const range = {
            startLineNumber: position.lineNumber,
            startColumn: wordInfo.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: wordInfo.endColumn,
          };

          this.snippetManager.getSnippets().forEach((snippet, name) => {
            if (snippet.prefix.toLowerCase().startsWith(word)) {
              const insertText = snippet.body.join("\n");

              suggestions.push({
                label: snippet.prefix,
                kind: monaco.languages.CompletionItemKind.Snippet,
                documentation: name,
                insertText: insertText,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
              });
            }
          });

          return { suggestions };
        },
      }
    );
  }

  public getContent(): string {
    return this.monacoEditor ? this.monacoEditor.getValue() : this.content;
  }

  public setContent(content: string): void {
    if (this.monacoEditor) {
      this.monacoEditor.setValue(content);
    }
    this.content = content;
  }

  public getEditorState(): {
    lineNumber: number;
    column: number;
    scrollTop: number;
  } | null {
    if (!this.monacoEditor) return null;

    const position = this.monacoEditor.getPosition();
    const scrollTop = this.monacoEditor.getScrollTop();

    return {
      lineNumber: position?.lineNumber || 1,
      column: position?.column || 1,
      scrollTop: scrollTop,
    };
  }

  public restoreEditorState(state: {
    lineNumber: number;
    column: number;
    scrollTop: number;
  }): void {
    if (!this.monacoEditor) return;

    this.monacoEditor.setPosition({
      lineNumber: state.lineNumber,
      column: state.column,
    });

    this.monacoEditor.setScrollTop(state.scrollTop);
    this.monacoEditor.focus();

    setTimeout(() => {
      if (this.monacoEditor) {
        this.monacoEditor.setScrollTop(state.scrollTop);
      }
    }, 20);
  }

  public focus(): void {
    this.monacoEditor?.focus();
  }

  public onResize(): void {
    this.monacoEditor?.layout();
  }

  public undo(): boolean {
    if (this.monacoEditor) {
      this.monacoEditor.trigger("source", "undo", null);
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.monacoEditor) {
      this.monacoEditor.trigger("source", "redo", null);
      return true;
    }
    return false;
  }

  private getWordAtPosition(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.Range | null {
    const line = model.getLineContent(position.lineNumber);
    const wordRegex = /[a-zA-Z0-9]+/g;
    let match;

    while ((match = wordRegex.exec(line)) !== null) {
      const start = match.index + 1;
      const end = start + match[0].length;

      if (position.column >= start && position.column <= end) {
        return new monaco.Range(
          position.lineNumber,
          start,
          position.lineNumber,
          end
        );
      }
    }

    return null;
  }

  private getLineEdits(
    model: monaco.editor.ITextModel,
    from: monaco.Position,
    to: monaco.Position,
    prefix: string,
    suffix: string
  ): MonacoLineEdit[] {
    const edits: MonacoLineEdit[] = [];

    for (let line = from.lineNumber; line <= to.lineNumber; line++) {
      const lineText = model.getLineContent(line);

      const originalStartCol = line === from.lineNumber ? from.column - 1 : 0;
      const originalEndCol =
        line === to.lineNumber ? to.column - 1 : lineText.length;

      let startCol = originalStartCol;
      let endCol = originalEndCol;

      if (line === from.lineNumber) {
        if (startCol >= prefix.length) {
          const beforeText = lineText.substring(
            startCol - prefix.length,
            startCol
          );
          if (beforeText === prefix) {
            startCol -= prefix.length;
          }
        }
      }

      if (line === to.lineNumber) {
        if (endCol + suffix.length <= lineText.length) {
          const afterText = lineText.substring(endCol, endCol + suffix.length);
          if (afterText === suffix) {
            endCol += suffix.length;
          }
        }
      }

      const selectedPart = lineText.substring(startCol, endCol);
      const trimmed = selectedPart.trim();

      if (!trimmed) continue;

      const originalSelectedPart = lineText.substring(
        originalStartCol,
        originalEndCol
      );
      const originalLeadingSpaces =
        originalSelectedPart.length - originalSelectedPart.trimStart().length;
      const originalTrailingSpaces =
        originalSelectedPart.length - originalSelectedPart.trimEnd().length;

      const originalTrimmedFrom = originalStartCol + originalLeadingSpaces;
      const originalTrimmedTo = originalEndCol - originalTrailingSpaces;

      const leadingSpaces =
        selectedPart.length - selectedPart.trimStart().length;
      const trailingSpaces =
        selectedPart.length - selectedPart.trimEnd().length;
      let trimmedFrom = startCol + leadingSpaces;
      let trimmedTo = endCol - trailingSpaces;
      let finalTrimmed = trimmed;

      const containsFormatting =
        trimmed.includes(prefix) || trimmed.includes(suffix);
      if (containsFormatting) {
        const formattedRegex = new RegExp(
          `${prefix.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}(.+?)${suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          "g"
        );
        let match;
        let minStart = trimmedFrom;
        let maxEnd = trimmedTo;

        while ((match = formattedRegex.exec(lineText)) !== null) {
          const matchStart = match.index;
          const matchEnd = match.index + match[0].length;

          if (matchStart < trimmedTo && matchEnd > trimmedFrom) {
            minStart = Math.min(minStart, matchStart);
            maxEnd = Math.max(maxEnd, matchEnd);
          }
        }

        trimmedFrom = minStart;
        trimmedTo = maxEnd;
        finalTrimmed = lineText.substring(trimmedFrom, trimmedTo);
      }

      const isFormatted =
        finalTrimmed.startsWith(prefix) &&
        finalTrimmed.endsWith(suffix) &&
        finalTrimmed.length > prefix.length + suffix.length;

      edits.push({
        line,
        trimmedFrom: trimmedFrom + 1,
        trimmedTo: trimmedTo + 1,
        trimmedText: finalTrimmed,
        isFormatted,
        originalFrom: originalTrimmedFrom + 1,
        originalTo: originalTrimmedTo + 1,
      });
    }

    return edits;
  }

  public toggleFormatting(prefix: string, suffix: string): void {
    if (!this.monacoEditor) return;

    const selection = this.monacoEditor.getSelection();
    if (!selection) return;

    const model = this.monacoEditor.getModel();
    if (!model) return;

    const position = this.monacoEditor.getPosition();
    if (!position) return;

    const selectedText = model.getValueInRange(selection);

    if (selectedText) {
      const from = new monaco.Position(
        selection.startLineNumber,
        selection.startColumn
      );
      const to = new monaco.Position(
        selection.endLineNumber,
        selection.endColumn
      );
      const edits = this.getLineEdits(model, from, to, prefix, suffix);

      if (edits.length === 0) return;

      const allFormatted = edits.every((e) => e.isFormatted);
      const shouldFormat = !allFormatted;

      for (let i = edits.length - 1; i >= 0; i--) {
        const edit = edits[i];
        const editRange = new monaco.Range(
          edit.line,
          edit.trimmedFrom,
          edit.line,
          edit.trimmedTo
        );

        if (shouldFormat) {
          if (edit.isFormatted) {
            continue;
          } else {
            let cleanText = edit.trimmedText;
            const formattedPartRegex = new RegExp(
              `${prefix.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}(.+?)${suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
              "g"
            );
            cleanText = cleanText.replace(formattedPartRegex, "$1");

            const wrapped = `${prefix}${cleanText}${suffix}`;
            this.monacoEditor.executeEdits("typst-format", [
              {
                range: editRange,
                text: wrapped,
              },
            ]);
          }
        } else {
          if (edit.isFormatted) {
            const unwrapped = edit.trimmedText.substring(
              prefix.length,
              edit.trimmedText.length - suffix.length
            );
            this.monacoEditor.executeEdits("typst-format", [
              {
                range: editRange,
                text: unwrapped,
              },
            ]);
          } else {
            continue;
          }
        }
      }

      const firstEdit = edits[0];
      const lastEdit = edits[edits.length - 1];

      let newFromColumn: number;
      let newToColumn: number;

      if (shouldFormat) {
        if (firstEdit.isFormatted) {
          newFromColumn = firstEdit.originalFrom;
        } else {
          const firstOffset = firstEdit.originalFrom - firstEdit.trimmedFrom;
          newFromColumn =
            firstEdit.trimmedFrom + prefix.length + Math.max(0, firstOffset);
        }

        if (lastEdit.isFormatted) {
          const lastOffset = lastEdit.originalTo - lastEdit.trimmedFrom;
          newToColumn =
            lastEdit.trimmedFrom +
            Math.min(lastOffset, lastEdit.trimmedText.length - suffix.length);
        } else {
          let cleanText = lastEdit.trimmedText;
          const formattedPartRegex = new RegExp(
            `${prefix.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}(.+?)${suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            "g"
          );
          cleanText = cleanText.replace(formattedPartRegex, "$1");
          const lastOffset = lastEdit.originalTo - lastEdit.trimmedFrom;
          newToColumn =
            lastEdit.trimmedFrom +
            prefix.length +
            Math.min(lastOffset, cleanText.length);
        }
      } else {
        const firstOffset = firstEdit.originalFrom - firstEdit.trimmedFrom;

        if (firstEdit.isFormatted) {
          newFromColumn =
            firstEdit.trimmedFrom + Math.max(0, firstOffset - prefix.length);
        } else {
          newFromColumn = firstEdit.originalFrom;
        }

        if (lastEdit.isFormatted) {
          const lastOffset = lastEdit.originalTo - lastEdit.trimmedFrom;
          const cappedOffset = Math.min(
            lastOffset,
            lastEdit.trimmedText.length - suffix.length
          );
          newToColumn =
            lastEdit.trimmedFrom + Math.max(0, cappedOffset - prefix.length);
        } else {
          newToColumn = lastEdit.originalTo;
        }
      }

      const newSelection = new monaco.Selection(
        firstEdit.line,
        newFromColumn,
        lastEdit.line,
        newToColumn
      );

      this.monacoEditor.setSelection(newSelection);
    } else {
      const wordRange = this.getWordAtPosition(model, position);

      if (wordRange) {
        const word = model.getValueInRange(wordRange);
        const line = model.getLineContent(position.lineNumber);

        const beforeStart = Math.max(1, wordRange.startColumn - prefix.length);
        const afterEnd = Math.min(
          line.length + 1,
          wordRange.endColumn + suffix.length
        );
        const before = line.substring(
          beforeStart - 1,
          wordRange.startColumn - 1
        );
        const after = line.substring(wordRange.endColumn - 1, afterEnd - 1);

        const isFormatted = before === prefix && after === suffix;

        if (isFormatted) {
          const removeRange = new monaco.Range(
            position.lineNumber,
            beforeStart,
            position.lineNumber,
            afterEnd
          );

          this.monacoEditor.executeEdits("typst-format", [
            {
              range: removeRange,
              text: word,
            },
          ]);

          const cursorOffset = position.column - wordRange.startColumn;
          const newColumn = beforeStart + cursorOffset;
          this.monacoEditor.setPosition(
            new monaco.Position(position.lineNumber, newColumn)
          );
        } else {
          const wrapped = `${prefix}${word}${suffix}`;

          this.monacoEditor.executeEdits("typst-format", [
            {
              range: wordRange,
              text: wrapped,
            },
          ]);

          const cursorOffset = position.column - wordRange.startColumn;
          const newColumn =
            wordRange.startColumn + cursorOffset + prefix.length;

          this.monacoEditor.setPosition(
            new monaco.Position(position.lineNumber, newColumn)
          );
        }
      } else {
        this.monacoEditor.executeEdits("typst-format", [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text: `${prefix}${suffix}`,
          },
        ]);

        this.monacoEditor.setPosition(
          new monaco.Position(
            position.lineNumber,
            position.column + prefix.length
          )
        );
      }
    }

    this.monacoEditor.focus();
  }

  public increaseHeadingLevel(): void {
    if (!this.monacoEditor) return;

    const position = this.monacoEditor.getPosition();
    if (!position) return;

    const model = this.monacoEditor.getModel();
    if (!model) return;

    const lineNumber = position.lineNumber;
    const lineContent = model.getLineContent(lineNumber);
    const match = lineContent.match(/^(=+)\s/);

    if (match && match[1].length > 1) {
      const newHeading = lineContent.substring(1);
      const range = new monaco.Range(
        lineNumber,
        1,
        lineNumber,
        lineContent.length + 1
      );
      this.monacoEditor.executeEdits("typst-heading", [
        {
          range: range,
          text: newHeading,
        },
      ]);
      const newColumn = Math.max(1, position.column - 1);
      this.monacoEditor.setPosition({ lineNumber, column: newColumn });
    }
    this.monacoEditor.focus();
  }

  public decreaseHeadingLevel(): void {
    if (!this.monacoEditor) return;

    const position = this.monacoEditor.getPosition();
    if (!position) return;

    const model = this.monacoEditor.getModel();
    if (!model) return;

    const lineNumber = position.lineNumber;
    const lineContent = model.getLineContent(lineNumber);
    const match = lineContent.match(/^(=+)\s/);

    if (match) {
      const currentLevel = match[1].length;
      if (currentLevel < 6) {
        const newHeading = "=" + lineContent;
        const range = new monaco.Range(
          lineNumber,
          1,
          lineNumber,
          lineContent.length + 1
        );
        this.monacoEditor.executeEdits("typst-heading", [
          {
            range: range,
            text: newHeading,
          },
        ]);
        this.monacoEditor.setPosition({
          lineNumber,
          column: position.column + 1,
        });
      }
    }
    this.monacoEditor.focus();
  }

  public async updateTheme(): Promise<void> {
    if (!this.monacoEditor) return;

    const state = this.getEditorState();
    const content = this.getContent();

    this.destroy();
    await this.initialize(content);

    if (state) {
      this.restoreEditorState(state);
    }
  }
}
