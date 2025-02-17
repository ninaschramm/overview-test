import React, { useState } from "react";
import { List, ListItem, ListItemText, IconButton, Box, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationDialog from "./ConfirmationDialog.tsx";
import NewClassModal from "./NewClassModal.tsx";
import { useAnnotation } from "../context/AnnotationContext.tsx";

const ClassManager = () => {
  const { state, dispatch } = useAnnotation();
  const { classes } = state;
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isNewClassModalOpen, setNewClassModalOpen] = useState(false);

  const handleDeleteClick = (classId: number) => {
    setSelectedClass(classId);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch({ type: "REMOVE_CLASS", payload: selectedClass });

    // Remove associated annotations
    dispatch({
      type: "REMOVE_ANNOTATIONS_BY_CLASS",
      payload: selectedClass,
    });

    setDialogOpen(false);
    setSelectedClass(null);
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3>Manage Classes</h3>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setNewClassModalOpen(true)}>
          Add Class
        </Button>
      </Box>

      <List>
        {classes.map((cl) => (
          <ListItem 
            key={cl.id} 
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(cl.id)}>
                <DeleteIcon color="error" />
              </IconButton>
            }
          >
            <Box width={20} height={20} bgcolor={cl.color} borderRadius="50%" mr={2} />
            <ListItemText primary={cl.name} />
          </ListItem>
        ))}
      </List>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        type="class"
      />

      {/* New Class Modal */}
      <NewClassModal 
        open={isNewClassModalOpen}
        onClose={() => setNewClassModalOpen(false)}
      />
    </div>
  );
};

export default ClassManager;
