import { convertToRLE } from "./RLEUtils.ts";

const generateCOCO = (imageFile, imageDimensions, polygons, classes, lines, brushMasks, polygonMasks) => {
  if (!brushMasks || !polygonMasks) {
    console.error("❌ Missing brushMasks or polygonMasks!");
    return null;
  }

  console.log("✅ Pixel data retrieved successfully! Proceeding with COCO export...");

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
    images: [
      {
        id: 1,
        file_name: imageFile.name || 'placeholder',  // or your actual local path
        width: imageDimensions.width,
        height: imageDimensions.height,
        license: 1,
        date_captured: new Date().toISOString(),
        coco_url: "https://images.ctfassets.net/8j5aqoy0ts8s/6z7MzieJ83Qz6MYqTRGGC6/7f925f3ab696ab8aab84a120846f34fb/saturated-colors-960px_3x.png",
        flickr_url: ""
      }
    ],
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
    console.log('poly maks :', polygonMasks)
    const mask = polygonMasks[index]; // Get the mask for this polygon
    const { rle, bbox, area } = convertToRLE(mask);

    return {
      id: index + 1,
      image_id: 1,
      category_id: poly.categoryId,
      segmentation: rle,
      area: area,
      bbox: bbox,
      iscrowd: 0,
    };
  });

  // Convert Brush Strokes → RLE
  const brushAnnotations = lines
    .filter((line) => line.categoryId !== 0) // Ignore eraser strokes
    .map((line, index) => {
      const mask = brushMasks[index]; // Get the mask for this brush stroke
      const { rle, bbox, area } = convertToRLE(mask);

      return {
        id: polygons.length + index + 1, // Continue IDs after polygons
        image_id: 1,
        category_id: line.categoryId,
        segmentation: { counts: rle, size: [imageDimensions.height, imageDimensions.width] },
        area,
        bbox,
        iscrowd: 0,
      };
    });

  const filteredAnnotations = filterErasedAnnotations(brushAnnotations, lines);

  cocoJson.annotations = polygonAnnotations.concat(filteredAnnotations);

  console.log("COCO Output:", JSON.stringify(cocoJson, null, 2));
  return cocoJson;
};

const filterErasedAnnotations = (annotations, lines) => {
  // Get all eraser stroke points
  const erasedPoints = lines
    .filter(line => line.categoryId === 0)
    .flatMap(line => line.points);

  return annotations.map(annotation => {
    // Remove any points that exist in erasedPoints
    const filteredPoints = annotation.segmentation[0].filter((point, index) => {
      if (index % 2 !== 0) return true; // Skip Y values, we only check X once
      const x = point;
      const y = annotation.segmentation[0][index + 1];
      return !erasedPoints.some((p, i) => i % 2 === 0 && p === x && erasedPoints[i + 1] === y);
    });

    return { ...annotation, segmentation: [filteredPoints] };
  });
};

export default generateCOCO
