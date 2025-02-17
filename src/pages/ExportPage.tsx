import React from "react";
import ExportButton from "../components/ExportButton.tsx";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";

const ExportPage: React.FC = () => {
  const { state } = useAnnotation();
  const { images, polygons, lines } = state;

  return (
    <StyledExportContainer>
      <ResponsiveTypography>Review & Export</ResponsiveTypography>

      {/* Loop through images and show annotations count */}
      <StyledImageGrid>
        {images.map((img) => {
          const imagePolygons = polygons.filter(poly => poly.imageId === img.id);
          const imageLines = lines.filter(line => line.imageId === img.id && !line.erase);
          const totalAnnotations = imagePolygons.length + imageLines.length;

          return (
            <StyledImageCard key={img.id}>
              <StyledImageBox>
                <StyledText><strong>Image:</strong> {img.name}</StyledText>
                <StyledImage src={img.file} alt={img.name} />
              </StyledImageBox>
              <div>
                <StyledText><strong>Annotations:</strong> {totalAnnotations}</StyledText>
                <StyledText>(Polygons: {imagePolygons.length}, Brush Strokes: {imageLines.length})</StyledText>
              </div>
            </StyledImageCard>
          );
        })}

      </StyledImageGrid>

      <ExportButton />
    </StyledExportContainer>
  );
};

export default ExportPage;

const StyledExportContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: start;
  padding: 20px;
  height: calc(100vh - 56px);
  overflow-y: auto;
  max-width: 100%;

  @media (max-width: 600px) {
    padding: 10px;
    height: calc(100vh - 120px);
  }
`;

const ResponsiveTypography = styled(Typography)`
  font-size: 2.2rem !important; /* Default size */
  font-weight: bold;

  @media (max-width: 900px) {
    font-size: 1.3rem !important;
  }

  @media (max-width: 600px) {
    font-size: 1.5 !important;
  }
`;


const StyledImageGrid = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
  gap: 20px;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

const StyledImageCard = styled(Box)`
  width: 100%;
  max-width: 240px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;

  @media (max-width: 600px) {
    max-width: 360px;
  }
`;

const StyledImageBox = styled(Box)`
  position: relative;
  width: 240px; /* Consistent size */
  height: 180px;
  max-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f8f8;
  margin-bottom: 10px;

    @media (max-width: 600px) {
      width: 360px;
    }
`;

const StyledImage = styled.img`
  width: 100%;
  height: auto;
  flex-grow: 1;
  object-fit: cover;
`;

const StyledText = styled(Typography)`
  font-size: 16px;
  margin: 5px 0;
`;