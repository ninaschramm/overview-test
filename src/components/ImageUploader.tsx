import React, { useRef, useState } from "react";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import { processUploadedImages } from "../utils/fileHandler.ts";
import { Box, Button, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "./ConfirmationDialog.tsx";

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
      <Typography variant="h6" gutterBottom>
        Upload Images
      </Typography>

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
      <Box display="flex" flexWrap="wrap" mt={2}>
        {Array.isArray(state.images) ? (
          state.images.length > 0 ? (
            state.images.map((img) => (
              <Box 
                key={img.id} 
                mr={2} 
                mb={2} 
                border={1} 
                borderRadius={2} 
                p={1} 
                position="relative"
              >
                {/* Delete Button (X) */}
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(img.id)}
                  style={{ position: "absolute", top: 0, right: 0 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                {/* Image Preview */}
                <img src={img.file} alt={`Preview ${img.id}`} width="100" />
                <Typography variant="caption">{img.name}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="caption" color="warning">
              No images uploaded yet.
            </Typography>
          )
        ) : (
          <Typography variant="caption" color="error">
            ⚠️ Images data is invalid!
          </Typography>
        )}
      </Box>

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
