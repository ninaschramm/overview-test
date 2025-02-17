import React from "react";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import generateCOCO from "../utils/cocoExport.ts";
import { Button } from "@mui/material";
import styled from "styled-components";

const ExportButton: React.FC = () => {
  const { state } = useAnnotation();
  const { selectedImage, lines, polygons } = state;

  const getPixelData = (): { brushMasks: ImageData[], polygonMasks: ImageData[] } => {
  
    if (!selectedImage?.dimensions) {
      console.warn("⚠️ Image dimensions are not set!");
      return { brushMasks: [], polygonMasks: [] };
    }
  
    const { width, height } = selectedImage.dimensions;
  
    // Separate normal strokes and eraser strokes
    const normalLines = lines.filter(line => !line.erase);
    const erasedLines = lines.filter(line => line.erase);
  
    // Render brush strokes with erasing applied
    const brushMasks = normalLines.map((line) => renderBrushStrokeToCanvas(line, width, height, erasedLines));
  
    // Render polygons (no changes needed)
    const polygonMasks = polygons.map((poly) => renderPolygonToCanvas(poly, width, height));
  
    return { brushMasks, polygonMasks };
  };
  

  const renderBrushStrokeToCanvas = (line: any, width: number, height: number, erasedLines: any[]): ImageData => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
  
    if (!ctx) throw new Error("Could not get canvas context");
  
    // Draw the brush stroke
    ctx.beginPath();
    ctx.moveTo(line.points[0], line.points[1]);
    for (let i = 2; i < line.points.length; i += 2) {
      ctx.lineTo(line.points[i], line.points[i + 1]);
    }
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  
    // Apply eraser strokes to remove pixels
    erasedLines.forEach((eraseLine) => {
      ctx.globalCompositeOperation = 'destination-out'; // Subtract pixels
      ctx.beginPath();
      ctx.moveTo(eraseLine.points[0], eraseLine.points[1]);
      for (let i = 2; i < eraseLine.points.length; i += 2) {
        ctx.lineTo(eraseLine.points[i], eraseLine.points[i + 1]);
      }
      ctx.strokeStyle = "rgba(0,0,0,1)"; // Erase with solid black
      ctx.lineWidth = eraseLine.strokeWidth;
      ctx.stroke();
    });
    
    return ctx.getImageData(0, 0, width, height);
  };
  
  
  const renderPolygonToCanvas = (poly: any, width: number, height: number): ImageData => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
  
    if (!ctx) throw new Error("Could not get canvas context");
  
    // Draw the polygon
    ctx.beginPath();
    ctx.moveTo(poly.points[0], poly.points[1]);
    for (let i = 2; i < poly.points.length; i += 2) {
      ctx.lineTo(poly.points[i], poly.points[i + 1]);
    }
    ctx.closePath();
    ctx.fillStyle = poly.color;
    ctx.fill();
  
    return ctx.getImageData(0, 0, width, height);
  };
  
  const { brushMasks, polygonMasks } = getPixelData();

  if (!brushMasks || !polygonMasks) {
    console.error("❌ Missing brushMasks or polygonMasks!");
    return;
  }

  const handleExport = () => {
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

  return <StyledButton 
    variant="contained" 
    color="primary" 
    onClick={handleExport}
  >
    Export to COCO
  </StyledButton>
};

export default ExportButton;

const StyledButton = styled(Button)`
  width: 280px; /* Default button width */
  padding: 10px 20px;
  margin-top: 0, 20px !important; /* Override MUI margin */

  @media (max-width: 600px) {
    width: 100%; /* Full width on small screens */
    margin: 0, 10px !important; /* Override MUI margin */
  }
`;

