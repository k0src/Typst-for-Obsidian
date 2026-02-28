# Typst for Obsidian Documentation

...

## Usage

- live preview
- pdf split
- pdf export
- spell check

### Template Variables

### Custom Layout Functions

### Typst Code Blocks

## Settings

Typst for Obsidian settings can be accessed from `Settings > Community Plugins > Typst for Obsidian`.

### General

**Default file mode**:

The default mode that Typst (`.typ`) files open in by default. Options:

- Source mode: Open the raw Typst file in the editor.
- Live preview: Open the file in live preview mode, showing the rendered embedded PDF preview.
- Live preview split: Open the file in source mode, with the live preview side by side in a split pane.
- PDF split: Open the file in live preview mode, with the exported PDF side by side in a split pane.
- Last mode: Open the file in the last mode it was used in.

Note: If the file has is empty, it will always open in source mode by default. If the file has an error, it will open in source mode with the error message(s) shown in the problems pane.

_Default_: Source mode

---

**Use custom default layout functions**:

Turn this setting on to use custom default layout functions (or any Typst code) that you specify that will be prepended to every file before rendering. Turn off if you to render files as they are without any additional code.

_Default_: On

**[Custom layout functions](#custom-layout-functions)**:

If "Use custom default layout functions" is turned on, click the "Edit" button to open the a modal where you can enter any Typst code that will be prepended to every file before rendering. You can use this to set the page to match the Obsidian theme, to control the page margins, and to make the output render as a single page to make the preview appear as a seamless note. [Template variables](#template-variables) can also be used to here, to automatically match the theme colors, fonts, etc.

This code will be applied to both the live preview and PDF exports. You can also specify separate code for PDF exports only using the "Custom PDF export layout functions" setting.

_Default_: Some default layout functions are set by default to make the preview match the Obsidian theme and to make the output render as a single page.

<details>

<summary>Default custom layout functions:</summary>

```typst
#set page(
  // Normal reading mode width
  width: %LINEWIDTH%,
  // Makes everything on one page
  height: auto,
  // Essentially 0 margin.
  // Some padding is needed to
  // make the PDF not cut off
  margin: (x: 0.25em, y: 0.25em),
  // Set the BG color of page to
  // the BG color of Obsidian
  fill: rgb("%BGCOLOR%")
)

#set text(
  // Current Obsidian font size
  size: %FONTSIZE%,
  // Theme text color
  fill: rgb("%THEMECOLOR%")
)

// Paragraph styling
#set par(
  justify: true,
  leading: 0.65em
)

// Set colors of elements to theme colors
// Off by default, turn these on to set
// most Typst elements to the theme color
// #show heading: set text(fill: rgb("%HEADINGCOLOR%"))
// #show math.equation: set text(fill: rgb("%THEMECOLOR%"))
// #set block(fill: none)
// #set rect(fill: none, stroke: rgb("%THEMECOLOR%"))
// #set box(fill: none, stroke: rgb("%THEMECOLOR%"))
// #set circle(fill: none, stroke: rgb("%THEMECOLOR%"))
// #set ellipse(fill: none, stroke: rgb("%THEMECOLOR%"))
// #set polygon(fill: none, stroke: rgb("%THEMECOLOR%"))
// #set line(stroke: rgb("%THEMECOLOR%"))
// #show table: set table(stroke: rgb("%THEMECOLOR%"))
// #show math.equation: set box(stroke: none)
```

</details>

---

**Font families**:

Since loading system fonts can be an expensive operation, you can specify a list of system font families to load in Typst. Click the "Edit" button to open a modal where you can enter a list of system font families to load in Typst, one font per line. This allows you to use your system fonts in Typst files. For example, if you have the "Inter" font installed on your system, you can add "Inter" to the list of font families, and then you can use it in your Typst files, for example with `#set text(font: "Inter")` to set the font of the whole document to Inter.

Note: This setting is only applicable in desktop Obsidian. Additionally, Typst generally does not support variable fonts, so if you have a variable font family (e.g. "Inter") it may not work as expected. In that case, you can try specifying the individual font styles (e.g. "Inter 24pt") instead of the variable font family.

If you are having trouble finding the exact name of a font family, download [Typst](https://typst.app/open-source/#download) and run `typst fonts` in your terminal to see a list of all available font families that Typst can load.

_Default_: No system font families are loaded by default.

---

**Auto-download packages**:

Turn this setting on to automatically download packages from the Typst Universe when you use `#import` to import a package that is not already downloaded. For example, if you use `#import "@preview/typsidian:0.0.2": *;` to import the Typsidian template, Typst for Obsidian will automatically download the Typsidian template if it is not already downloaded.

_Default_: On

### PDF Settings

**Use custom PDF export layout functions**:

Turn this setting on to use custom layout functions (or any Typst code) that you specify for PDF exports only. This code will be prepended to the file before rendering the PDF export, but will not affect the live preview. This is useful if you want to have different layouts for the live preview and PDF exports. For example, you can use this to use a different page layout for PDF exports, or to add page numbers to the PDF exports but not the live preview.

_Default_: Off

---

**Custom PDF export layout functions**:

If "Use custom PDF export layout functions" is turned on, click the "Edit" button to open the a modal where you can enter any Typst code that will be prepended to the file before rendering PDF exports. You can use this to set a different page layout for PDF exports, or to add page numbers to the PDF exports but not the live preview.

_Default_: No custom PDF export layout functions by default.

---

**Enable text layer**:

Turn this setting on to enable the text layer in the exported PDF, which allows you to select and copy text from the PDF preview. Turning off the text layer may improve performance, especially for large documents, but will disable text selection in the exported PDF.

If on, the text layer can also be used to create backlinks in the exported PDF, with the [PDF++](https://github.com/RyotaUshio/obsidian-pdf-plus) plugin.

_Default_: On

---

**Suppress PDF export notice**:

Turn this setting off to disable the notice that appears when a PDF is exported. By default, the notice shows the file path of the exported PDF if it was exported successfully, or an error message if the export failed.

_Default_: Off

---

**Default PDF export location**:

Set the default location where PDF exports are saved when you export a PDF. By default, PDF exports are saved in the same directory as the source `.typ` file, with the same name but with a `.pdf` extension. You can change this to a different directory if you want all PDF exports to be saved in a specific location.

_Default_: Same directory as source file

---

**Open PDF in split pane on export**:

Turn this setting on to automatically open the exported PDF in a split pane next to the source file when you export a PDF. Note that you can also use the "Export PDF and open in split pane" command to export a PDF and open it in a split pane without turning on this setting.

_Default_: Off

---

### Editor Settings

**Use Obsidian monospace font**:

Turn this setting on to use the Obsidian monospace font in the source editor for `.typ` files. You can change this font in `Settings > Appearance > Font > Monospace font`. If this setting is turned off, the default editor font (your system's monospace font) will be used in the source editor for `.typ` files.

_Default_: On

---

**Editor font size**:

Specify the font size to use in the source editor for `.typ` files.

_Default_: 14px

---

**Custom snippets**:

Click the "Edit" button to open a modal where you can add custom Typst snippets for autocomplete in the source editor. These snippets are the same format as VS Code snippets; each snippet has a prefix (trigger) and body (lines to insert). You can use `$1`, `$2`, etc., for tab stops in the body of the snippet. `$0` can be used for the final tab stop, which is where the cursor will end up after you finish inserting the snippet.

The custom snippets should be a JSON object where the keys are the names of the snippets, and the values are objects with a "prefix" property for the trigger and a "body" property for the lines to insert.

_Default_: A `tbl` custom snippet example is included by default for inserting a table aligned to the center:

```json
{
  "table": {
    "prefix": "tbl",
    "body": [
      "#align(center,",
      "\ttable(",
      "\t\tcolumns: $1,",
      "\t\t[$2],",
      "\t)",
      ")"
    ]
  }
}
```

---

**Editor hotkeys**:

Click the "Editor hotkeys" setting to open a dropdown where you can set custom hotkeys for internal editor actions. These can be assigned to any hotkey combination - including hotkeys already set in Obsidian or other plugins. The hotkeys are scoped to only work when the source editor for a `.typ` file is focused, so they won't interfere with hotkeys in other parts of Obsidian.

<details>
<summary>Available hotkey actions:</summary>

| Action                                     | Default Hotkey      |
| ------------------------------------------ | ------------------- |
| Bold                                       | `Ctrl + B`          |
| Italic                                     | `Ctrl + I`          |
| Underline                                  | `Ctrl + U`          |
| Increase heading level                     | `Ctrl + ]`          |
| Decrease heading level                     | `Ctrl + [`          |
| Paste                                      | `Ctrl + V`          |
| Find                                       | `Ctrl + F`          |
| Find and replace                           | `Ctrl + H`          |
| Find next selection match                  | `Ctrl + Shift + F3` |
| Add selection to next match                | `Ctrl + D`          |
| Select line                                | `Ctrl + L`          |
| Select all occurrences                     | `Ctrl + Shift + L`  |
| Insert cursor at end of each selected line | `Shift + Alt + I`   |
| Add selection to previous match            | None                |
| Add selection to next match                | None                |
| Move selection to previous match           | None                |
| Insert cursor above                        | `Ctrl + Alt + ↑`    |
| Insert cursor below                        | `Ctrl + Alt + ↓`    |
| Copy line up                               | `Shift + Alt + ↑`   |
| Copy line down                             | `Shift + Alt + ↓`   |
| Move line up                               | `Alt + ↑`           |
| Move line down                             | `Alt + ↓`           |
| Insert line above                          | `Ctrl + Shift + ↩`  |
| Insert line below                          | `Ctrl + ↩`          |
| Duplicate selection                        | `Ctrl + Shift + D`  |
| Delete all left                            | None                |
| Delete all right                           | None                |
| Delete word                                | None                |
| Go to line number                          | `Ctrl + G`          |
| Go to bracket                              | None                |
| Go to next problem\*                       | None                |
| Go to previous problem\*                   | None                |
| Toggle line comment\*                      | `Ctrl + /`          |
| Fold                                       | `Ctrl + Shift + [`  |
| Unfold                                     | `Ctrl + Shift + ]`  |
| Fold all                                   | None                |
| Unfold all                                 | None                |
| Fold all block comments                    | None                |
| Fold all marker regions                    | None                |
| Unfold all marker regions                  | None                |
| Fold all except selected                   | None                |
| Unfold all except selected                 | None                |
| Toggle fold                                | None                |
| Remove brackets                            | None                |
| Select to bracket                          | None                |
| Set selection anchor                       | None                |
| Move caret left                            | None                |
| Move caret right                           | None                |
| Transpose letters                          | None                |
| Paste as text                              | None                |
| Zoom in                                    | None                |
| Zoom out                                   | None                |
| Reset zoom                                 | None                |

Note: The actions marked with an asterisk (\*) are not implemented yet, but will be added in a future update.

</details>

### Live Preview

**Enable live preview**:

Turn this setting on to enable the live preview feature, which shows a rendered preview of the Typst file as you edit it. The live preview will update in real time as you make changes to the source file. If this setting is turned off, the live preview will be disabled and you will only see the raw Typst code in the editor.

_Default_: On

---

**Live preview debounce delay**:

Set the debounce delay for the live preview in milliseconds. This is the amount of time that Typst for Obsidian will wait after you stop typing before it updates the live preview. Setting a higher debounce delay can help improve performance by reducing the number of times the live preview is updated.

_Default_: 500ms

### Syntax Highlighting

**Use theme text color**:

Turn this setting on to use the theme text color for the default text color in the editor.

_Default_: Off

---

**Custom syntax highlighting colors**:

Click the "Dark theme colors" or "Light theme colors" settings to open a dropdown where you can customize the syntax highlighting colors for the editor in dark and light mode, respectively. You can customize the colors for 28 different syntax categories, including keywords, strings, comments, etc., using the color pickers.

You can also import/export your custom syntax highlighting color configurations as JSON, using the two buttons next to the "Syntax highlighting" setting. This allows you to easily back up your custom color configurations, or to share them with others. The JSON format for the color configurations can be seen below. You can have both dark and light color schemes, or just one, by only including the "dark" or "light" property in the JSON.

_Default_: Default light and dark theme syntax highlighting colors are provided, which are designed to match the default Obsidian theme colors.

<details>
<summary>Default syntax highlighting colors:</summary>

```json
{
  "dark": {
    "defaultText": "#D4D4D4",
    "comments": "#858585",
    "keywords": "#ff5c8d",
    "strings": "#23d18b",
    "labelsAndReferences": "#ea7599",
    "escapeSequences": "#ffa7c4",
    "numbers": "#f48771",
    "booleans": "#ff5c8d",
    "symbols": "#ffa7c4",
    "functions": "#75beff",
    "types": "#b794f4",
    "variables": "#ea7599",
    "constants": "#ffa7c4",
    "operators": "#aeafad",
    "headings": "#ff5c8d",
    "bold": "#f48771",
    "italic": "#b794f4",
    "links": "#75beff",
    "mathText": "#D4D4D4",
    "mathOperators": "#cca700",
    "rawCode": "#23d18b",
    "codeLanguage": "#b794f4",
    "listMarkers": "#9b9ea4",
    "punctuation": "#9b9ea4",
    "separators": "#9b9ea4",
    "braces": "#9b9ea4",
    "metaExpressions": "#abb2bf",
    "generalPunctuation": "#585858"
  },
  "light": {
    "defaultText": "#222222",
    "comments": "#858585",
    "keywords": "#d6266e",
    "strings": "#1ba665",
    "labelsAndReferences": "#c94f72",
    "escapeSequences": "#d6266e",
    "numbers": "#c74f4f",
    "booleans": "#d6266e",
    "symbols": "#d6266e",
    "functions": "#4d9ed9",
    "types": "#8b5fc7",
    "variables": "#c94f72",
    "constants": "#d6266e",
    "operators": "#585858",
    "headings": "#d6266e",
    "bold": "#c74f4f",
    "italic": "#8b5fc7",
    "links": "#4d9ed9",
    "mathText": "#2c2638",
    "mathOperators": "#997a00",
    "rawCode": "#1ba665",
    "codeLanguage": "#8b5fc7",
    "listMarkers": "#585858",
    "punctuation": "#585858",
    "separators": "#585858",
    "braces": "#585858",
    "metaExpressions": "#444444",
    "generalPunctuation": "#858585"
  }
}
```

</details>

## Commands/Hotkeys

You can change the hotkeys for Typst for Obsidian commands in `Settings > Hotkeys`. Below is a list of the available commands.

**Create new Typst file**:

Open a modal to create a new `.typ` file in the current directory, or in a specified directory relative to the vault (e.g., `typst/docs/file.typ`).

**Export to PDF**:

Export the current `.typ` file to PDF. By default, the PDF will be saved in the same directory as the source file, with the same name but with a `.pdf` extension. This can be changed in the settings.

**Export PDF and open in split pane**:

Export the current `.typ` file to PDF and open the exported PDF in a split pane next to the source file.

**Open live preview in split pane**:

Open the live preview for the current `.typ` file in a split pane next to the source file.

**Toggle between source and reading mode**:

Toggle between source mode (the editor) and reading mode (the rendered preview) for the current `.typ` file.

**Insert snippet**:

Open a dropdown of custom snippets that you can insert at the current cursor position in the source editor.

## Development

## Future Plans
