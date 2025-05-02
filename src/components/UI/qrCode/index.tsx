"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling, { Options as QRCodeStylingOptions } from "qr-code-styling";

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  logoUrl?: string;
  logoSize?: number;
}

export const QRCode = ({
  value,
  size = 200,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  logoUrl,
  logoSize = 50,
}: QRCodeProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling>();

  useEffect(() => {
    if (!ref.current) return;

    const options: QRCodeStylingOptions = {
      width: size,
      height: size,
      type: "svg",
      data: value,
      dotsOptions: {
        color: fgColor,
        type: "rounded",
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: "extra-rounded",
      },
      cornersDotOptions: {
        type: "dot",
      },
    };

    if (logoUrl) {
      options.image = logoUrl;
      options.imageOptions = {
        crossOrigin: "anonymous",
        margin: 5,
        imageSize: logoSize,
      };
    }

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling(options);
      qrCodeRef.current.append(ref.current);
    } else {
      qrCodeRef.current.update(options);
    }
  }, [value, size, bgColor, fgColor, logoUrl, logoSize]);

  return <div ref={ref} />;
};
