import { useEffect, useState, useRef } from "react";
import img1 from "../Images/img1.jpg";
import img2 from "../Images/img2.jpg";
import img3 from "../Images/img3.jpg";
import img4 from "../Images/img4.jpg";
import img5 from "../Images/img5.jpg";

export default function Carousel() {
  const images = [img1, img2, img3, img4, img5];
  const [index, setIndex] = useState(0);

  // ⭐ Store interval ID so we can stop/start it
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
  };

  const stopAutoSlide = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={stopAutoSlide}     // ⭐ Pause when hovering
      onMouseLeave={startAutoSlide}    // ⭐ Resume when leaving
    >
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            className="w-full h-[500px] object-cover flex-shrink-0 px-20 mt-10 rounded-lg"
            alt=""
          />
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-5 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-full hover:bg-gray-900 cursor-pointer"
      >
        ❮
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-5 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-full hover:bg-gray-900 cursor-pointer"
      >
        ❯
      </button>
    </div>
  );
}
