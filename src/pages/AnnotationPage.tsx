import React from "react";
import CanvasArea from "../components/CanvasArea.tsx";
import Toolbar from "../components/Toolbar.tsx";
import ImageSelector from "../components/ImageSelector.tsx";
import ClassSelector from "../components/ClassSelector.tsx";
import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const AnnotationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <StyledAnnotationContainer>
      <ResponsiveTypography variant="h4" gutterBottom>
        Annotate Your Images
      </ResponsiveTypography>

      <SelectorsContainer>
        <ImageSelector />
        <ClassSelector />
      </SelectorsContainer>
    
      <Toolbar />
      <CanvasArea />

      <StyledButton variant="contained" color="primary" onClick={() => navigate("/export")}>
        Export Annotations
      </StyledButton>
    </StyledAnnotationContainer>
  );
};

export default AnnotationPage;

const StyledAnnotationContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 56px);
  max-width: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 600px) {
    padding: 10px;
    height: calc(100vh - 120px);
  }
`;

const SelectorsContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 10px;
    align-items: start;
  }
`;

const StyledButton = styled(Button)`
  width: fit-content;
  padding: 10px 20px;
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
