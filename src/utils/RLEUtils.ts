export const convertToRLE = (mask: ImageData): { rle: number[]; bbox: [number, number, number, number]; area: number } => {
  if (!mask) {
    console.warn('mask is undefined!!! HELP')
  } else {
    console.log('mask is this shit: ', mask)
  }
  const { width, height, data } = mask;

  // Calculate bounding box
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let area = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (data[index * 4] > 0) { // Check the red channel (non-zero means the pixel is part of the mask)
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        area++;
      }
    }
  }

  const bbox: [number, number, number, number] = [minX, minY, maxX - minX, maxY - minY];

  // Convert binary mask to RLE
  const rle: number[] = [];
  let count = 0;
  let current = 0;

  for (let i = 0; i < data.length; i += 4) {
    const pixel = data[i]; // Check the red channel
    if (pixel === current) {
      count++;
    } else {
      rle.push(count);
      count = 1;
      current = pixel;
    }
  }
  rle.push(count);

  return { rle, bbox, area };
};

// const calculatePolygonArea = (points: number[]) => {
//   let sum = 0;
//   for (let i = 0; i < points.length - 2; i += 2) {
//     sum += points[i] * points[i + 3] - points[i + 2] * points[i + 1];
//   }
//   return Math.abs(sum / 2);
// };

// const points = [
//   72,
//   229.125,
//   56,
//   299.125,
//   328,
//   310.125,
//   457,
//   255.125,
//   455,
//   117.125,
//   281,
//   129.125,
//   203,
//   213.125,
//   164,
//   94.125,
//   126,
//   161.125,
//   104,
//   209.125,
//   6,
//   166.125
// ]

// const image = { width: 600, height: 400 }

// const result = convertToRLE(points, image.width, image.height)
// console.log('result: ', result)