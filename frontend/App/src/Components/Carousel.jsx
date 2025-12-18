import { useEffect, useState, useRef } from "react";
import img1 from "../Images/img1.jpg";
import img2 from "../Images/img2.jpg";
import img3 from "../Images/img3.jpg";
import img4 from "../Images/img4.jpg";
import img5 from "../Images/img5.jpg";

export default function Carousel() {
  const images = [img1, img2, img3, img4, img5];
  const captions = [
    "Trusted products, real reviews",
    "Find the best deals",
    "Top-rated picks",
    "Customer favorites",
    "New arrivals",
  ];

  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const startAutoSlide = () => {
    stopAutoSlide();
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  const handleTouchStart = (e) => {
    stopAutoSlide();
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next(); else prev();
    }
    startAutoSlide();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div
        className="relative overflow-hidden rounded-[2rem] shadow-lg bg-black"
        onMouseEnter={stopAutoSlide}
        onMouseLeave={startAutoSlide}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="w-full flex-shrink-0 relative">
              <img src={src} alt={captions[i] || "slide"} className="w-full h-[320px] sm:h-[420px] md:h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute left-6 bottom-6 text-white max-w-xl">
                <h3 className="text-lg sm:text-2xl font-semibold drop-shadow">{captions[i]}</h3>
                <p className="text-sm sm:text-base text-gray-200 mt-1">Read and share honest reviews from verified buyers.</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <button
          onClick={() => { prev(); startAutoSlide(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
          aria-label="Previous slide"
        >
          ❮
        </button>

        <button
          onClick={() => { next(); startAutoSlide(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
          aria-label="Next slide"
        >
          ❯
        </button>

        {/* Indicators */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); startAutoSlide(); }}
              className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
