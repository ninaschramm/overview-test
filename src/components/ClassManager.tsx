import React, { useState } from "react";
import { List, ListItem, ListItemText, IconButton, Box, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationDialog from "./ConfirmationDialog.tsx";
import NewClassModal from "./NewClassModal.tsx";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import styled from "styled-components";

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
    <StyledContainer>
      <StyledButton variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setNewClassModalOpen(true)}>
        Add Class
      </StyledButton>

      <StyledList>
        {classes.map((cl) => (
          <StyledListItem key={cl.id}>
            <StyledColorBox color={cl.color} />
            <StyledClassName>{cl.name}</StyledClassName>
            <IconButton onClick={() => handleDeleteClick(cl.id)}>
              <CloseIcon />
            </IconButton>
          </StyledListItem>
        ))}
      </StyledList>

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
    </StyledContainer>
  );
};

export default ClassManager;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledList = styled(List)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const StyledListItem = styled(ListItem)`
  display: flex;
  width: 300px !important;
  gap: 12px;
  border-radius: 8px;
  border: 1px solid #e2e2e2;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 600px) {
    width: 100%; /* Full width on small screens */
  }
`;

const StyledColorBox = styled(Box)<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  flex-shrink: 0;
`;

const StyledClassName = styled(ListItemText)`
  flex-grow: 1;
  font-weight: bold;
`;

const StyledButton = styled(Button)`
  width: fit-content;
  padding: 10px 20px;
`;
