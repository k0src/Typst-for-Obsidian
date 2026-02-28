import { Scope, Platform } from "obsidian";
import { TypstEditor } from "./typstEditor";

export interface HotkeyDefinition {
  id: string;
  label: string;
  defaultKey: string | null;
  type: "monaco" | "custom";
}

export const HOTKEY_DEFINITIONS: HotkeyDefinition[] = [
  // Formatting
  { id: "toggleBold", label: "Bold", defaultKey: "Mod+b", type: "custom" },
  { id: "toggleItalic", label: "Italic", defaultKey: "Mod+i", type: "custom" },
  {
    id: "toggleUnderline",
    label: "Underline",
    defaultKey: "Mod+u",
    type: "custom",
  },
  {
    id: "increaseHeadingLevel",
    label: "Increase heading level",
    defaultKey: "Mod+]",
    type: "custom",
  },
  {
    id: "decreaseHeadingLevel",
    label: "Decrease heading level",
    defaultKey: "Mod+[",
    type: "custom",
  },
  { id: "paste", label: "Paste", defaultKey: "Mod+v", type: "custom" },

  // Find & Replace
  { id: "actions.find", label: "Find", defaultKey: "Mod+f", type: "monaco" },
  {
    id: "editor.action.startFindReplaceAction",
    label: "Find and replace",
    defaultKey: "Mod+h",
    type: "monaco",
  },
  {
    id: "editor.action.nextSelectionMatchFindAction",
    label: "Find next selection match",
    defaultKey: "Mod+F3",
    type: "monaco",
  },
  {
    id: "editor.action.previousSelectionMatchFindAction",
    label: "Find previous selection match",
    defaultKey: "Mod+Shift+F3",
    type: "monaco",
  },

  // Selection
  {
    id: "editor.action.addSelectionToNextFindMatch",
    label: "Add selection to next match",
    defaultKey: "Mod+d",
    type: "monaco",
  },
  {
    id: "expandLineSelection",
    label: "Select line",
    defaultKey: "Mod+l",
    type: "monaco",
  },
  {
    id: "editor.action.selectHighlights",
    label: "Select all occurrences",
    defaultKey: "Mod+Shift+l",
    type: "monaco",
  },
  {
    id: "editor.action.insertCursorAtEndOfEachLineSelected",
    label: "Insert cursor at end of each line",
    defaultKey: "Shift+Alt+i",
    type: "monaco",
  },
  {
    id: "editor.action.addSelectionToPreviousFindMatch",
    label: "Add selection to previous match",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.moveSelectionToNextFindMatch",
    label: "Move selection to next match",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.moveSelectionToPreviousFindMatch",
    label: "Move selection to previous match",
    defaultKey: null,
    type: "monaco",
  },

  // Multi-cursor
  {
    id: "editor.action.insertCursorAbove",
    label: "Insert cursor above",
    defaultKey: "Mod+Alt+ArrowUp",
    type: "monaco",
  },
  {
    id: "editor.action.insertCursorBelow",
    label: "Insert cursor below",
    defaultKey: "Mod+Alt+ArrowDown",
    type: "monaco",
  },

  // Line operations
  {
    id: "editor.action.copyLinesUpAction",
    label: "Copy line up",
    defaultKey: "Shift+Alt+ArrowUp",
    type: "monaco",
  },
  {
    id: "editor.action.copyLinesDownAction",
    label: "Copy line down",
    defaultKey: "Shift+Alt+ArrowDown",
    type: "monaco",
  },
  {
    id: "editor.action.moveLinesUpAction",
    label: "Move line up",
    defaultKey: "Alt+ArrowUp",
    type: "monaco",
  },
  {
    id: "editor.action.moveLinesDownAction",
    label: "Move line down",
    defaultKey: "Alt+ArrowDown",
    type: "monaco",
  },
  {
    id: "editor.action.insertLineBefore",
    label: "Insert line above",
    defaultKey: "Mod+Shift+Enter",
    type: "monaco",
  },
  {
    id: "editor.action.insertLineAfter",
    label: "Insert line below",
    defaultKey: "Mod+Enter",
    type: "monaco",
  },
  {
    id: "editor.action.duplicateSelection",
    label: "Duplicate selection",
    defaultKey: "Mod+Shift+d",
    type: "monaco",
  },

  // Delete operations
  {
    id: "deleteAllLeft",
    label: "Delete all left",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "deleteAllRight",
    label: "Delete all right",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "deleteInsideWord",
    label: "Delete word",
    defaultKey: null,
    type: "monaco",
  },

  // Navigation
  {
    id: "editor.action.gotoLine",
    label: "Go to line",
    defaultKey: "Mod+g",
    type: "monaco",
  },
  {
    id: "editor.action.jumpToBracket",
    label: "Go to bracket",
    defaultKey: null,
    type: "monaco",
  },

  // Markers/Problems
  {
    id: "editor.action.marker.next",
    label: "Go to next problem",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.marker.prev",
    label: "Go to previous problem",
    defaultKey: null,
    type: "monaco",
  },

  // Comments
  {
    id: "editor.action.commentLine",
    label: "Toggle line comment",
    defaultKey: "Mod+/",
    type: "monaco",
  },

  // Folding
  {
    id: "editor.fold",
    label: "Fold",
    defaultKey: "Mod+Shift+[",
    type: "monaco",
  },
  {
    id: "editor.unfold",
    label: "Unfold",
    defaultKey: "Mod+Shift+]",
    type: "monaco",
  },
  { id: "editor.foldAll", label: "Fold all", defaultKey: null, type: "monaco" },
  {
    id: "editor.unfoldAll",
    label: "Unfold all",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.foldAllBlockComments",
    label: "Fold all block comments",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.foldAllMarkerRegions",
    label: "Fold all marker regions",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.unfoldAllMarkerRegions",
    label: "Unfold all marker regions",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.foldAllExcept",
    label: "Fold all except selected",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.unfoldAllExcept",
    label: "Unfold all except selected",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.toggleFold",
    label: "Toggle fold",
    defaultKey: null,
    type: "monaco",
  },

  // Brackets
  {
    id: "editor.action.removeBrackets",
    label: "Remove brackets",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.selectToBracket",
    label: "Select to bracket",
    defaultKey: null,
    type: "monaco",
  },

  // Caret/text manipulation
  {
    id: "editor.action.setSelectionAnchor",
    label: "Set selection anchor",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.moveCarretLeftAction",
    label: "Move caret left",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.moveCarretRightAction",
    label: "Move caret right",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.transposeLetters",
    label: "Transpose letters",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.pasteAsText",
    label: "Paste as text",
    defaultKey: null,
    type: "monaco",
  },

  // Zoom
  {
    id: "editor.action.fontZoomIn",
    label: "Zoom in",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.fontZoomOut",
    label: "Zoom out",
    defaultKey: null,
    type: "monaco",
  },
  {
    id: "editor.action.fontZoomReset",
    label: "Reset zoom",
    defaultKey: null,
    type: "monaco",
  },
];

