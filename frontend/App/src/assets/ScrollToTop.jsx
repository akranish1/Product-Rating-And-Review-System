import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // This moves the window to the top-left corner (0,0)
    window.scrollTo(0, 0);
  }, [pathname]); // Runs every time the path changes

  return null;
};

export default ScrollToTop;