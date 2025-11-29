/**
 * Image processing utilities for profile image editor
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageTransform {
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  grayscale: boolean;
}

/**
 * Load an image from a file or URL
 */
export function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    if (src instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(src);
    } else {
      img.src = src;
    }
  });
}

/**
 * Rotate an image by degrees
 */
export function rotateImage(
  image: HTMLImageElement,
  degrees: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) throw new Error("Could not get canvas context");
  
  // Calculate new dimensions based on rotation
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  
  const newWidth = image.width * cos + image.height * sin;
  const newHeight = image.width * sin + image.height * cos;
  
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  
  return canvas;
}

/**
 * Flip an image horizontally or vertically
 */
export function flipImage(
  image: HTMLImageElement | HTMLCanvasElement,
  horizontal: boolean,
  vertical: boolean
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) throw new Error("Could not get canvas context");
  
  canvas.width = image.width;
  canvas.height = image.height;
  
  ctx.translate(
    horizontal ? image.width : 0,
    vertical ? image.height : 0
  );
  ctx.scale(
    horizontal ? -1 : 1,
    vertical ? -1 : 1
  );
  
  ctx.drawImage(image, 0, 0);
  
  return canvas;
}

/**
 * Apply grayscale filter to an image
 */
export function applyGrayscale(
  image: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) throw new Error("Could not get canvas context");
  
  canvas.width = image.width;
  canvas.height = image.height;
  
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray; // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // data[i + 3] is alpha, leave it unchanged
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return canvas;
}

/**
 * Crop an image based on crop area coordinates
 */
export function cropImage(
  image: HTMLImageElement | HTMLCanvasElement,
  cropArea: CropArea,
  pixelCrop: { x: number; y: number; width: number; height: number }
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  if (!ctx) throw new Error("Could not get canvas context");
  
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  
  return canvas;
}

/**
 * Get cropped image as blob
 * react-easy-crop's croppedAreaPixels are relative to the original image but account for rotation.
 * We crop first, then apply rotation to match what the user saw, then apply flip/grayscale.
 */
export async function getCroppedImg(
  imageSrc: string | File,
  pixelCrop: { x: number; y: number; width: number; height: number },
  transform: ImageTransform
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  
  // Step 1: Crop the image (croppedAreaPixels from react-easy-crop account for rotation in coordinates)
  let processedImage: HTMLCanvasElement | HTMLImageElement = cropImage(
    image,
    { x: 0, y: 0, width: 0, height: 0 },
    pixelCrop
  );
  
  // Step 2: Apply rotation to the cropped image to match what user saw
  // Note: react-easy-crop handles rotation visually, but we need to apply it to the result
  if (transform.rotation !== 0) {
    // Convert canvas to image for rotation
    const img = new Image();
    img.src = (processedImage as HTMLCanvasElement).toDataURL();
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    processedImage = rotateImage(img, transform.rotation);
  }
  
  // Step 3: Apply flip after cropping and rotation
  if (transform.flipHorizontal || transform.flipVertical) {
    processedImage = flipImage(
      processedImage,
      transform.flipHorizontal,
      transform.flipVertical
    );
  }
  
  // Step 4: Apply grayscale after all other transformations
  if (transform.grayscale) {
    processedImage = applyGrayscale(processedImage);
  }
  
  // Convert to blob
  return new Promise((resolve, reject) => {
    (processedImage as HTMLCanvasElement).toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/jpeg",
      0.95
    );
  });
}

/**
 * Get pixel crop from crop area (react-easy-crop format)
 */
export function getPixelCrop(
  image: HTMLImageElement | HTMLCanvasElement,
  cropArea: CropArea,
  zoom: number = 1
): { x: number; y: number; width: number; height: number } {
  const scaleX = image.width / cropArea.width;
  const scaleY = image.height / cropArea.height;
  
  return {
    x: Math.round(cropArea.x * scaleX),
    y: Math.round(cropArea.y * scaleY),
    width: Math.round(cropArea.width * scaleX),
    height: Math.round(cropArea.height * scaleY),
  };
}

