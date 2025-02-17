import { convertToRLE } from "./RLEUtils.ts";

const generateCOCO = (images, polygons, classes, lines, brushMasks, polygonMasks) => {
  if (!brushMasks || !polygonMasks) {
    console.error("❌ Missing brushMasks or polygonMasks!");
    return null;
  }

  const cocoJson = {
    info: {
      description: "Test dataset",
      year: new Date().getFullYear(),
      version: "1.0",
      contributor: "@ninaschramm",
      date_created: new Date().toISOString(),
      url: "http://localhost:3000/dataset" // placeholder
    },
    licenses: [
      {
        id: 1,
        name: "Unknown License",
        url: ""
      }
    ],
    images: images.map((img) => ({
      id: img.id,
      file_name: img.name || 'placeholder',
      width: img.dimensions.width,
      height: img.dimensions.height,
      license: 1,
      date_captured: new Date().toISOString(),
      coco_url: img.file,
      flickr_url: ""
    })),
    annotations: [],
    categories: classes.map((cl) => {
      return {
        id: cl.id,
        name: cl.name,
        supercategory: "object"
      }
    })
  }
  // Convert Polygons → RLE
  const polygonAnnotations = polygons.map((poly, index) => {
    const mask = polygonMasks[index]; // Get the mask for this polygon
    const { rle, bbox, area } = convertToRLE(mask);
    console.log('RLE for id:', poly.id, rle);
    // const polyBbox = calculateBoundingBoxFromPoints(poly.points);
    // const polyArea = calculatePolygonArea(poly.points);

      // Running different calculations to test for accuracy
      // console.log('📦 Bounding box (x1, y1, x2, y2):', bbox);
      // console.log('📦 Bounding box from points (x, y, width, height):', polyBbox);
      // console.log('🔢 Area (number of object pixels):', area);
      // console.log('🔢 Area from points:', polyArea);

    return {
      id: poly.id,
      image_id: poly.imageId,
      category_id: poly.categoryId,
      segmentation: rle,
      area: area,
      bbox: bbox,
      iscrowd: 0,
    };
  });

  // Convert Brush Strokes → RLE
  const brushAnnotations = lines.map((line, index) => {
      const image = images.find((img) => img.id === line.imageId);
      const mask = brushMasks[index];
      const { rle, bbox, area } = convertToRLE(mask);
      console.log('RLE for id:', line.id, rle);
      // const brushArea = calculateBrushArea(line.points, line.strokeWidth);
      // const brushBbox = calculateBrushBoundingBox(line.points, line.strokeWidth);
      
      // // Running different calculations to test for accuracy
      // console.log('📦 Bounding box (x1, y1, x2, y2):', bbox);
      // console.log('📦 Bounding box from points (x, y, width, height):', brushBbox);
      // console.log('🔢 Area (number of object pixels):', area);
      // console.log('🔢 Area from points:', brushArea);

      return {
        id: line.id,
        image_id: line.imageId,
        category_id: line.categoryId,
        segmentation: { counts: rle, size: [image.dimensions.height, image.dimensions.width] },
        area,
        bbox,
        iscrowd: 0,
      };
    });
  // const filteredAnnotations = filterErasedAnnotations(brushAnnotations, lines);

  cocoJson.annotations = polygonAnnotations.concat(brushAnnotations);

  console.log("COCO Output:", JSON.stringify(cocoJson, null, 2));
  return cocoJson;
};

// const filterErasedAnnotations = (annotations, lines) => {
//   // Get all eraser stroke points
//   const erasedPoints = lines
//     .filter(line => line.categoryId === 0)
//     .flatMap(line => line.points);

//   return annotations.map(annotation => {
//     // Remove any points that exist in erasedPoints
//     const filteredPoints = annotation.segmentation[0].filter((point, index) => {
//       if (index % 2 !== 0) return true; // Skip Y values, we only check X once
//       const x = point;
//       const y = annotation.segmentation[0][index + 1];
//       return !erasedPoints.some((p, i) => i % 2 === 0 && p === x && erasedPoints[i + 1] === y);
//     });

//     return { ...annotation, segmentation: [filteredPoints] };
//   });
// };

// 🆕 Function: Calculate Area Using Shoelace Formula (For Polygons)
// export const calculatePolygonArea = (points: number[]): number => {
//   let area = 0;
//   const n = points.length / 2;
  
//   for (let i = 0; i < n; i++) {
//     const x1 = points[i * 2];
//     const y1 = points[i * 2 + 1];
//     const x2 = points[((i + 1) % n) * 2];
//     const y2 = points[((i + 1) % n) * 2 + 1];

//     area += x1 * y2 - x2 * y1;
//   }

//   return Math.abs(area / 2); // Shoelace theorem formula
// };

// // 🆕 Function: Approximate Brush Stroke Area (By Stroke Width & Path Length)
// const calculateBrushArea = (points: number[], strokeWidth: number): number => {
//   let length = 0;

//   for (let i = 0; i < points.length - 2; i += 2) {
//     const dx = points[i + 2] - points[i];
//     const dy = points[i + 3] - points[i + 1];
//     length += Math.sqrt(dx * dx + dy * dy);
//   }

//   return length * strokeWidth; // Approximate area
// };

// // 🆕 Function: Compute Bounding Box from Points
// const calculateBoundingBoxFromPoints = (points: number[]): [number, number, number, number] => {
//   let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

//   for (let i = 0; i < points.length; i += 2) {
//     minX = Math.min(minX, points[i]);
//     minY = Math.min(minY, points[i + 1]);
//     maxX = Math.max(maxX, points[i]);
//     maxY = Math.max(maxY, points[i + 1]);
//   }

//   return [minX, minY, maxX - minX, maxY - minY]; // [x, y, width, height]
// };

// const calculateBrushBoundingBox = (points: number[], strokeWidth: number): [number, number, number, number] => {
//   let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

//   for (let i = 0; i < points.length; i += 2) {
//     minX = Math.min(minX, points[i]);
//     minY = Math.min(minY, points[i + 1]);
//     maxX = Math.max(maxX, points[i]);
//     maxY = Math.max(maxY, points[i + 1]);
//   }

//   // Expand bbox by half the stroke width in all directions
//   minX = Math.max(0, minX - strokeWidth / 2);
//   minY = Math.max(0, minY - strokeWidth / 2);
//   maxX = Math.min(700, maxX + strokeWidth / 2); // using max canvas size as 700px
//   maxY = Math.min(700, maxY + strokeWidth / 2);

//   return [minX, minY, maxX - minX, maxY - minY];
// };


export default generateCOCO
