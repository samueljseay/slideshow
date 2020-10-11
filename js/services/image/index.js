const imagePool = [
  { inUse: false, img: new Image(), lastUsed: null },
  { inUse: false, img: new Image(), lastUsed: null },
  { inUse: false, img: new Image(), lastUsed: null },
  { inUse: false, img: new Image(), lastUsed: null },
  { inUse: false, img: new Image(), lastUsed: null },
];

export const loadImage = async (imageUrl) =>
  new Promise((resolve, reject) => {
    const imageFromPool =
      imagePool.find((i) => !i.inUse) ||
      imagePool.sort((a, b) => a.lastUsed - b.lastUsed)[0];

    if (imageFromPool) {
      if (imageFromPool.inUse) {
        releaseImage(imageFromPool);
      }

      // Google's content service does not provide cors headers, so we're forced to load
      // images via Image tag
      imageFromPool.inUse = true;
      imageFromPool.lastUsed = Date.now();
      imageFromPool.img.src = imageUrl;
      imageFromPool.img.onload = () => {
        resolve(imageFromPool);
      };
    } else {
      reject(new Error("Could not get image from pool"));
    }
  });

export const releaseImage = (image) => {
  image.inUse = false;
  image.src = null;
};
