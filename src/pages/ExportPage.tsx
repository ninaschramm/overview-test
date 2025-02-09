import React from "react";
import ExportButton from "../components/ExportButton.tsx";
import { useAnnotation } from "../context/AnnotationContext.tsx";

const ExportPage: React.FC = () => {
  const { state } = useAnnotation();

  return (
    <div>
      <h2>Review & Export</h2>
      {state.image.file && <p>Image: {state.image.file.name}</p>}
      <p>Annotations: {state.polygons.length}</p>
      <ExportButton />
    </div>
  );
};

export default ExportPage;
