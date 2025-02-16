import React from "react";
import ExportButton from "../components/ExportButton.tsx";
import { useAnnotation } from "../context/AnnotationContext.tsx";

const ExportPage: React.FC = () => {
  const { state } = useAnnotation();
  const { images, polygons, lines } = state;

  return (
    <div>
      <h2>Review & Export</h2>

      {/* Loop through images and show annotations count */}
      {images.map((img) => {
        const imagePolygons = polygons.filter(poly => poly.imageId === img.id);
        const imageLines = lines.filter(line => line.imageId === img.id);
        const totalAnnotations = imagePolygons.length + imageLines.length;

        return (
          <div key={img.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
            <p><strong>Image:</strong> {img.name}</p>
            <img src={img.file} alt={img.name} width="150" style={{ borderRadius: "4px", marginBottom: "10px" }} />
            <p><strong>Annotations:</strong> {totalAnnotations} (Polygons: {imagePolygons.length}, Brush Strokes: {imageLines.length})</p>
          </div>
        );
      })}

      <ExportButton />
    </div>
  );
};

export default ExportPage;
