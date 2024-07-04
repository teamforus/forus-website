import { PixelCrop } from 'react-image-crop';

const TO_RADIANS = Math.PI / 180;

export function canvasPreview(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop,
    scale = 1,
    rotate = 0,
) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    canvas.width = Math.floor(crop.width);
    canvas.height = Math.floor(crop.height);

    ctx.imageSmoothingQuality = 'high';

    const rotateRads = rotate * TO_RADIANS;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-crop.x, -crop.y);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.restore();

    return canvas;
}
