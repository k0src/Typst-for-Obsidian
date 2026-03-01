type VarType = "color" | "raw" | "font-size" | "line-width";

interface TemplateVarDef {
  css: string | string[];
  type: VarType;
  fallback: string;
}

// prettier-ignore
const VARS: Record<string, TemplateVarDef> = {
  // Typography
  "FONTTEXT":       { css: "--font-text-theme",  type: "raw",       fallback: "sans-serif" },
  "FONTMONO":       { css: "--font-monospace",    type: "raw",       fallback: "monospace" },
  "FONTSIZE":       { css: "--font-text-size",    type: "font-size", fallback: "16pt" },
  "FONTSIZE-XXS":   { css: "--font-smallest",     type: "raw",       fallback: "0.8em" },
  "FONTSIZE-XS":    { css: "--font-smaller",      type: "raw",       fallback: "0.875em" },
  "FONTSIZE-S":     { css: "--font-small",        type: "raw",       fallback: "0.933em" },
  "HEADINGSIZE-1":  { css: "--h1-size",           type: "raw",       fallback: "2em" },
  "HEADINGSIZE-2":  { css: "--h2-size",           type: "raw",       fallback: "1.6em" },
  "HEADINGSIZE-3":  { css: "--h3-size",           type: "raw",       fallback: "1.37em" },
  "HEADINGSIZE-4":  { css: "--h4-size",           type: "raw",       fallback: "1.25em" },
  "HEADINGSIZE-5":  { css: "--h5-size",           type: "raw",       fallback: "1.12em" },
  "HEADINGSIZE-6":  { css: "--h6-size",           type: "raw",       fallback: "1.12em" },

  // Spacing
  "SIZE-2-1":   { css: "--size-2-1",  type: "raw", fallback: "2px" },
  "SIZE-2-2":   { css: "--size-2-2",  type: "raw", fallback: "4px" },
  "SIZE-2-3":   { css: "--size-2-3",  type: "raw", fallback: "6px" },
  "SIZE-4-1":   { css: "--size-4-1",  type: "raw", fallback: "4px" },
  "SIZE-4-2":   { css: "--size-4-2",  type: "raw", fallback: "8px" },
  "SIZE-4-3":   { css: "--size-4-3",  type: "raw", fallback: "12px" },
  "SIZE-4-4":   { css: "--size-4-4",  type: "raw", fallback: "16px" },
  "SIZE-4-5":   { css: "--size-4-5",  type: "raw", fallback: "20px" },
  "SIZE-4-6":   { css: "--size-4-6",  type: "raw", fallback: "24px" },
  "SIZE-4-8":   { css: "--size-4-8",  type: "raw", fallback: "32px" },
  "SIZE-4-9":   { css: "--size-4-9",  type: "raw", fallback: "36px" },
  "SIZE-4-12":  { css: "--size-4-12", type: "raw", fallback: "48px" },
  "SIZE-4-16":  { css: "--size-4-16", type: "raw", fallback: "64px" },
  "SIZE-4-18":  { css: "--size-4-18", type: "raw", fallback: "72px" },

  // Layout
  "LINEWIDTH":   { css: "--file-line-width", type: "line-width", fallback: "525pt" },
  "FILEMARGINS": { css: "--file-margins",    type: "raw",        fallback: "0" },

  // Icons
  "ICONSTROKE":  { css: "--icon-stroke", type: "raw",   fallback: "1.75px" },
  "ICONCOLOR":   { css: "--icon-color",  type: "color", fallback: "ffffff" },
  "ICONSIZE-XS": { css: "--icon-xs",     type: "raw",   fallback: "14px" },
  "ICONSIZE-S":  { css: "--icon-s",      type: "raw",   fallback: "16px" },
  "ICONSIZE-M":  { css: "--icon-m",      type: "raw",   fallback: "18px" },
  "ICONSIZE-L":  { css: "--icon-l",      type: "raw",   fallback: "18px" },
  "ICONSIZE-XL": { css: "--icon-xl",     type: "raw",   fallback: "32px" },

  // Colors
  "TEXTCOLOR":    { css: "--text-normal",       type: "color", fallback: "ffffff" },
  "BGCOLOR":      { css: "--background-primary", type: "color", fallback: "ffffff" },
  "ACCENTCOLOR":  { css: "--text-accent",       type: "color", fallback: "8A5CF5" },
  "FAINTCOLOR":   { css: "--text-faint",        type: "color", fallback: "888888" },
  "MUTEDCOLOR":   { css: "--text-muted",        type: "color", fallback: "999999" },

  // Base colors
  "BASECOLOR-00":  { css: "--color-base-00",  type: "color", fallback: "ffffff" },
  "BASECOLOR-05":  { css: "--color-base-05",  type: "color", fallback: "f5f5f5" },
  "BASECOLOR-10":  { css: "--color-base-10",  type: "color", fallback: "eeeeee" },
  "BASECOLOR-20":  { css: "--color-base-20",  type: "color", fallback: "e0e0e0" },
  "BASECOLOR-25":  { css: "--color-base-25",  type: "color", fallback: "d4d4d4" },
  "BASECOLOR-30":  { css: "--color-base-30",  type: "color", fallback: "c8c8c8" },
  "BASECOLOR-35":  { css: "--color-base-35",  type: "color", fallback: "bababa" },
  "BASECOLOR-40":  { css: "--color-base-40",  type: "color", fallback: "acacac" },
  "BASECOLOR-50":  { css: "--color-base-50",  type: "color", fallback: "909090" },
  "BASECOLOR-60":  { css: "--color-base-60",  type: "color", fallback: "757575" },
  "BASECOLOR-70":  { css: "--color-base-70",  type: "color", fallback: "5c5c5c" },
  "BASECOLOR-100": { css: "--color-base-100", type: "color", fallback: "222222" },

  // Extended colors
  "COLOR-RED":    { css: "--color-red",    type: "color", fallback: "e93147" },
  "COLOR-ORANGE": { css: "--color-orange", type: "color", fallback: "ec7500" },
  "COLOR-YELLOW": { css: "--color-yellow", type: "color", fallback: "e0ac00" },
  "COLOR-GREEN":  { css: "--color-green",  type: "color", fallback: "08b94e" },
  "COLOR-CYAN":   { css: "--color-cyan",   type: "color", fallback: "00bfbc" },
  "COLOR-BLUE":   { css: "--color-blue",   type: "color", fallback: "086ddd" },
  "COLOR-PURPLE": { css: "--color-purple", type: "color", fallback: "7852ee" },
  "COLOR-PINK":   { css: "--color-pink",   type: "color", fallback: "d53984" },

  // Backgrounds
  "BORDERCOLOR":          { css: "--background-modifier-border", type: "color", fallback: "e0e0e0" },
  "BGCOLOR-ALT":          { css: "--background-primary-alt",     type: "color", fallback: "f5f5f5" },
  "BGCOLOR-SECONDARY":    { css: "--background-secondary",       type: "color", fallback: "f0f0f0" },
  "BGCOLOR-SECONDARY-ALT": { css: "--background-secondary-alt", type: "color", fallback: "e8e8e8" },

  // Status colors
  "TEXTCOLOR-SUCCESS": { css: "--text-success", type: "color", fallback: "00ff00" },
  "TEXTCOLOR-WARNING": { css: "--text-warning", type: "color", fallback: "ffaa00" },
  "TEXTCOLOR-ERROR":   { css: "--text-error",   type: "color", fallback: "ff0000" },

  // Heading colors
  "HEADINGCOLOR-1": { css: ["--h1-color", "--text-normal"], type: "color", fallback: "ffffff" },
  "HEADINGCOLOR-2": { css: ["--h2-color", "--text-normal"], type: "color", fallback: "ffffff" },
  "HEADINGCOLOR-3": { css: ["--h3-color", "--text-normal"], type: "color", fallback: "ffffff" },
  "HEADINGCOLOR-4": { css: ["--h4-color", "--text-normal"], type: "color", fallback: "ffffff" },
  "HEADINGCOLOR-5": { css: ["--h5-color", "--text-normal"], type: "color", fallback: "ffffff" },
  "HEADINGCOLOR-6": { css: ["--h6-color", "--text-normal"], type: "color", fallback: "ffffff" },

  // Code & links
  "CODEBGCOLOR":   { css: "--code-background",  type: "color", fallback: "f5f5f5" },
  "CODECOLOR":     { css: "--code-normal",       type: "color", fallback: "e96900" },
  "LINKCOLOR":     { css: "--link-color",        type: "color", fallback: "086ddd" },
  "TABLEBGCOLOR":  { css: "--table-background",  type: "color", fallback: "ffffff" },
};

