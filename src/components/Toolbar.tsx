import React from "react";
import { Slider } from "@mui/material";
import { Brush as BrushIcon, Polyline as PolylineIcon, Undo as UndoIcon } from "@mui/icons-material";
import { RiEraserLine } from "react-icons/ri";
import { useAnnotation } from "../context/AnnotationContext.tsx";
import styled from "styled-components";

const Toolbar: React.FC = () => {
  const { state, dispatch } = useAnnotation();
  const { activeTool, brushSize } = state;

  return (
    <StyledContainer>
      <StyledToolbar>
        {/* Tools */}
        <ToolButton
          active={activeTool === "polygon"}
          onClick={() => dispatch({ type: "SET_ACTIVE_TOOL", payload: "polygon" })}
        >
          <PolylineIcon />
        </ToolButton>
        <ToolButton
          active={activeTool === "brush"}
          onClick={() => dispatch({ type: "SET_ACTIVE_TOOL", payload: "brush" })}
        >
          <BrushIcon />
        </ToolButton>
        <ToolButton
          active={activeTool === "eraser"}
          onClick={() => dispatch({ type: "SET_ACTIVE_TOOL", payload: "eraser" })}
        >
          <RiEraserLine size={24} />
        </ToolButton>
        <ToolButton onClick={() => dispatch({ type: "UNDO" })}>
          <UndoIcon />
        </ToolButton>
      </StyledToolbar>
        {/* Brush Size Slider (Only when using brush/eraser) */}
        {(activeTool === "brush" || activeTool === "eraser") && (
          <BrushSizeContainer>
            <Slider
              value={brushSize}
              onChange={(e, val) => dispatch({ type: "SET_BRUSH_SIZE", payload: val as number })}
              min={1}
              max={50}
              step={1}
              valueLabelDisplay="auto"
            />
          </BrushSizeContainer>
        )}
    </StyledContainer>
    );
};

export default Toolbar;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
`;

const StyledToolbar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #d8d8d8; /* Dark gray background */
  border-radius: 8px;
  border: 1px solid #555;
  width: fit-content;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
`;

const ToolButton = styled.button<{ active?: boolean }>`
  color: ${(props) => (props.active ? "#fff" : "#aaa")};
  background-color: ${(props) => (props.active ? "#555" : "transparent")};
  border: ${(props) => (props.active ? "2px solid #777" : "none")};
  width: 40px;
  height: 40px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #444;
    color: white;
  }
`;

const BrushSizeContainer = styled.div`
  width: 100px;
  display: flex;
  align-items: center;
`;
