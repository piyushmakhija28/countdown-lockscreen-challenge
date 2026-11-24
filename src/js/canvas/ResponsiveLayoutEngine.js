/**
 * Tri-Modal Responsive Layout Engine for Lockscreen Wallpaper Generation.
 * Computes non-overlapping spatial bounding boxes across mobile aspect ratios:
 * Ultra-Tall (R >= 2.15), Standard Portrait (1.70 <= R < 2.15), and Wide Foldables (R < 1.70).
 *
 * @module canvas/ResponsiveLayoutEngine
 */

/**
 * Geometric layout solver guaranteeing non-overlapping content boxes and safe margin clearances.
 */
export class ResponsiveLayoutEngine {
  /**
   * Calculates layout boxes with guaranteed non-overlapping bounds.
   *
   * @param {number} width Canvas width in pixels
   * @param {number} height Canvas height in pixels
   * @returns {{ regime: 'wide_foldable' | 'ultra_tall' | 'standard_portrait', ratio: number, canvasWidth: number, canvasHeight: number, topSafeY: number, bottomSafeY: number, heroBox: { x: number, y: number, width: number, height: number }, milestoneBox: { x: number, y: number, width: number, height: number }, ringRadius: number, ringCenter: { x: number, y: number }, fontSizeHero: number, fontSizeTitle: number, fontSizeMilestone: number }}
   */
  static computeLayout(width, height) {
    const validW = Math.max(1, width);
    const validH = Math.max(1, height);
    const ratio = validH / validW;

    if (ratio < 1.70) {
      // Regime 3: Wide Foldable Unfolded / Tablet (Dual-Column Split Layout)
      const topSafeY = validH * 0.14;
      const bottomSafeY = validH * 0.88;
      const availableH = bottomSafeY - topSafeY;
      const colWidth = validW * 0.43;

      const heroBox = {
        x: validW * 0.05,
        y: topSafeY,
        width: colWidth,
        height: availableH
      };

      const milestoneBox = {
        x: validW * 0.52,
        y: topSafeY,
        width: colWidth,
        height: availableH
      };

      const ringRadius = Math.min(colWidth * 0.36, availableH * 0.22);
      const ringCenter = {
        x: heroBox.x + heroBox.width / 2,
        y: heroBox.y + heroBox.height * 0.42
      };

      return {
        regime: 'wide_foldable',
        ratio,
        canvasWidth: validW,
        canvasHeight: validH,
        topSafeY,
        bottomSafeY,
        heroBox,
        milestoneBox,
        ringRadius,
        ringCenter,
        fontSizeHero: Math.round(validW * 0.042),
        fontSizeTitle: Math.round(validW * 0.024),
        fontSizeMilestone: Math.round(validW * 0.020)
      };
    }

    if (ratio >= 2.15) {
      // Regime 1: Ultra-Tall Phone / Foldable Cover Screen (21:9, 23.1:9)
      const topSafeY = validH * 0.22;
      const bottomSafeY = validH * 0.84;
      const availableH = bottomSafeY - topSafeY;
      const boxW = validW * 0.86;
      const heroH = availableH * 0.44;

      const heroBox = {
        x: validW * 0.07,
        y: topSafeY,
        width: boxW,
        height: heroH
      };

      const milestoneBox = {
        x: validW * 0.07,
        y: topSafeY + heroH + availableH * 0.02,
        width: boxW,
        height: availableH * 0.54
      };

      const ringRadius = Math.min(boxW * 0.30, heroH * 0.36);
      const ringCenter = {
        x: heroBox.x + heroBox.width / 2,
        y: heroBox.y + heroBox.height * 0.48
      };

      return {
        regime: 'ultra_tall',
        ratio,
        canvasWidth: validW,
        canvasHeight: validH,
        topSafeY,
        bottomSafeY,
        heroBox,
        milestoneBox,
        ringRadius,
        ringCenter,
        fontSizeHero: Math.round(validW * 0.082),
        fontSizeTitle: Math.round(validW * 0.040),
        fontSizeMilestone: Math.round(validW * 0.036)
      };
    }

    // Regime 2: Standard Flagship Smartphone Portrait (19.5:9, 20:9, iPhone 13-16, Pixel, Galaxy)
    const topSafeY = validH * 0.28;
    const bottomSafeY = validH * 0.82;
    const availableH = bottomSafeY - topSafeY;
    const boxW = validW * 0.88;
    const heroH = availableH * 0.42;

    const heroBox = {
      x: validW * 0.06,
      y: topSafeY,
      width: boxW,
      height: heroH
    };

    const milestoneBox = {
      x: validW * 0.06,
      y: topSafeY + heroH + availableH * 0.02,
      width: boxW,
      height: availableH * 0.56
    };

    const ringRadius = Math.min(boxW * 0.32, heroH * 0.38);
    const ringCenter = {
      x: heroBox.x + heroBox.width / 2,
      y: heroBox.y + heroBox.height * 0.50
    };

    return {
      regime: 'standard_portrait',
      ratio,
      canvasWidth: validW,
      canvasHeight: validH,
      topSafeY,
      bottomSafeY,
      heroBox,
      milestoneBox,
      ringRadius,
      ringCenter,
      fontSizeHero: Math.round(validW * 0.090),
      fontSizeTitle: Math.round(validW * 0.042),
      fontSizeMilestone: Math.round(validW * 0.038)
    };
  }
}
