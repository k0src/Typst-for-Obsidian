import * as monaco from "monaco-editor";
import {
  INITIAL,
  Registry,
  parseRawGrammar,
  type IRawTheme,
} from "vscode-textmate";
import {
  loadWASM,
  createOnigScanner,
  createOnigString,
} from "vscode-oniguruma";
import type TypstPlugin from "../main";
import { getTypstTheme } from "./typstTheme";

import typstGrammar from "./typst.tmLanguage.json";

let registryInstance: Registry | null = null;
let languageRegistered = false;
let pluginInstance: TypstPlugin | null = null;

export function setPluginInstance(plugin: TypstPlugin): void {
  pluginInstance = plugin;
}

function cssColorToHex(cssColor: string): string {
  const tempEl = document.createElement("div");
  tempEl.style.color = cssColor;
  document.body.appendChild(tempEl);
  const computed = getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  return cssColor;
}

function getObsidianColors(): string {
  const computedStyle = getComputedStyle(document.body);
  const foregroundRaw = computedStyle.getPropertyValue("--text-normal").trim();
  const foreground = cssColorToHex(foregroundRaw);

  return foreground;
}

function applyObsidianColors(theme: IRawTheme): IRawTheme {
  const foreground = getObsidianColors();
  const clonedTheme = JSON.parse(JSON.stringify(theme));

  if (clonedTheme.settings[0]?.settings) {
    clonedTheme.settings[0].settings = {
      ...clonedTheme.settings[0].settings,
      foreground,
    };
  }

  return clonedTheme;
}

export function resetRegistry(): void {
  registryInstance = null;
}

async function loadRegistry(isDark: boolean): Promise<Registry> {
  if (registryInstance) return registryInstance;

  try {
    if (!pluginInstance) {
      throw new Error("Plugin instance not set.");
    }

    const onigWasmPath = pluginInstance.pluginPath + "onig.wasm";
    const wasmData = await pluginInstance.app.vault.adapter.readBinary(
      onigWasmPath
    );
    await loadWASM(wasmData);

    let theme = getTypstTheme(isDark);
    if (pluginInstance.settings.useObsidianTextColor) {
      theme = applyObsidianColors(theme);
    }

    const registry = new Registry({
      onigLib: Promise.resolve({
        createOnigScanner,
        createOnigString,
      }),

      async loadGrammar(scopeName: string) {
        if (scopeName === "source.typst") {
          return parseRawGrammar(
            JSON.stringify(typstGrammar),
            "typst.tmLanguage.json"
          );
        }
        return null;
      },

      theme: theme,
    });

    registryInstance = registry;
    return registry;
  } catch (error) {
    console.error("Failed to load Typst registry:", error);
    throw error;
  }
}

export async function registerTypstLanguage(): Promise<void> {
  if (languageRegistered) return;
  languageRegistered = true;

  monaco.languages.register({ id: "typst" });

  monaco.languages.setLanguageConfiguration("typst", {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "$", close: "$" },
      { open: "*", close: "*" },
      { open: "_", close: "_" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "$", close: "$" },
      { open: "*", close: "*" },
      { open: "_", close: "_" },
    ],
    wordPattern:
      /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}]*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
    onEnterRules: [
      {
        beforeText: /\{[^}]*$/,
        afterText: /^\s*\}/,
        action: {
          indentAction: monaco.languages.IndentAction.IndentOutdent,
        },
      },
      {
        beforeText: /\[[^\]]*$/,
        afterText: /^\s*\]/,
        action: {
          indentAction: monaco.languages.IndentAction.IndentOutdent,
        },
      },
      {
        beforeText: /\([^)]*$/,
        afterText: /^\s*\)/,
        action: {
          indentAction: monaco.languages.IndentAction.IndentOutdent,
        },
      },
    ],
  });
}

export async function setupTypstTokensProvider(isDark: boolean): Promise<void> {
  try {
    const registry = await loadRegistry(isDark);

    const grammar = await registry.loadGrammar("source.typst");
    if (!grammar) {
      throw new Error("Failed to load Typst grammar");
    }

    const colorMap = registry.getColorMap();
    monaco.languages.setColorMap(colorMap);
    monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
    monaco.languages.setTokensProvider("typst", {
      getInitialState() {
        return INITIAL;
      },

      tokenizeEncoded(
        line: string,
        state: monaco.languages.IState
      ): monaco.languages.IEncodedLineTokens {
        const tokenizeLineResult = grammar.tokenizeLine2(line, state as any);
        const { tokens, ruleStack: endState } = tokenizeLineResult;
        return { tokens, endState };
      },
    });
  } catch (error) {
    console.error("Failed to setup Typst tokens provider:", error);
    throw error;
  }
}

export async function ensureLanguageRegistered(isDark: boolean): Promise<void> {
  await registerTypstLanguage();
  await setupTypstTokensProvider(isDark);
}
