import React, { useEffect, useState, useCallback, useRef } from "react";
import { loadImage } from "../../services/image";

class ImageRequestQueue {
  constructor() {
    this.processedItems = [];
    this.paused = false;
    this.itemsToProcessInAdvance = 5;
    this.itemsProcessed = 0;
    this.finished = false;
    this.onProcessItem = (image) => {};
  }

  start(imageUrls, onProcessItem) {
    this.imageUrls = imageUrls;
    this.onProcessItem = onProcessItem;
    this.paused = false;

    window.requestIdleCallback(() => {
      this.processQueue();
    });
  }

  attachCallback(onProcessItem) {
    this.onProcessItem = onProcessItem;
  }

  async fetchImage(imageUrl) {
    const image = await loadImage(imageUrl);
    this.processedItems.push(image);
    this.itemsProcessed++;

    this.onProcessItem(image);

    if (this.itemsProcessed < this.itemsToProcessInAdvance) {
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
}

const requestQueue = new ImageRequestQueue();

export const Slideshow = ({ imageUrls }) => {
  const [images, setImages] = useState([]);
  const [displayedImage, setDisplayedImage] = useState({
    image: null,
    index: null,
  });
  const [fading, setFading] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    if (images.length) {
      const handler = setInterval(() => {
        let index = displayedImage.index + 1;

        // loop back to start
        if (index > images.length - 1) {
          index = 0;
        }

        const nextImage = images[index];

        // TODO, maybe use state to determine class name instead?
        if (nextImage) {
          setFading(true);

          setTimeout(() => {
            setDisplayedImage({ image: nextImage, index });

            setTimeout(() => {
              setFading(false);
            }, 1000);
          }, 1000);
        }
      }, 10000);

      return () => {
        clearInterval(handler);
      };
    }
  }, [images, displayedImage]);

  const addImage = useCallback(
    (image) => {
      if (!images.length) {
        // display first image
        setDisplayedImage({ image, index: 0 });
      }

      setImages([...images, image]);
    },
    [images]
  );

  requestQueue.attachCallback(addImage);

  useEffect(() => {
    requestQueue.start(imageUrls, (image) => {
      //addImage(image);
    });
  }, []);

  const { offsetHeight, offsetWidth } = document.body;

  const { height, width } = displayedImage.image
    ? displayedImage.image
    : { height: 0, width: 0 };
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
        {displayedImage.image && (
          <img
            className={fading ? "fade" : ""}
            src={displayedImage.image.src}
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
