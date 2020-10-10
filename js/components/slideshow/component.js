import React, { useEffect, useState, useCallback, useRef } from "react";
import { useInterval } from "../../lib/use-interval";
import { loadImage } from "../../services/image";

class ImageRequestQueue {
  constructor() {
    this.processedItems = [];
    this.paused = false;
    this.itemsToProcessInAdvance = 5;
    this.itemsProcessed = 0;
    this.finished = false;
    this.onProcessItem = (image) => {};
    this.hasStarted = false;
  }

  start(imageUrls, onProcessItem = () => {}) {
    if (!this.hasStarted) {
      this.imageUrls = imageUrls;
      this.onProcessItem = onProcessItem;
      this.paused = false;

      window.requestIdleCallback(() => {
        this.processQueue();
      });
    }

    this.hasStarted = true;
  }

  async fetchImage(imageUrl) {
    const image = await loadImage(imageUrl);
    this.processedItems.push(image);
    this.itemsProcessed++;

    this.onProcessItem(this.processedItems);

    if (this.itemsProcessed < this.imageUrls.length) {
      window.requestIdleCallback(() => {
        this.processQueue();
      });
    } else {
      this.paused = true;
      this.itemsProcessed = 0;
    }
  }

  processQueue() {
    const imageUrl = this.imageUrls[this.processedItems.length];

    if (imageUrl) {
      this.fetchImage(imageUrl);
    } else {
      this.finished = true;
    }
  }

  getImages() {
    return this.processedItems;
  }
}

const requestQueue = new ImageRequestQueue();

export const Slideshow = ({ imageUrls }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [fading, setFading] = useState(false);

  // TODO - support changing of imageUrls prop
  useEffect(() => {
    requestQueue.start(imageUrls, (images) => setLoadedImages(images));
  }, []);

  useInterval(() => {
    const images = requestQueue.getImages();
    const nextSlideIndex = slideIndex === imageUrls.length ? 0 : slideIndex + 1;

    if (images[nextSlideIndex] && !fading) {
      setFading(true);

      setTimeout(() => {
        // There is an image, move to it
        setSlideIndex(nextSlideIndex);
        setFading(false);
      }, 1000);
    }
  }, 10000);

  const image = requestQueue.getImages()[slideIndex];
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
