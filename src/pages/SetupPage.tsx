import React from "react";
import ImageUploader from "../components/ImageUploader.tsx";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

const SetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Setup Your Annotation Project
      </Typography>

      {/* Image Uploader Component */}
      <ImageUploader />

      {/* Button to Proceed to Annotation Page */}
      <Button 
        variant="contained" 
        color="secondary" 
        sx={{ mt: 3 }}
        onClick={() => navigate("/annotate")}
      >
        Start Annotating
      </Button>
    </Box>
  );
};

export default SetupPage;
