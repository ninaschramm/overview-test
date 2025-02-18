import React from "react";
import { Select, MenuItem, Box, InputLabel, ListItemIcon, ListItemText } from "@mui/material";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import styled from "styled-components";

const ClassSelector: React.FC = () => {
  const { state, dispatch } = useAnnotation();
  const { activeClass, classes } = state;

  return (
    <Box sx={{ maxWidth: 200 }}>
      <InputLabel>Select a class:</InputLabel>
      <Select
        value={activeClass ? activeClass.id : "" }
        onChange={(e) => {
          const selectedClass = classes.find((cl) => cl.id === e.target.value);
          if (selectedClass) {
            dispatch({ type: "SET_ACTIVE_CLASS", payload: selectedClass });
          }
        }}
        renderValue={(selectedId) => {
          const selectedClass = classes.find((cl) => cl.id === selectedId);
          return (
            <StyledClassOption>
              <ColorIndicator style={{ backgroundColor: selectedClass?.color }} />
              {selectedClass?.name}
            </StyledClassOption>
          );
        }}
      >
        {classes.map((cl) => (
          <MenuItem key={cl.id} value={cl.id}>
            <ListItemIcon>
              <ColorIndicator style={{ backgroundColor: cl.color }} />
            </ListItemIcon>
            <ListItemText primary={cl.name} />
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default ClassSelector;

const StyledClassOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorIndicator = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.2);
`;
