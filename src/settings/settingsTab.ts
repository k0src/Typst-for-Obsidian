import { App, PluginSettingTab, Setting, setIcon } from "obsidian";
import { DEFAULT_SETTINGS, SyntaxHighlightColors } from "./settings";
import TypstForObsidian from "../main";
import { SettingsModal } from "./settingsModal";
import {
  getCustomLayoutFunctionsConfig,
  getPdfLayoutFunctionsConfig,
  getFontFamiliesConfig,
  getCustomSnippetsConfig,
  getImportColorsConfig,
  getExportColorsConfig,
} from "./settingsModalConfigs";
import {
  HOTKEY_DEFINITIONS,
  getEffectiveKeybind,
  formatKeybind,
  keybindFromEvent,
  findConflicts,
} from "../editorHotkeyManager";

export class TypstSettingTab extends PluginSettingTab {
  plugin: TypstForObsidian;

  constructor(app: App, plugin: TypstForObsidian) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Use custom default layout functions")
      .setDesc(
        "Wraps editor content with default page, text, and styling functions.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useDefaultLayoutFunctions)
          .onChange(async (value: boolean) => {
            this.plugin.settings.useDefaultLayoutFunctions = value;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    if (this.plugin.settings.useDefaultLayoutFunctions) {
      new Setting(containerEl)
        .setName("Custom layout functions")
        .addButton((button) =>
          button.setButtonText("Edit").onClick(() => {
            new SettingsModal(
              this.app,
              getCustomLayoutFunctionsConfig(this.plugin),
            ).open();
          }),
        );
    }

    new Setting(containerEl)
      .setName("Font families")
      .setDesc("System font families to load for Typst compilation.")
      .addButton((button) =>
        button.setButtonText("Edit").onClick(() => {
          new SettingsModal(
            this.app,
            getFontFamiliesConfig(this.plugin),
          ).open();
        }),
      );

    new Setting(containerEl)
      .setName("Auto-download packages")
      .setDesc(
        "Automatically download Typst packages from the Typst Universe when compiling.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoDownloadPackages)
          .onChange(async (value: boolean) => {
            this.plugin.settings.autoDownloadPackages = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl).setHeading().setName("PDF Settings");

    new Setting(containerEl)
      .setName("Use PDF export layout functions")
      .setDesc("Customize layout functions for PDF exports only.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.usePdfLayoutFunctions)
          .onChange(async (value: boolean) => {
            this.plugin.settings.usePdfLayoutFunctions = value;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    if (this.plugin.settings.usePdfLayoutFunctions) {
      new Setting(containerEl)
        .setName("PDF export layout functions")
        .addButton((button) =>
          button.setButtonText("Edit").onClick(() => {
            new SettingsModal(
              this.app,
              getPdfLayoutFunctionsConfig(this.plugin),
            ).open();
          }),
        );
    }

    new Setting(containerEl)
      .setName("Enable text layer")
      .setDesc(
        "Enable text selection and link clicking in PDF preview. Disable for better performance if not needed.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableTextLayer)
          .onChange(async (value: boolean) => {
            this.plugin.settings.enableTextLayer = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Suppress PDF export notice")
      .setDesc("Hide the notification shown after exporting a PDF.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.suppressPdfExportNotice)
          .onChange(async (value: boolean) => {
            this.plugin.settings.suppressPdfExportNotice = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Default PDF export location")
      .setDesc(
        "Folder path in vault to export PDFs to. Leave blank to export in the same directory as the .typ file.",
      )
      .addText((text) =>
        text
          .setPlaceholder("e.g. exports/pdf")
          .setValue(this.plugin.settings.pdfExportPath)
          .onChange(async (value: string) => {
            this.plugin.settings.pdfExportPath = value.trim();
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Open PDF in split pane on export")
      .setDesc(
        "Automatically open the exported PDF in a split pane after exporting.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.openPdfOnExport)
          .onChange(async (value: boolean) => {
            this.plugin.settings.openPdfOnExport = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl).setHeading().setName("Editor Settings");

    new Setting(containerEl)
      .setName("Default file mode")
      .setDesc(
        "Choose whether Typst files open in source or reading mode by default",
      )
      .addDropdown((dropdown) =>
        dropdown
          .addOption("source", "Source mode")
          .addOption("reading", "Reading mode")
          .setValue(this.plugin.settings.defaultMode)
          .onChange(async (value: "source" | "reading") => {
            this.plugin.settings.defaultMode = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Use Obsidian monospace font")
      .setDesc(
        "Use Obsidian theme's monospace font in the editor. Disable to use the editor's default font.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useObsidianMonospaceFont)
          .onChange(async (value: boolean) => {
            this.plugin.settings.useObsidianMonospaceFont = value;
            await this.plugin.saveSettings();

            this.app.workspace.getLeavesOfType("typst-view").forEach((leaf) => {
              const view = leaf.view as any;
              if (
                view &&
                view.getCurrentMode &&
                view.getCurrentMode() === "source"
              ) {
                view.showSourceMode?.();
              }
            });
          }),
      );

    new Setting(containerEl)
      .setName("Custom snippets")
      .setDesc("Define custom snippets in JSON format.")
      .addButton((button) =>
        button.setButtonText("Edit").onClick(() => {
          new SettingsModal(
            this.app,
            getCustomSnippetsConfig(this.plugin),
          ).open();
        }),
      );

    this.addHotkeySection(containerEl);

    new Setting(containerEl).setHeading().setName("Live Preview");

    new Setting(containerEl)
      .setName("Enable live preview")
      .setDesc(
        "When editing in split-pane mode, automatically compile and update the preview with shorter debounce delay.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableLivePreview)
          .onChange(async (value: boolean) => {
            this.plugin.settings.enableLivePreview = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Live preview debounce delay")
      .setDesc(
        "Milliseconds to wait after typing before compiling in live preview mode (100-2000ms).",
      )
      .addSlider((slider) =>
        slider
          .setLimits(100, 2000, 100)
          .setValue(this.plugin.settings.livePreviewDebounce)
          .setDynamicTooltip()
          .onChange(async (value: number) => {
            this.plugin.settings.livePreviewDebounce = value;
            await this.plugin.saveSettings();
          }),
      );

    const syntaxHeading = new Setting(containerEl)
      .setHeading()
      .setName("Syntax Highlighting");

    const importButton = syntaxHeading.controlEl.createEl("button");
    importButton.addClass("clickable-icon");
    importButton.setAttribute("aria-label", "Import colors");
    setIcon(importButton, "folder-up");

    importButton.addEventListener("click", async (e) => {
      e.preventDefault();
      new SettingsModal(
        this.app,
        getImportColorsConfig(
          this.plugin,
          this.setSyntaxHighlightingColors.bind(this),
          this.display.bind(this),
        ),
      ).open();
    });

    const exportButton = syntaxHeading.controlEl.createEl("button");
    exportButton.addClass("clickable-icon");
    exportButton.setAttribute("aria-label", "Export colors");
    setIcon(exportButton, "install");

    exportButton.addEventListener("click", async (e) => {
      e.preventDefault();
      new SettingsModal(this.app, getExportColorsConfig(this.plugin)).open();
    });

    new Setting(containerEl)
      .setName("Use theme text color")
      .setDesc(
        "Use theme's text color for default text instead of custom color",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useObsidianTextColor)
          .onChange(async (value: boolean) => {
            this.plugin.settings.useObsidianTextColor = value;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    this.addSyntaxColorSection(
      containerEl,
      "Dark Theme Colors",
      "dark",
      this.plugin.settings.useObsidianTextColor,
    );

    this.addSyntaxColorSection(
      containerEl,
      "Light Theme Colors",
      "light",
      this.plugin.settings.useObsidianTextColor,
    );
  }

  private setSyntaxHighlightingColors(
    theme: "dark" | "light",
    colors: SyntaxHighlightColors["dark"] | SyntaxHighlightColors["light"],
  ): void {
    this.plugin.settings.syntaxHighlightColors[theme] = { ...colors };
  }

  private addSyntaxColorSection(
    containerEl: HTMLElement,
    title: string,
    theme: "dark" | "light",
    disableDefaultText: boolean,
  ): void {
    const details = containerEl.createEl("details");
    const summary = details.createEl("summary");
    summary.addClass("typst-syntax-colors-summary");

    const summaryTitle = summary.createDiv({
      cls: "typst-syntax-colors-title",
    });
    setIcon(summaryTitle, theme === "dark" ? "moon" : "sun");
    summaryTitle.createSpan({ text: title });

    const resetButton = summary.createEl("button");
    resetButton.addClass("clickable-icon");
    resetButton.setAttribute("aria-label", "Reset to default");
    setIcon(resetButton, "rotate-ccw");

    resetButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.setSyntaxHighlightingColors(
        theme,
        DEFAULT_SETTINGS.syntaxHighlightColors[theme],
      );
      await this.plugin.saveSettings();
      this.display();
    });

    const colorCategories: {
      key: keyof SyntaxHighlightColors["dark"];
      label: string;
    }[] = [
      { key: "defaultText", label: "Default Text" },
      { key: "comments", label: "Comments" },
      { key: "keywords", label: "Keywords" },
      { key: "strings", label: "Strings" },
      { key: "labelsAndReferences", label: "Labels and References" },
      { key: "escapeSequences", label: "Escape Sequences" },
      { key: "numbers", label: "Numbers" },
      { key: "booleans", label: "Booleans" },
      { key: "symbols", label: "Symbols" },
      { key: "functions", label: "Functions" },
      { key: "types", label: "Types" },
      { key: "variables", label: "Variables" },
      { key: "constants", label: "Constants" },
      { key: "operators", label: "Operators" },
      { key: "headings", label: "Headings" },
      { key: "bold", label: "Bold" },
      { key: "italic", label: "Italic" },
      { key: "links", label: "Links" },
      { key: "mathText", label: "Math Text" },
      { key: "mathOperators", label: "Math Operators" },
      { key: "rawCode", label: "Raw Code" },
      { key: "codeLanguage", label: "Code Language" },
      { key: "listMarkers", label: "List Markers" },
      { key: "punctuation", label: "Punctuation" },
      { key: "separators", label: "Separators" },
      { key: "braces", label: "Braces" },
      { key: "metaExpressions", label: "Meta Expressions" },
      { key: "generalPunctuation", label: "General Punctuation" },
    ];

    for (const { key, label } of colorCategories) {
      const setting = new Setting(details).setName(label);

      setting.addColorPicker((colorPicker) => {
        colorPicker
          .setValue(this.plugin.settings.syntaxHighlightColors[theme][key])
          .onChange(async (value: string) => {
            this.plugin.settings.syntaxHighlightColors[theme][key] = value;
            await this.plugin.saveSettings();
          });

        if (key === "defaultText" && disableDefaultText) {
          colorPicker.setDisabled(true);
        }
      });
    }
  }

  private addHotkeySection(containerEl: HTMLElement): void {
    const details = containerEl.createEl("details");
    const summary = details.createEl("summary");
    summary.addClass("typst-hotkeys-summary");

    const summaryTitle = summary.createDiv({
      cls: "typst-hotkeys-title",
    });
    setIcon(summaryTitle, "keyboard");
    summaryTitle.createSpan({ text: "Editor Hotkeys" });

    const resetButton = summary.createEl("button");
    resetButton.addClass("clickable-icon");
    resetButton.setAttribute("aria-label", "Reset all to defaults");
    setIcon(resetButton, "rotate-ccw");

    resetButton.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.plugin.settings.editorHotkeys = {};
      await this.plugin.saveSettings();
      this.display();
    });

    for (const def of HOTKEY_DEFINITIONS) {
      const setting = new Setting(details).setName(def.label);
      this.renderHotkeyControl(setting.controlEl, def);
    }
  }

  private renderHotkeyControl(
    controlEl: HTMLElement,
    def: (typeof HOTKEY_DEFINITIONS)[number],
  ): void {
    controlEl.empty();
    controlEl.addClass("typst-hotkey-control");

    const overrides = this.plugin.settings.editorHotkeys;
    const effective = getEffectiveKeybind(def, overrides);
    const isModified = def.id in overrides;

    if (effective) {
      const badge = controlEl.createEl("kbd", "typst-hotkey-badge");
      badge.setText(formatKeybind(effective).join(" + "));

      const removeBtn = controlEl.createDiv("clickable-icon");
      removeBtn.setAttribute("aria-label", "Remove hotkey");
      setIcon(removeBtn, "x");
      removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        this.plugin.settings.editorHotkeys[def.id] = "";
        await this.plugin.saveSettings();
        this.renderHotkeyControl(controlEl, def);
      });
    }

    if (isModified) {
      const resetBtn = controlEl.createDiv("clickable-icon");
      resetBtn.setAttribute("aria-label", "Restore default");
      setIcon(resetBtn, "rotate-ccw");
      resetBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        delete this.plugin.settings.editorHotkeys[def.id];
        await this.plugin.saveSettings();
        this.renderHotkeyControl(controlEl, def);
      });
    }

    const addBtn = controlEl.createDiv("clickable-icon");
    addBtn.setAttribute("aria-label", "Set hotkey");
    setIcon(addBtn, "circle-plus");
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.startCapture(controlEl, def);
    });
  }

  private startCapture(
    controlEl: HTMLElement,
    def: (typeof HOTKEY_DEFINITIONS)[number],
  ): void {
    controlEl.empty();
    controlEl.addClass("typst-hotkey-control");

    const captureEl = controlEl.createDiv("typst-hotkey-capture");
    captureEl.setText("Press hotkey...");

    const conflictEl = controlEl.createDiv("typst-hotkey-conflict");

    const cleanup = () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("click", onClickOutside, true);
    };

    const onKeyDown = async (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        cleanup();
        this.renderHotkeyControl(controlEl, def);
        return;
      }

      const keybind = keybindFromEvent(e);
      if (!keybind) return;

      const conflicts = findConflicts(
        def.id,
        keybind,
        this.plugin.settings.editorHotkeys,
      );

      if (conflicts.length > 0) {
        conflictEl.empty();
        conflictEl.addClass("visible");
        const names = conflicts.map((c) => c.label).join(", ");
        conflictEl.setText(`Already assigned to: ${names}`);

        setTimeout(() => {
          conflictEl.removeClass("visible");
        }, 3000);
        return;
      }

      this.plugin.settings.editorHotkeys[def.id] = keybind;
      await this.plugin.saveSettings();
      cleanup();
      this.renderHotkeyControl(controlEl, def);
    };

    const onClickOutside = (e: MouseEvent) => {
      if (!controlEl.contains(e.target as Node)) {
        cleanup();
        this.renderHotkeyControl(controlEl, def);
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    setTimeout(() => {
      document.addEventListener("click", onClickOutside, true);
    }, 0);
  }
}
