import React from "react";
import ImageUploader from "../components/ImageUploader.tsx";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ClassManager from "../components/ClassManager.tsx";
import styled from "styled-components";

const SetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <StyledSetupContainer>
      <ResponsiveTypography gutterBottom>
        Setup Your Annotation Project
      </ResponsiveTypography>

      {/* Image Uploader Component */}
      <ImageUploader />

      {/* Class Manager Component */}
      <ClassManager />

      {/* Button to Proceed to Annotation Page */}
      <StyledButton 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/annotate")}
      >
        Start Annotating
      </StyledButton>
    </StyledSetupContainer>
  );
};

export default SetupPage;

const StyledSetupContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 30px;
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

const StyledButton = styled(Button)`
  width: 280px; /* Default button width */
  padding: 10px 20px;
  margin-top: 0, 20px !important; /* Override MUI margin */

  @media (max-width: 600px) {
    width: 100%; /* Full width on small screens */
    margin: 0, 10px !important; /* Override MUI margin */
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

