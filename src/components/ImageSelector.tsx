import React from "react";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import { Select, MenuItem, Box, SelectChangeEvent } from "@mui/material";

const ImageSelector: React.FC = () => {
  const { state, dispatch } = useAnnotation();
  const { images } = state;

  const handleImageChange = (event: SelectChangeEvent<string>) => {
    const selectedImage = state.images.find((img) => img.file === event.target.value);
    if (selectedImage) {
      dispatch({ type: "SET_SELECTED_IMAGE", payload: selectedImage });
    }
  };
  
  return (
       <Box mb={2}>
        <Select 
          value={state.selectedImage?.file || ""} 
          onChange={handleImageChange}
          >
          {images.map((img, index) => (
            <MenuItem key={index} value={img.file ?? ""}>
              Image {index + 1}
            </MenuItem>
          ))}
        </Select>
      </Box>
  );
};

export default ImageSelector;
