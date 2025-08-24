"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/styling";

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

// Sample carousel data with random images
const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
    title: "Khuyến mãi đặc biệt",
    subtitle: "Giảm giá lên đến 50%",
    description: "Cơ hội mua sắm tuyệt vời với hàng ngàn sản phẩm chất lượng",
    buttonText: "Mua ngay",
    buttonLink: "/list",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    title: "Sản phẩm mới",
    subtitle: "Xu hướng 2025",
    description: "Khám phá bộ sưu tập mới nhất với thiết kế hiện đại",
    buttonText: "Khám phá",
    buttonLink: "/list",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
    title: "Miễn phí vận chuyển",
    subtitle: "Toàn quốc",
    description: "Đặt hàng ngay hôm nay và nhận ưu đãi vận chuyển miễn phí",
    buttonText: "Đặt hàng",
    buttonLink: "/list",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1486312338219-ce68e2c6b81d?w=1200&h=600&fit=crop",
    title: "Thế giới công nghệ",
    subtitle: "Thiết bị hiện đại",
    description: "Những sản phẩm công nghệ tiên tiến nhất cho cuộc sống số",
    buttonText: "Xem thêm",
    buttonLink: "/list",
  },
];

const AUTOPLAY_DELAY = 5000; // 5 seconds

export const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(nextSlide, AUTOPLAY_DELAY);
      return () => clearInterval(interval);
    }
  }, [nextSlide, isHovered]);
  return (
    <div
      className="relative w-full h-[200px] md:h-[250px] lg:h-[300px] overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {CAROUSEL_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-in-out",
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6 lg:px-8">
                {" "}
                <div className="max-w-2xl text-white">
                  {slide.subtitle && (
                    <p className="text-xs md:text-sm lg:text-base font-medium text-blue-200 mb-1">{slide.subtitle}</p>
                  )}
                  <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-2 leading-tight">{slide.title}</h1>
                  {slide.description && (
                    <p className="text-xs md:text-sm lg:text-base text-gray-200 mb-4 max-w-lg">{slide.description}</p>
                  )}
                  {slide.buttonText && slide.buttonLink && (
                    <a
                      href={slide.buttonLink}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                    >
                      {slide.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 z-10",
          "bg-white/20 hover:bg-white/30 backdrop-blur-sm",
          "p-2 rounded-full transition-all duration-300",
          "text-white hover:scale-110",
          "opacity-0 group-hover:opacity-100",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 z-10",
          "bg-white/20 hover:bg-white/30 backdrop-blur-sm",
          "p-2 rounded-full transition-all duration-300",
          "text-white hover:scale-110",
          "opacity-0 group-hover:opacity-100",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex space-x-2">
          {CAROUSEL_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>{" "}
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className={cn("h-full bg-white transition-all ease-linear", !isHovered ? "w-full" : "")}
          style={{
            animation: !isHovered ? `progress ${AUTOPLAY_DELAY}ms linear infinite` : "none",
          }}
        />
      </div>
    </div>
  );
};
