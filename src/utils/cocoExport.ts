const generateCOCO = (imageFile, imageDimensions, polygons, classes, lines) => {
  // For a minimal test, let's assume:
  // - We have a single "image" (id=1)

  // COCO JSON format: https://cocodataset.org/#format-data
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
  
  const polygonAnnotations = polygons.map((poly, index) => {
    return {
      id: index + 1, // Start IDs from 1
      image_id: 1,
      category_id: poly.categoryId,
      segmentation: [poly.points], // array of arrays
      area: 0,
      bbox: calculateBoundingBox(poly.points),
      iscrowd: 0
    }
  })

  const brushAnnotations = lines.map((line, index) => {
    return {
        id: polygons.length + index + 1, // Continue IDs from polygons
        image_id: 1,
        category_id: line.categoryId,
        segmentation: [line.points],  // Lines are open paths
        area: 0,
        bbox: calculateBoundingBox(line.points),
        iscrowd: 0
      }
  })

  cocoJson.annotations = polygonAnnotations.concat(brushAnnotations)

  console.log("COCO Output:", JSON.stringify(cocoJson, null, 2))
  return cocoJson;
}

const calculateBoundingBox = (points: number[]): [number, number, number, number] => {
  const { minX, maxX, minY, maxY } = points.reduce(
    (acc, val, index) => {
      if (index % 2 === 0) { // X values
        acc.minX = acc.minX === null || val < acc.minX ? val : acc.minX;
        acc.maxX = acc.maxX === null || val > acc.maxX ? val : acc.maxX;
      } else { // Y values
        acc.minY = acc.minY === null || val < acc.minY ? val : acc.minY;
        acc.maxY = acc.maxY === null || val > acc.maxY ? val : acc.maxY;
      }
      return acc;
    },
    { minX: null, maxX: null, minY: null, maxY: null }
  );

  return [minX!, minY!, maxX! - minX!, maxY! - minY!]; // Ensure correct bbox format
};

export default generateCOCO
