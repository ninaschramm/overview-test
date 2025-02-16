import React, { useRef } from "react";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import { processUploadedImages } from "../utils/fileHandler.ts";
import { Box, Button, Typography } from "@mui/material";

const ImageUploader: React.FC = () => {
  const { dispatch, state } = useAnnotation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
            state.images.map((img, index) => {
              console.log("🖼️ Rendering image:", img);
              return (
                <Box key={index} mr={2} mb={2} border={1} borderRadius={2} p={1}>
                  <img src={img.file} alt={`Preview ${index}`} width="100" />
                  <Typography variant="caption">
                    {img.name}
                  </Typography>
                </Box>
              );
            })
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

    </Box>
  );
};

export default ImageUploader;
