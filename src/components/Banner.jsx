import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image:
        "https://theme.hstatic.net/200000695155/1001373964/14/slider_1.jpg?v=16",
      alt: "New Arrival",
    },
    {
      id: 2,
      image:
        "https://theme.hstatic.net/200000695155/1001373964/14/slider_2.jpg?v=16",
      alt: "Summer Collection",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="relative w-full overflow-hidden cursor-pointer">
      {/* Slides */}
      <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] xl:h-[550px] 2xl:h-[600px] max-h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 
                   bg-black bg-opacity-40 hover:bg-opacity-60 
                   text-white p-2 md:p-2.5
                   rounded-full transition-all duration-300 
                   backdrop-blur-sm hover:scale-110 
                   z-20 border border-white border-opacity-30"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 
                   bg-black bg-opacity-40 hover:bg-opacity-60 
                   text-white p-2 md:p-2.5
                   rounded-full transition-all duration-300 
                   backdrop-blur-sm hover:scale-110 
                   z-20 border border-white border-opacity-30"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? "w-8 md:w-10 h-2 bg-black rounded-full"
                : "w-2 h-2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
