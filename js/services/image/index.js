export const loadImage = async (imageUrl) =>
  new Promise((resolve) => {
    // Google's content service does not provide cors headers, so we're forced to load
    // images via Image tag
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      resolve(img);
    };
  });
