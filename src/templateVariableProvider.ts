export class TemplateVariableProvider {
  replaceVariables(source: string): string {
    return source
      .replace(/%THEMECOLOR%/g, this.getThemeTextColor())
      .replace(/%FONTSIZE%/g, this.getCssFontSize())
      .replace(/%BGCOLOR%/g, this.getThemeBGColor())
      .replace(/%FONTTEXT%/g, this.getFontText())
      .replace(/%FONTMONOSPACE%/g, this.getFontMonospace())
      .replace(/%LINEWIDTH%/g, this.getFileLineWidth())
      .replace(/%ACCENTCOLOR%/g, this.getAccentColor())
      .replace(/%FAINTCOLOR%/g, this.getFaintColor())
      .replace(/%MUTEDCOLOR%/g, this.getMutedColor())
      .replace(/%BGPRIMARY%/g, this.getBackgroundPrimary())
      .replace(/%BGPRIMARYALT%/g, this.getBackgroundPrimaryAlt())
      .replace(/%BGSECONDARY%/g, this.getBackgroundSecondary())
      .replace(/%BGSECONDARYALT%/g, this.getBackgroundSecondaryAlt())
      .replace(/%SUCCESSCOLOR%/g, this.getSuccessColor())
      .replace(/%WARNINGCOLOR%/g, this.getWarningColor())
      .replace(/%ERRORCOLOR%/g, this.getErrorColor())
      .replace(/%HEADINGCOLOR%/g, this.getHeadingColor());
  }

  private cssColorToHex(color: string): string {
    if (color.startsWith("#")) {
      return color.slice(1);
    }

    const rgbMatch = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/,
    );
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);

      const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };

      return toHex(r) + toHex(g) + toHex(b);
    }

    const hslMatch = color.match(
      /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/,
    );
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360;
      const s = parseInt(hslMatch[2]) / 100;
      const l = parseInt(hslMatch[3]) / 100;

      const hslToRgb = (h: number, s: number, l: number) => {
        let r, g, b;

        if (s === 0) {
          r = g = b = l;
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };

          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        const toHex = (x: number) => {
          const hex = Math.round(x * 255).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };

        return toHex(r) + toHex(g) + toHex(b);
      };

      return hslToRgb(h, s, l);
    }

    try {
      const tempEl = document.createElement("div");
      tempEl.style.color = color;
      document.body.appendChild(tempEl);
      const computed = getComputedStyle(tempEl).color;
      document.body.removeChild(tempEl);

      return this.cssColorToHex(computed);
    } catch (e) {
      console.warn("Failed to convert color:", color, e);
      return "ffffff";
    }
  }

  private getCssVariable(
    variableName: string,
    fallback: string = "000000",
  ): string {
    const bodyStyle = getComputedStyle(document.body);
    const value = bodyStyle.getPropertyValue(variableName).trim();

    if (value) {
      if (
        variableName.includes("color") ||
        variableName.includes("background") ||
        variableName.includes("text-")
      ) {
        return this.cssColorToHex(value);
      }
      return value;
    }

    return fallback;
  }

  private getThemeTextColor(): string {
    const bodyStyle = getComputedStyle(document.body);
    const textColor = bodyStyle.getPropertyValue("--text-normal").trim();

    if (textColor) {
      return this.cssColorToHex(textColor);
    }

    return "ffffff";
  }

  private getCssFontSize(): string {
    const bodyStyle = getComputedStyle(document.body);
    const fontSize = bodyStyle.getPropertyValue("--font-text-size").trim();

    if (fontSize) {
      const pxValue = parseFloat(fontSize.replace("px", ""));
      const ptValue = pxValue * 0.75;
      return `${ptValue}pt`;
    }

    return "16pt";
  }

  private getThemeBGColor(): string {
    const bodyStyle = getComputedStyle(document.body);
    const bgColor = bodyStyle.getPropertyValue("--background-primary").trim();

    if (bgColor) {
      return this.cssColorToHex(bgColor);
    }

    return "ffffff";
  }

  private getFileLineWidth(): string {
    const bodyStyle = getComputedStyle(document.body);
    const fileLineWidth = bodyStyle
      .getPropertyValue("--file-line-width")
      .trim();
    if (fileLineWidth) {
      const pxValue = parseFloat(fileLineWidth.replace("px", ""));
      const ptValue = pxValue / 1.5;
      return `${ptValue}pt`;
    }
    return "525pt";
  }

  private getAccentColor(): string {
    return this.getCssVariable("--text-accent", "ffffff");
  }

  private getFaintColor(): string {
    return this.getCssVariable("--text-faint", "888888");
  }

  private getMutedColor(): string {
    return this.getCssVariable("--text-muted", "999999");
  }

  private getBackgroundPrimary(): string {
    return this.getCssVariable("--background-primary", "ffffff");
  }

  private getBackgroundPrimaryAlt(): string {
    return this.getCssVariable("--background-primary-alt", "f5f5f5");
  }

  private getBackgroundSecondary(): string {
    return this.getCssVariable("--background-secondary", "f0f0f0");
  }

  private getBackgroundSecondaryAlt(): string {
    return this.getCssVariable("--background-secondary-alt", "e8e8e8");
  }

  private getSuccessColor(): string {
    return this.getCssVariable("--text-success", "00ff00");
  }

  private getWarningColor(): string {
    return this.getCssVariable("--text-warning", "ffaa00");
  }

  private getErrorColor(): string {
    return this.getCssVariable("--text-error", "ff0000");
  }

  private getFontText(): string {
    const bodyStyle = getComputedStyle(document.body);
    const fontText = bodyStyle.getPropertyValue("--font-text").trim();
    return fontText || "sans-serif";
  }

  private getFontMonospace(): string {
    const bodyStyle = getComputedStyle(document.body);
    const fontMono = bodyStyle.getPropertyValue("--font-monospace").trim();
    return fontMono || "monospace";
  }

  private getHeadingColor(): string {
    const bodyStyle = getComputedStyle(document.body);
    const headingColor =
      bodyStyle.getPropertyValue("--text-heading").trim() ||
      bodyStyle.getPropertyValue("--text-normal").trim();

    if (headingColor) {
      return this.cssColorToHex(headingColor);
    }

    return this.getThemeTextColor();
  }
}
