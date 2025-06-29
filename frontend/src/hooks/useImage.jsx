import { useState, useEffect } from 'react';

// Custom hook to load an image from a URL
function useImage(url, crossOrigin) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.src = url;
    img.onload = () => {
      setImage(img);
    };
    img.onerror = () => {
      setImage(null);
    };

    // Cleanup function
    return () => {
      setImage(null);
    };
  }, [url, crossOrigin]);

  return [image];
}

export default useImage;
