import React, { useEffect, useState, useCallback, useRef } from "react";
import { useInterval } from "../../lib/use-interval";
import { loadImage, releaseImage } from "../../services/image";

// To use minimal memory the simplest thing is to prefetch 1 image in advance and use
class ImageLoader {
  constructor() {
    this.images = [];
    console.log("instantiate loader");
  }

  setImages(imageUrls) {
    this.images = imageUrls.map((url) => ({
      imageFromPool: null,
      url,
    }));

    this.start();
  }

  start() {
    // prefetch the first image, we know the image list is accessed in order
    this.images[0].imageFromPool = loadImage(this.images[0].url);
  }

  // Returns a promise with the image
  getImage(index) {
    const image = this.images[index];
    const lastImage = this.images[index - 1];
    const nextImage =
      index === this.images.length - 1
        ? this.images[0]
        : this.images[index + 1];

    if (lastImage && lastImage.imageFromPool) {
      releaseImage(lastImage.imageFromPool);
    }

    if (image.imageFromPool === null) {
      image.imageFromPool = loadImage(image.url);
    }

    // Prefetch the next image
    if (nextImage.imageFromPool === null) {
      nextImage.imageFromPool = loadImage(nextImage.url);
    }

    return image.imageFromPool;
  }
}

let loader = new ImageLoader();

export const Slideshow = ({ imageUrls }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [displayedImage, setDisplayedImage] = useState(null);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);

  useInterval(() => {
    if (firstImageLoaded) {
      loader.getImage(slideIndex).then(({ img }) => {
        setFading(true);

        setTimeout(() => {
          const nextSlideIndex =
            slideIndex === imageUrls.length - 1 ? 0 : slideIndex + 1;
          setSlideIndex(nextSlideIndex);
          setDisplayedImage(img);
          setFading(false);
        }, 1000);
      });
    }
  }, 10000);

  useEffect(() => {
    loader.setImages(imageUrls);
    loader.getImage(0).then(({ img }) => {
      setDisplayedImage(img);
      setSlideIndex(1);
      setFirstImageLoaded(true);
    });
  }, []);

  const image = displayedImage;

  const { offsetHeight, offsetWidth } = document.body;
  const { height, width } = image || { height: 0, width: 0 };
  const constrainDimension =
    height && width
      ? width / height > 2.5
        ? { width: offsetWidth - 100 }
        : { height: offsetHeight - 100 }
      : {};

  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "#000" }}>
      <div
        style={{
          padding: 30,
          objectFit: "contain",
          width: offsetWidth - 100,
          height: offsetHeight - 60,
          display: "flex",
        }}
      >
        {image && (
          <img
            className={fading ? "fade" : ""}
            src={image.src}
            style={{
              ...constrainDimension,
              margin: "auto",
              border: "10px solid white",
              opacity: 1,
              transition: "opacity 1s ease-in-out",
            }}
          />
        )}
      </div>
    </div>
  );
};
