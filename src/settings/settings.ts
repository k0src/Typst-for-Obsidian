export interface SyntaxHighlightColors {
  dark: {
    defaultText: string;
    comments: string;
    keywords: string;
    strings: string;
    labelsAndReferences: string;
    escapeSequences: string;
    numbers: string;
    booleans: string;
    symbols: string;
    functions: string;
    types: string;
    variables: string;
    constants: string;
    operators: string;
    headings: string;
    bold: string;
    italic: string;
    links: string;
    mathText: string;
    mathOperators: string;
    rawCode: string;
    codeLanguage: string;
    listMarkers: string;
    punctuation: string;
    separators: string;
    braces: string;
    metaExpressions: string;
    generalPunctuation: string;
  };
  light: {
    defaultText: string;
    comments: string;
    keywords: string;
    strings: string;
    labelsAndReferences: string;
    escapeSequences: string;
    numbers: string;
    booleans: string;
    symbols: string;
    functions: string;
    types: string;
    variables: string;
    constants: string;
    operators: string;
    headings: string;
    bold: string;
    italic: string;
    links: string;
    mathText: string;
    mathOperators: string;
    rawCode: string;
    codeLanguage: string;
    listMarkers: string;
    punctuation: string;
    separators: string;
    braces: string;
    metaExpressions: string;
    generalPunctuation: string;
  };
}

export interface TypstSettings {
  defaultMode: "source" | "reading";
  useDefaultLayoutFunctions: boolean;
  customLayoutFunctions: string;
  usePdfLayoutFunctions: boolean;
  pdfLayoutFunctions: string;
  autoDownloadPackages: boolean;
  fontFamilies: string[];
  enableTextLayer: boolean;
  suppressPdfExportNotice: boolean;
  pdfExportPath: string;
  openPdfOnExport: boolean;
  enableLivePreview: boolean;
  livePreviewDebounce: number;
  customSnippets: string;
  syntaxHighlightColors: SyntaxHighlightColors;
  useObsidianTextColor: boolean;
  useObsidianMonospaceFont: boolean;
  editorHotkeys: Record<string, string>;
}

export const DEFAULT_SETTINGS: TypstSettings = {
  defaultMode: "source",
  useDefaultLayoutFunctions: true,
  usePdfLayoutFunctions: false,
  autoDownloadPackages: true,
  fontFamilies: [],
  pdfLayoutFunctions: "",
  enableTextLayer: true,
  suppressPdfExportNotice: false,
  pdfExportPath: "",
  openPdfOnExport: false,
  enableLivePreview: true,
  livePreviewDebounce: 500,
  useObsidianTextColor: false,
  useObsidianMonospaceFont: true,
  editorHotkeys: {},
  syntaxHighlightColors: {
    dark: {
      defaultText: "#D4D4D4",
      comments: "#858585",
      keywords: "#ff5c8d",
      strings: "#23d18b",
      labelsAndReferences: "#ea7599",
      escapeSequences: "#ffa7c4",
      numbers: "#f48771",
      booleans: "#ff5c8d",
      symbols: "#ffa7c4",
      functions: "#75beff",
      types: "#b794f4",
      variables: "#ea7599",
      constants: "#ffa7c4",
      operators: "#aeafad",
      headings: "#ff5c8d",
      bold: "#f48771",
      italic: "#b794f4",
      links: "#75beff",
      mathText: "#D4D4D4",
      mathOperators: "#cca700",
      rawCode: "#23d18b",
      codeLanguage: "#b794f4",
      listMarkers: "#9b9ea4",
      punctuation: "#9b9ea4",
      separators: "#9b9ea4",
      braces: "#9b9ea4",
      metaExpressions: "#abb2bf",
      generalPunctuation: "#585858",
    },
    light: {
      defaultText: "#222222",
      comments: "#858585",
      keywords: "#d6266e",
      strings: "#1ba665",
      labelsAndReferences: "#c94f72",
      escapeSequences: "#d6266e",
      numbers: "#c74f4f",
      booleans: "#d6266e",
      symbols: "#d6266e",
      functions: "#4d9ed9",
      types: "#8b5fc7",
      variables: "#c94f72",
      constants: "#d6266e",
      operators: "#585858",
      headings: "#d6266e",
      bold: "#c74f4f",
      italic: "#8b5fc7",
      links: "#4d9ed9",
      mathText: "#2c2638",
      mathOperators: "#997a00",
      rawCode: "#1ba665",
      codeLanguage: "#8b5fc7",
      listMarkers: "#585858",
      punctuation: "#585858",
      separators: "#585858",
      braces: "#585858",
      metaExpressions: "#444444",
      generalPunctuation: "#858585",
    },
  },
  customSnippets: JSON.stringify(
    {
      table: {
        prefix: "tbl",
        body: [
          "#align(center,",
          "\ttable(",
          "\t\tcolumns: $1,",
          "\t\t[$2],",
          "\t)",
          ")",
        ],
      },
    },
    null,
    2,
  ),
  // prettier-ignore
  customLayoutFunctions: 
`#set page(
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
// #show math.equation: set box(stroke: none)`,
};
