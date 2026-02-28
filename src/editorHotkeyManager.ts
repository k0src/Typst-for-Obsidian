import { Scope } from "obsidian";
import { TypstEditor } from "./typstEditor";

interface EditorHotkeyCallbacks {
  getCurrentMode: () => string;
  getEditor: () => TypstEditor | null;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  increaseHeadingLevel: () => void;
  decreaseHeadingLevel: () => void;
}

export class EditorHotkeyManager {
  constructor(
    private scope: Scope,
    private callbacks: EditorHotkeyCallbacks,
  ) {}

  registerAll(): void {
    const { scope } = this;

    const sourceAction = (fn: () => void) => {
      return () => {
        if (this.callbacks.getCurrentMode() === "source") {
          fn();
          return false;
        }
      };
    };

    const monacoAction = (actionId: string) => {
      return sourceAction(() => {
        this.callbacks.getEditor()?.triggerAction(actionId);
      });
    };

    // Bold
    scope.register(
      ["Mod"],
      "b",
      sourceAction(() => this.callbacks.toggleBold()),
    );
    // Italic
    scope.register(
      ["Mod"],
      "i",
      sourceAction(() => this.callbacks.toggleItalic()),
    );
    // Underline
    scope.register(
      ["Mod"],
      "u",
      sourceAction(() => this.callbacks.toggleUnderline()),
    );
    // Heading level up
    scope.register(
      ["Mod"],
      "]",
      sourceAction(() => this.callbacks.increaseHeadingLevel()),
    );
    // Heading level down
    scope.register(
      ["Mod"],
      "[",
      sourceAction(() => this.callbacks.decreaseHeadingLevel()),
    );
    // Paste
    scope.register(["Mod"], "v", () => {
      if (this.callbacks.getCurrentMode() === "source") {
        this.callbacks.getEditor()?.paste();
        return false;
      }
    });
    // Find
    scope.register(["Mod"], "f", monacoAction("actions.find"));
    // Replace
    scope.register(
      ["Mod"],
      "h",
      monacoAction("editor.action.startFindReplaceAction"),
    );
    // Next match
    scope.register(
      ["Mod"],
      "F3",
      monacoAction("editor.action.nextSelectionMatchFindAction"),
    );
    // Previous match
    scope.register(
      ["Mod", "Shift"],
      "F3",
      monacoAction("editor.action.previousSelectionMatchFindAction"),
    );
    // Select next match
    scope.register(
      ["Mod"],
      "d",
      monacoAction("editor.action.addSelectionToNextFindMatch"),
    );
    // Select line
    scope.register(["Mod"], "l", monacoAction("expandLineSelection"));
    // Select all occurrences of current selection
    scope.register(
      ["Mod", "Shift"],
      "l",
      monacoAction("editor.action.selectHighlights"),
    );
    // Insert cursor at end of each line selected
    scope.register(
      ["Shift", "Alt"],
      "i",
      monacoAction("editor.action.insertCursorAtEndOfEachLineSelected"),
    );
    // Select previous match
    // null - editor.action.addSelectionToPreviousFindMatch
    // Move selection to next find match
    // null - editor.action.moveSelectionToNextFindMatch
    // Move selection to previous find match
    // null - editor.action.moveSelectionToPreviousFindMatch
    // Insert cursor above
    scope.register(
      ["Mod", "Alt"],
      "ArrowUp",
      monacoAction("editor.action.insertCursorAbove"),
    );
    // Insert cursor below
    scope.register(
      ["Mod", "Alt"],
      "ArrowDown",
      monacoAction("editor.action.insertCursorBelow"),
    );
    // Copy line up
    scope.register(
      ["Shift", "Alt"],
      "ArrowUp",
      monacoAction("editor.action.copyLinesUpAction"),
    );
    // Copy line down
    scope.register(
      ["Shift", "Alt"],
      "ArrowDown",
      monacoAction("editor.action.copyLinesDownAction"),
    );
    // Move line up
    scope.register(
      ["Alt"],
      "ArrowUp",
      monacoAction("editor.action.moveLinesUpAction"),
    );
    // Move line down
    scope.register(
      ["Alt"],
      "ArrowDown",
      monacoAction("editor.action.moveLinesDownAction"),
    );
    // Insert line above
    scope.register(
      ["Mod", "Shift"],
      "Enter",
      monacoAction("editor.action.insertLineBefore"),
    );
    // Insert line below
    scope.register(
      ["Mod"],
      "Enter",
      monacoAction("editor.action.insertLineAfter"),
    );
    // Duplicate selection
    scope.register(
      ["Mod", "Shift"],
      "D",
      monacoAction("editor.action.duplicateSelection"),
    );
    // Delete left
    // null - deleteAllLeft
    // Delete Right
    // null - deleteAllRight
    // Delete word
    // null - deleteInsideWord
    // Go to line
    scope.register(["Mod"], "g", monacoAction("editor.action.gotoLine"));
    // Go to bracket
    // null - editor.action.jumpToBracket
    // Go to next problem
    scope.register([], "F8", monacoAction("editor.action.marker.next"));
    // Go to previous problem
    scope.register(["Shift"], "F8", monacoAction("editor.action.marker.prev"));
    // Comment line - needs lsp - not working
    scope.register(["Mod"], "/", monacoAction("editor.action.commentLine"));
    // Fold
    scope.register(["Mod", "Shift"], "[", monacoAction("editor.fold"));
    // Unfold
    scope.register(["Mod", "Shift"], "]", monacoAction("editor.unfold"));
    // Fold all
    // null - editor.foldAll
    // Unfold all
    // null - editor.unfoldAll
    // Fold all block comments
    // null - editor.foldAllBlockComments
    // Fold all markers
    // null - editor.foldAllMarkerRegions
    // Unfold all markers
    // null - editor.unfoldAllMarkerRegions
    // Fold all except selected
    // null - editor.foldAllExcept
    // Unfold all except selected
    // null - editor.unfoldAllExcept
    // Toggle fold
    // null - editor.toggleFold
    //
    // null - editor.action.removeBrackets
    // null - editor.action.selectToBracket
    // null - editor.action.jumpToBracket
    // Zoom in
    // null - editor.action.fontZoomIn
    // Zoom out
    // null - editor.action.fontZoomOut
    // Reset zoom
    // null - editor.action.fontZoomReset
  }
}
