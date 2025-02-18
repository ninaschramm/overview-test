import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from "@mui/material";
import { useAnnotation } from "../context/AnnotationContext.tsx";

const availableColors = [
  "#E53935", "#8E24AA", "#3949AB", "#1E88E5", "#039BE5", "#00ACC1", "#00897B", "#43A047", "#7CB342", "#C0CA33", "#FDD835", "#FB8C00"
];

const NewClassModal = ({ open, onClose }) => {
  const { state, dispatch } = useAnnotation();
  const { classes } = state;
  const [className, setClassName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Remove already used colors from available list
  const usedColors = new Set(classes.map(c => c.color));
  const filteredColors = availableColors.filter(color => !usedColors.has(color));

  const handleAddClass = () => {
    if (!className.trim() || !selectedColor) return;

    dispatch({
      type: "ADD_CLASS",
      payload: { id: Date.now(), name: className, color: selectedColor }
    });

    setClassName("");
    setSelectedColor("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Class</DialogTitle>
      <DialogContent>
        <TextField 
          fullWidth 
          label="Class Name" 
          variant="outlined" 
          value={className} 
          onChange={(e) => setClassName(e.target.value)} 
        />

        <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
          {filteredColors.length > 0 ? (
            filteredColors.map(color => (
              <Box 
                key={color}
                width={30} 
                height={30} 
                bgcolor={color} 
                borderRadius="50%"
                border={selectedColor === color ? "3px solid black" : "1px solid gray"}
                onClick={() => setSelectedColor(color)}
                style={{ cursor: "pointer" }}
              />
            ))
          ) : (
            <p>No colors left! Delete some classes to free up colors.</p>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleAddClass} color="primary" disabled={!className || !selectedColor}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewClassModal;
