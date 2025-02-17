import React, { useRef, useState } from "react";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import { processUploadedImages } from "../utils/fileHandler.ts";
import { Box, Button, Typography, IconButton } from "@mui/material";
import ConfirmationDialog from "./ConfirmationDialog.tsx";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";

const ImageUploader: React.FC = () => {
  const { dispatch, state } = useAnnotation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter((file) =>
      ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
    );

    if (validFiles.length === 0) {
      alert("Please select valid image files (PNG, JPEG, JPG, WEBP).");
      return;
    }

    try {
      const imageFiles = await processUploadedImages(validFiles);
      imageFiles.forEach((img) => dispatch({ type: "ADD_IMAGE", payload: img }));
    } catch (error) {
      console.error("Error processing images:", error);
    }

    // Reset input so users can re-upload the same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteClick = (imageId: number) => {
    setSelectedImage(imageId);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedImage !== null) {
      dispatch({ type: "REMOVE_IMAGE", payload: selectedImage });

      // Remove associated annotations
      dispatch({ type: "REMOVE_ANNOTATIONS_BY_IMAGE", payload: selectedImage });

      setSelectedImage(null);
      setDialogOpen(false);
    }
  };

  return (
    <Box>
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {/* Upload Button */}
      <Button variant="contained" color="primary" onClick={() => fileInputRef.current?.click()}>
        Select Images
      </Button>

      {/* Display Uploaded Images */}
      <StyledImageContainer>
        {state.images.length > 0 ? (
          state.images.map((img) => (
            <StyledImageBox key={img.id}>
              {/* Delete Button (X) */}
              <StyledDeleteButton onClick={() => handleDeleteClick(img.id)}>
                <CloseIcon fontSize="small" />
              </StyledDeleteButton>

              {/* Image Preview */}
              <StyledImage src={img.file} alt={`Preview ${img.id}`} />

              {/* Filename */}
              <StyledFilename>{img.name}</StyledFilename>
            </StyledImageBox>
          ))
        ) : (
          <Typography variant="caption" color="warning">
            No images uploaded yet.
          </Typography>
        )}
      </StyledImageContainer>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        type="image"
      />
    </Box>
  );
};

export default ImageUploader;

const StyledImageContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`;

const StyledImageBox = styled(Box)`
  position: relative;
  width: 240px; /* Consistent size */
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f8f8;
`;

const StyledDeleteButton = styled(IconButton)`
  position: absolute !important;
  top: 4px;
  right: 4px;
  background-color: #e2e2e2 !important;
  font-size: 0.75rem !important;
  padding: 4px !important;
`;

const StyledImage = styled.img`
  width: 100%;
  height: auto;
  flex-grow: 1;
  object-fit: cover;
`;

const StyledFilename = styled(Typography)`
  position: absolute;
  bottom: 0;
  font-size: 0.75rem;
  text-align: center;
  padding: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  background: #ffffff;
`;
