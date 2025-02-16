import React from "react";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import generateCOCO from "../utils/cocoExport.ts";

const ExportButton: React.FC = () => {
  const { state, canvasRef, brushMasks, polygonMasks } = useAnnotation();

  if (!brushMasks || !polygonMasks) {
    console.error("❌ Missing brushMasks or polygonMasks!");
    return;
  }


  const handleExport = () => {
    console.log("📌 ExportButton canvasRef.current:", canvasRef.current);
    const cocoJson = generateCOCO(
      state.images,
      state.polygons,
      state.classes,
      state.lines,
      brushMasks,
      polygonMasks
    );
    if (!cocoJson) return;

    // Convert JSON to file and download
    const blob = new Blob([JSON.stringify(cocoJson, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "annotations.json";
    a.click();
  };

  return <button onClick={handleExport}>Export to COCO</button>;
};

export default ExportButton;