export function parseKeybind(keybind: string): {
  modifiers: string[];
  key: string;
} {
  const parts = keybind.split("+");
  const key = parts.pop()!;
  return { modifiers: parts, key };
}

export function getEffectiveKeybind(
  def: HotkeyDefinition,
  overrides: Record<string, string>,
): string | null {
  if (def.id in overrides) {
    return overrides[def.id] || null;
  }
  return def.defaultKey;
}

export function formatKeybind(keybind: string): string[] {
  const { modifiers, key } = parseKeybind(keybind);
  const parts: string[] = [];

  for (const mod of modifiers) {
    if (mod === "Mod") parts.push(Platform.isMacOS ? "\u2318" : "Ctrl");
    else if (mod === "Alt") parts.push(Platform.isMacOS ? "\u2325" : "Alt");
    else if (mod === "Shift") parts.push(Platform.isMacOS ? "\u21e7" : "Shift");
    else if (mod === "Ctrl") parts.push("Ctrl");
    else if (mod === "Meta") parts.push(Platform.isMacOS ? "\u2318" : "Win");
  }

  const keyMap: Record<string, string> = {
    ArrowUp: "\u2191",
    ArrowDown: "\u2193",
    ArrowLeft: "\u2190",
    ArrowRight: "\u2192",
    Enter: "\u21b5",
    Backspace: "\u232b",
    Delete: "Del",
    Escape: "Esc",
    " ": "Space",
  };

  const displayKey =
    keyMap[key] || (key.length === 1 ? key.toUpperCase() : key);
  parts.push(displayKey);

  return parts;
}

