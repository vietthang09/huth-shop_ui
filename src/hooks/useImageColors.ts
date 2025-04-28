"use client";

import { useEffect, useState } from "react";

interface ImageColors {
  fromColor: string;
  toColor: string;
  error: boolean;
}

const defaultColors = {
  fromColor: "black",
  toColor: "red-500",
  error: false,
};

export const useImageColors = (imageUrl: string): ImageColors => {
  const [colors, setColors] = useState<ImageColors>(defaultColors);

  useEffect(() => {
    const extractColors = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setColors(defaultColors);
            return;
          }

          // Set canvas size - can be smaller than image for performance
          const canvasWidth = Math.min(100, img.width);
          const canvasHeight = Math.min(100, img.height);
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          // Draw image scaled down to canvas size
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

          // Get all pixel data
          const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

          // Create buckets for colors to find dominant ones
          const colorMap: Record<string, number> = {};

          // Sample pixels at regular intervals for better performance
          const sampleSize = 10; // Only process every 10th pixel
          for (let i = 0; i < imageData.length; i += 4 * sampleSize) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];

            // Skip nearly white or black pixels
            if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
              continue;
            }

            // Create a simplified color key (reduce precision for better grouping)
            const key = `${Math.floor(r / 10) * 10},${Math.floor(g / 10) * 10},${Math.floor(b / 10) * 10}`;

            if (colorMap[key]) {
              colorMap[key]++;
            } else {
              colorMap[key] = 1;
            }
          }

          // Sort colors by frequency
          const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .map((entry) => entry[0].split(",").map(Number));

          if (sortedColors.length < 2) {
            setColors(defaultColors);
            return;
          }

          // Get the most frequent and second most frequent distinct colors
          const topColor = `rgb(${sortedColors[0][0]}, ${sortedColors[0][1]}, ${sortedColors[0][2]})`;

          // Find a distinct second color (with some distance from the first)
          let secondColorIndex = 1;
          while (
            secondColorIndex < sortedColors.length &&
            isColorTooSimilar(sortedColors[0], sortedColors[secondColorIndex])
          ) {
            secondColorIndex++;
          }

          // If we couldn't find a distinct second color, just use the next most common
          if (secondColorIndex >= sortedColors.length) {
            secondColorIndex = 1;
          }

          const secondColor =
            secondColorIndex < sortedColors.length
              ? `rgb(${sortedColors[secondColorIndex][0]}, ${sortedColors[secondColorIndex][1]}, ${sortedColors[secondColorIndex][2]})`
              : `rgb(${sortedColors[0][0] / 2}, ${sortedColors[0][1] / 2}, ${sortedColors[0][2] / 2})`;

          setColors({
            fromColor: topColor,
            toColor: secondColor,
            error: false,
          });
        };

        img.onerror = () => {
          setColors(defaultColors);
        };

        img.src = imageUrl;
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

// Helper function to check if colors are too similar
function isColorTooSimilar(color1: number[], color2: number[]): boolean {
  const threshold = 30; // RGB distance threshold
  const distance = Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2)
  );
  return distance < threshold;
}
