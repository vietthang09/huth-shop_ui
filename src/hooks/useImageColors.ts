"use client";

import { useEffect, useState } from "react";

interface ImageColors {
  fromColor: string;
  toColor: string;
  error: boolean;
}

const defaultColors = {
  fromColor: "black",
  toColor: "bg-red-500",
  error: false,
};

export const useImageColors = (imageUrl: string): ImageColors => {
  const [colors, setColors] = useState<ImageColors>(defaultColors);

  useEffect(() => {
    const extractColors = async () => {
      try {
        const img = new Image();

        // Ensure compatibility with cross-origin images
        img.crossOrigin = "Anonymous";

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              setColors(defaultColors);
              return;
            }

            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image to canvas
            ctx.drawImage(img, 0, 0);

            // Get pixel data for top-left corner
            let topLeftPixel = ctx.getImageData(0, 0, 1, 1).data;
            let fromColor = `rgb(${topLeftPixel[0]}, ${topLeftPixel[1]}, ${topLeftPixel[2]})`;

            // Get pixel data for bottom-right corner
            let bottomRightPixel = ctx.getImageData(img.width - 1, img.height - 1, 1, 1).data;
            let toColor = `rgb(${bottomRightPixel[0]}, ${bottomRightPixel[1]}, ${bottomRightPixel[2]})`;

            // Check if colors are white and find darkest alternatives
            if (isWhite(topLeftPixel)) {
              topLeftPixel = findDarkestColor(ctx, img.width, img.height);
              fromColor = `rgb(${topLeftPixel[0]}, ${topLeftPixel[1]}, ${topLeftPixel[2]})`;
            }

            if (isWhite(bottomRightPixel)) {
              bottomRightPixel = findDarkestColor(ctx, img.width, img.height);
              toColor = `rgb(${bottomRightPixel[0]}, ${bottomRightPixel[1]}, ${bottomRightPixel[2]})`;
            }

            setColors({
              fromColor,
              toColor,
              error: false,
            });
          } catch (error) {
            setColors(defaultColors);
          }
        };

        img.onerror = () => {
          setColors(defaultColors);
        };

        // Ensure the image is fully loaded before processing
        img.src = imageUrl + (imageUrl.includes("?") ? "&" : "?") + "cache-buster=" + new Date().getTime();
      } catch (error) {
        setColors(defaultColors);
      }
    };

    if (imageUrl) {
      extractColors();
    }
  }, [imageUrl]);

  return colors;
};

// Helper function to check if a color is white
function isWhite(color: Uint8ClampedArray): boolean {
  return color[0] > 240 && color[1] > 240 && color[2] > 240;
}

// Helper function to find the darkest color in the image
function findDarkestColor(ctx: CanvasRenderingContext2D, width: number, height: number): Uint8ClampedArray {
  const imageData = ctx.getImageData(0, 0, width, height).data;
  let darkestColor = new Uint8ClampedArray([255, 255, 255, 255]); // Start with white
  let darkestBrightness = Infinity;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const brightness = calculateBrightness([r, g, b]);

    if (brightness < darkestBrightness) {
      darkestBrightness = brightness;
      darkestColor = new Uint8ClampedArray([r, g, b, 255]);
    }
  }

  return darkestColor;
}

// Helper function to calculate brightness of a color
function calculateBrightness(color: number[]): number {
  return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
}

// Helper function to check if colors are too similar
function isColorTooSimilar(color1: number[], color2: number[]): boolean {
  const threshold = 30; // RGB distance threshold
  const distance = Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2)
  );
  return distance < threshold;
}
