export const convertToRLE = (mask: ImageData, id): { rle: number[]; bbox: [number, number, number, number]; area: number } => {
  const width = mask.width;
  const data = mask.data;

  let rle: number[] = [];
  let area = 0;
  let bboxr: [number, number, number, number] = [Infinity, Infinity, 0, 0];

  let lastValue = -1; // Initialize to an invalid value to handle the first pixel
  let count = 0;

  const firstAlpha = data[3];
  if (firstAlpha > 0) {
    rle.push(0);
  }

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]; // Alpha

    // Convert non-zero alpha pixels into binary mask (1 for object, 0 for background)
    const value = a > 0 ? 1 : 0;

    if (value === 1) {
      const x = (i / 4) % width;
      const y = Math.floor((i / 4) / width);
  
      bboxr[0] = Math.min(bboxr[0], x); // x_min (left)
      bboxr[1] = Math.min(bboxr[1], y); // y_min (top)
      bboxr[2] = Math.max(bboxr[2], x); // x_max (right)
      bboxr[3] = Math.max(bboxr[3], y); // y_max (bottom)
      
      area++;
    }

    
    // RLE encoding logic
    if (value !== lastValue) {
      if (lastValue !== -1) { // Skip the first transition
        rle.push(count);
      }
      count = 1;
      lastValue = value;
    } else {
      count++;
    }
  }

  // Push the last run
  if (lastValue !== -1) {
    rle.push(count);
  }
    
  const bbox: [number, number, number, number] = [bboxr[0], bboxr[1], bboxr[2] - bboxr[0], bboxr[3] - bboxr[1]];

  return { rle, bbox, area };
};