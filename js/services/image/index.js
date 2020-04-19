export const loadImage = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    // Google's content service does not provide cors headers, so we're forced to load
    // images via Image tag
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      resolve(img);
    };
  });
};
