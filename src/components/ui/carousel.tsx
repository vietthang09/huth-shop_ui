"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";

import { cn } from "@/shared/utils/styling";

interface CarouselProps {
  children: React.ReactNode[];
  slidesToShow?: number;
  slidesToScroll?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  gap?: number;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  slidesToShow = 4,
  slidesToScroll = 1,
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  gap = 16,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const totalSlides = children.length;
  const maxIndex = Math.max(0, totalSlides - slidesToShow);
  const totalDots = Math.ceil(totalSlides / slidesToScroll);

  const goToSlide = useCallback(
    (index: number) => {
      const newIndex = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(newIndex);
    },
    [maxIndex],
  );

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + slidesToScroll;
      return newIndex > maxIndex ? 0 : Math.min(newIndex, maxIndex);
    });
  }, [maxIndex, slidesToScroll]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - slidesToScroll;
      return newIndex < 0 ? maxIndex : newIndex;
    });
  }, [maxIndex, slidesToScroll]);

  const goToDot = (dotIndex: number) => {
    goToSlide(dotIndex * slidesToScroll);
  };

  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, nextSlide]);

  const activeDot = Math.floor(currentIndex / slidesToScroll);

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / slidesToShow}%)`,
            gap: `${gap}px`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `calc((100% - ${gap * (slidesToShow - 1)}px) / ${slidesToShow})`,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > slidesToShow && (
        <>
          <button
            onClick={prevSlide}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4",
              "bg-white/30 hover:bg-white/40 backdrop-blur-md shadow-lg rounded-full p-2 cursor-pointer",
              "transition-all duration-200 z-10",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:scale-110",
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={nextSlide}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4",
              "bg-white/30 hover:bg-white/40 backdrop-blur-md shadow-lg rounded-full p-2 cursor-pointer",
              "transition-all duration-200 z-10",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:scale-110",
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {showDots && totalSlides > slidesToShow && (
        <div className="h-4 flex items-center justify-start gap-4 mt-4">
          {Array.from({ length: totalDots }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToDot(index)}
              className={cn(
                "w-1 h-1 rounded-full transition-all duration-300",
                activeDot === index ? " w-3 h-3 bg-[#f73030]" : " bg-gray-300 hover:bg-gray-400",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