const REPLACE_REGEX = /%([A-Z0-9-]+)%/g;

export class TemplateVariableProvider {
  replaceVariables(source: string): string {
    const style = getComputedStyle(document.body);

    return source.replace(REPLACE_REGEX, (match, name: string) => {
      const def = VARS[name];
      if (!def) return match;

      const cssVars = Array.isArray(def.css) ? def.css : [def.css];
      let raw = "";
      for (const v of cssVars) {
        raw = style.getPropertyValue(v).trim();
        if (raw) break;
      }

      if (!raw) return def.fallback;

      switch (def.type) {
        case "color":
          return cssColorToHex(raw);
        case "font-size":
          return `${parseFloat(raw) * 0.75}pt`;
        case "line-width":
          return `${parseFloat(raw) / 1.5}pt`;
        case "raw":
          return raw;
      }
    });
  }
}

function cssColorToHex(color: string): string {
  if (color.startsWith("#")) {
    return color.slice(1);
  }

  const rgbMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/,
  );
  if (rgbMatch) {
    return (
      toHex(parseInt(rgbMatch[1])) +
      toHex(parseInt(rgbMatch[2])) +
      toHex(parseInt(rgbMatch[3]))
    );
  }

  const hslMatch = color.match(
    /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/,
  );
  if (hslMatch) {
    return hslToHex(
      parseInt(hslMatch[1]) / 360,
      parseInt(hslMatch[2]) / 100,
      parseInt(hslMatch[3]) / 100,
    );
  }

  try {
    const el = document.createElement("div");
    el.style.color = color;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    return cssColorToHex(computed);
  } catch {
    return "ffffff";
  }
}

function toHex(n: number): string {
  const hex = n.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function hslToHex(h: number, s: number, l: number): string {
  if (s === 0) {
    const v = toHex(Math.round(l * 255));
    return v + v + v;
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueToRgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return (
    toHex(Math.round(hueToRgb(h + 1 / 3) * 255)) +
    toHex(Math.round(hueToRgb(h) * 255)) +
    toHex(Math.round(hueToRgb(h - 1 / 3) * 255))
  );
}
