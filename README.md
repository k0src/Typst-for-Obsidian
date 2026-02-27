# Typst for Obsidian

Typst for Obsidian is a [Typst](https://typst.app) editor integrated directly into [Obsidian](https://obsidian.md), enabling you to create and preview Typst documents seamlessly within your notes. Create `.typ` files, edit with syntax highlighting, and render PDFs that adapt to your Obsidian theme.

<p align="center">
  <img src="assets/tfo-ss.png" width="700">
</p>

## Features

- Open `.typ` files in Obsidian
- VSCode-Like editor with Typst syntax highlighting
- Customizable syntax highlighting colors for dark and light themes
- Toggle between source and PDF preview modes
- PDF export to vault
- Theme integration - rendered PDFs adapt to Obsidian themes
- Template variables for dynamic theming (`%THEMECOLOR%`, `%FONTSIZE%`, etc.)
- Package support - use local packages from data directory or auto-download from preview namespace
- System font support (desktop only)

![Screenshot](assets/tfo-full-screen.png)

## Usage

1. Create a new `.typ` file or open an existing one
2. Edit in source mode with syntax highlighting
3. Click the preview icon to render PDF
4. Click the export icon to save PDF to vault

### Template Variables

Use these variables in your Typst documents to match Obsidian themes:

```typst
#set text(fill: rgb("#%THEMECOLOR%"), size: %FONTSIZE%)
#set page(fill: rgb("#%BGCOLOR%"), width: %LINEWIDTH%)
```

Available variables:

- `%THEMECOLOR%` - Primary text color
- `%FONTSIZE%` - Text size in pt
- `%BGCOLOR%` - Background color
- `%LINEWIDTH%` - Page width
- `%ACCENTCOLOR%`, `%FAINTCOLOR%`, `%MUTEDCOLOR%`
- `%BGPRIMARY%`, `%BGPRIMARYALT%`, `%BGSECONDARY%`, `%BGSECONDARYALT%`
- `%SUCCESSCOLOR%`, `%WARNINGCOLOR%`, `%ERRORCOLOR%`
- `%FONTTEXT%`, `%FONTMONO%`, `%HEADINGCOLOR%`

### Custom Layout Functions

Configure default page layouts in settings:

- **Default Layout Functions** - Applied to all internal previews
- **PDF Export Layout Functions** - Applied only when exporting PDFs

### Custom Snippets

You can add custom Typst snippets as JSON for autocomplete in settings. Each snippet has a prefix (trigger) and body (lines to insert). Use `$1`, `$2`, etc., for tab stops.

Example (inserting a table aligned to the center):

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

## Settings

- **Default Mode** - Open files in source or reading mode
- **Auto-download Packages** - Automatically fetch packages from Typst registry
- **Font Families** - System fonts to load (desktop only)
- **Layout Functions** - Custom Typst preambles for formatting
- **Enable Text Layer** - Enable text selection in PDF preview. Disabling this setting may improve performance
- **Custom Snippets** - Add custom Typst snippets for autocomplete
- **Syntax Highlighting** - Customize colors for 28 different syntax categories, separately for dark and light themes. Import/export color configurations as JSON

## Commands

- **Create new Typst file** - Create `.typ` file at specified path
- **Toggle source/reading mode** - Switch between editing and preview
- **Export to PDF** - Export current document to PDF file
- **Toggle bold** - Wrap selection with `*text*`
- **Toggle italic** - Wrap selection with `_text_`
- **Toggle underline** - Wrap selection with `#underline[text]`
- **Increase heading level** - Add one `=` to heading (max 6 levels)
- **Decrease heading level** - Remove one `=` from heading (min 2 levels)

> [!NOTE]
>
> Since Obsidian doesn't let you use the same hotkeys for different views, to use `Ctrl+B` and `Ctrl+I` in both Typst files and Markdown files, unbind the default bold and italic hotkeys, and bind `Toggle bold` and `Toggle italic` to `Ctrl+B` and `Ctrl+I`. It will work for both Typst files and Markdown files. Alternatively, you can just use two different hotkeys.

## Official Template

You can use the [official template](https://github.com/k0src/Typsidian) designed for Typst in Obsidian. It includes support for light/dark modes, titles, headers, and useful functions for displaying notes.

<p align="center">
  <img src="assets/tfo-template.png" width="700">
</p>

To get started, import the template at the top of your Typst file:

```typst
#import "@preview/typsidian:0.0.2": *;

#show: typsidian.with(
  theme: "dark",
  title: "My Document",
  course: "CS4999",
  standalone: false
)
```

This template is an Obsidian-like theme for Typst, with support for light/dark modes, titles, headers, and some useful functions for displaying notes.

When using this template, I recommend setting the custom layout function in the settings to:

```typst
#set page(
  width: %LINEWIDTH%,
  height: auto,
  margin: (x: 0.25em, y: 0.25em),
  fill: rgb("%BGCOLOR%")
)
```

Make sure to set `standalone: false`. This will prevent the template from adding its own page layout. Additionally, make sure you have the required fonts installed and added to the font families in settings:

- [Inter 24pt](https://fonts.google.com/specimen/Inter)
- [GeistMono NFP](https://github.com/ryanoasis/nerd-fonts/releases/)
- [Fira Math](https://github.com/firamath/firamath/releases/)

## Installation

1. Download the latest release from the [Releases](https://github.com/k0src/Typst-for-Obsidian/releases) page
2. Extract `main.js`, `manifest.json`, `styles.css`, and `obsidian_typst_bg.wasm` to your Obsidian plugins folder (`.obsidian/plugins/typst-for-obsidian`)
3. Enable the plugin in Obsidian settings

## Contributing

Feel free to open issues or submit pull requests for bug fixes and new features.

### Development

1. Since the plugin uses a Rust WebAssembly module for the Typst compiler, you'll need to have Rust and `wasm-pack` installed.
2. Clone the repository and navigate to the project directory.
3. Install the necessary npm packages and build the WebAssembly module:

```bash
npm install
cd compiler
cargo build --release
wasm-pack build --target web --out-dir ../pkg
cd ..
npm run build
```

4. Create a folder for the plugin in your Obsidian vault's plugins directory: `.obsidian/plugins/typst-for-obsidian`.
5. Copy the built files (`main.js`, `manifest.json`, `styles.css`, and the `pkg` folder) to the plugin folder you created.
6. Restart Obsidian and enable the plugin in settings.

For easier deployment during development:

1. Install the [Hot Reload](https://github.com/pjeby/hot-reload) plugin and create a `.hotreload` file in the root directory of the plugin in your vault.
2. Create a `.env` file in the root directory of the repo with the following content:

```
SOURCE_DIR="path/to/the/source/directory"
TARGET_DIR="path/to/your-vault/.obsidian/plugins/typst-for-obsidian"
```

3. Run the build script to copy files to your Obsidian plugins folder:

```bash
npm run build:deploy
```

## Future Plans/Issues to Fix

- [ ] **Improve performance of PDF rendering**
- [x] Add "New Typst File" to context menu
- [x] Turn off live preview button when live preview is disabled
- [x] Open live preview in split pane hotkey
- [ ] Open PDF in split pane button + hotkey
- [ ] Auto-export PDF on...
- [ ] Fix color picker showing up for some `#` function calls
- [ ] Fix problems show up on wrong side of split pane
- [ ] Fix pasting
- [ ] Open in external editor
- [ ] Formatter for Typst code
- [ ] Tinymist LSP support
- [ ] Add support for jumping from preview/PDF to source by clicking on text
- [ ] Add backlink support in PDF preview
- [ ] Support for more template variables
- [ ] Improve error handling and reporting
- [ ] Support Typst packages that use WebAssembly modules

## Known Issues

- Packages that import WebAssembly modules (like CeTZ) don't work
- Scroll position restoration when toggling modes is jittery

## Credits

Compiler implementation inspired by [fenjalien/obsidian-typst](https://github.com/fenjalien/obsidian-typst).

[Tinymist TextMate grammar](https://github.com/Myriad-Dreamin/tinymist/tree/main/syntaxes/textmate)

## License

MIT