const MODIFIER_KEYS = new Set([
  "Control",
  "Shift",
  "Alt",
  "Meta",
  "CapsLock",
  "NumLock",
  "ScrollLock",
]);

const CODE_TO_KEY: Record<string, string> = {
  BracketLeft: "[",
  BracketRight: "]",
  Slash: "/",
  Backslash: "\\",
  Comma: ",",
  Period: ".",
  Semicolon: ";",
  Quote: "'",
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  Enter: "Enter",
  Space: " ",
  Tab: "Tab",
  Backspace: "Backspace",
  Delete: "Delete",
  Escape: "Escape",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
};

export function keybindFromEvent(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null;

  const modifiers: string[] = [];
  if (e.ctrlKey || e.metaKey) modifiers.push("Mod");
  if (e.shiftKey) modifiers.push("Shift");
  if (e.altKey) modifiers.push("Alt");

  let key: string;
  if (e.code.startsWith("Key")) {
    key = e.code.slice(3).toLowerCase();
  } else if (e.code.startsWith("Digit")) {
    key = e.code.slice(5);
  } else if (e.code.startsWith("F") && /^F\d+$/.test(e.code)) {
    key = e.code;
  } else {
    key = CODE_TO_KEY[e.code] || e.key;
  }

  return [...modifiers, key].join("+");
}

export function findConflicts(
  actionId: string,
  keybind: string,
  overrides: Record<string, string>,
): HotkeyDefinition[] {
  const conflicts: HotkeyDefinition[] = [];
  for (const def of HOTKEY_DEFINITIONS) {
    if (def.id === actionId) continue;
    const effective = getEffectiveKeybind(def, overrides);
    if (effective && effective.toLowerCase() === keybind.toLowerCase()) {
      conflicts.push(def);
    }
  }
  return conflicts;
}

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

  registerAll(hotkeyOverrides: Record<string, string>): void {
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

    for (const def of HOTKEY_DEFINITIONS) {
      const keybind = getEffectiveKeybind(def, hotkeyOverrides);
      if (!keybind) continue;

      const { modifiers, key } = parseKeybind(keybind);

      if (def.type === "custom") {
        const handler = this.getCustomHandler(def.id);
        if (handler) {
          scope.register(modifiers as any, key, sourceAction(handler));
        }
      } else {
        scope.register(modifiers as any, key, monacoAction(def.id));
      }
    }
  }

  private getCustomHandler(id: string): (() => void) | null {
    switch (id) {
      case "toggleBold":
        return () => this.callbacks.toggleBold();
      case "toggleItalic":
        return () => this.callbacks.toggleItalic();
      case "toggleUnderline":
        return () => this.callbacks.toggleUnderline();
      case "increaseHeadingLevel":
        return () => this.callbacks.increaseHeadingLevel();
      case "decreaseHeadingLevel":
        return () => this.callbacks.decreaseHeadingLevel();
      case "paste":
        return () => this.callbacks.getEditor()?.paste();
      default:
        return null;
    }
  }
}
