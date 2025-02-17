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

    return {
      id: poly.id,
      image_id: poly.imageId,
      category_id: poly.categoryId,
      segmentation: [rle],
      area: area,
      bbox: bbox,
      iscrowd: 0,
    };
  });

  // Convert Brush Strokes → RLE
  const brushAnnotations = lines
    .filter(line => !line.erase && line.categoryId !== 0)
    .map((line, index) => {
      const mask = brushMasks[index];
      const { rle, bbox, area } = convertToRLE(mask);

      return {
        id: line.id,
        image_id: line.imageId,
        category_id: line.categoryId,
        segmentation: [rle],
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

export default generateCOCO
