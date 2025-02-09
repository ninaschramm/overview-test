import React, { createContext, useReducer, useContext } from "react";

// Define types
interface ImageFile {
  file: string | null;
  dimensions: { width: number; height: number };
}

interface Polygon {
  points: number[];
  categoryId: number;
  color: string;
}

interface BrushLine {
  points: number[];
  color: string;
  strokeWidth: number;
  categoryId: number;
}

interface Class {
  id: number;
  name: string;
  color: string;
}

// For testing purposes
const SAMPLE_IMAGE = "https://images.ctfassets.net/8j5aqoy0ts8s/6z7MzieJ83Qz6MYqTRGGC6/7f925f3ab696ab8aab84a120846f34fb/saturated-colors-960px_3x.png";

const PREDEFINED_CLASSES: Class[] = [
  { name: 'Car', color: '#ff0000', id: 1 },
  { name: 'Person', color: '#00ff00', id: 2 },
  { name: 'Tree', color: '#0000ff', id: 3 }
]

// Define the global state
interface AnnotationState {
  image: ImageFile;
  polygons: Polygon[];
  lines: BrushLine[];
  classes: Class[];
  activeTool: 'brush' | 'polygon' | 'eraser';
  brushSize: number;
  activeClass: Class;
  historyStack: AnnotationState[];
  redoStack: AnnotationState[];
  tempPoints: number[];
}

// Define actions
type Action =
  | { type: "SET_IMAGE"; payload: ImageFile }
  | { type: "ADD_POLYGON"; payload: Polygon }
  | { type: "ADD_BRUSH_LINE"; payload: any }
  | { type: "UPDATE_LAST_LINE"; payload: any }
  | { type: "SET_CLASSES"; payload: Class[] }
  | { type: "SET_ACTIVE_TOOL"; payload: "brush" | "polygon" | "eraser" }
  | { type: "SET_BRUSH_SIZE"; payload: number }
  | { type: "SET_ACTIVE_CLASS"; payload: Class | null }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_TEMP_POINTS"; payload: number[] };

const log = console.log
// Reducer function to update the state
const annotationReducer = (state: AnnotationState, action: Action): AnnotationState => {
  switch (action.type) {
    case "SET_IMAGE":
      return { ...state, image: action.payload };
    case "ADD_POLYGON":
      return {
        ...state,
        tempPoints: [], // Clear temp points,
        historyStack: [...state.historyStack, state], // Save history
        redoStack: [], // Clear redo when new action happens
        polygons: [...state.polygons, action.payload],
      };
    case "ADD_BRUSH_LINE":
      return {
        ...state,
        historyStack: [...state.historyStack, state], // Save history
        redoStack: [],
        lines: [...state.lines, action.payload],
      };
    case "UPDATE_LAST_LINE":
      return {
        ...state,
        lines: [...state.lines.slice(0, -1), action.payload]
      };
    case "SET_CLASSES":
      return { ...state, classes: action.payload };
    case "SET_ACTIVE_TOOL":
      return { ...state, activeTool: action.payload };
    case "SET_BRUSH_SIZE":
      return { ...state, brushSize: action.payload };
    case "SET_ACTIVE_CLASS":
      return { ...state, activeClass: action.payload };
    case "UNDO":
      if (state.activeTool === "polygon") {
        if (state.tempPoints.length > 0) {
          // If we're still drawing, remove ONLY the last vertex
          return { 
            ...state, 
            tempPoints: state.tempPoints.slice(0, -2) 
          };
        } else if (state.polygons.length > 0) {
          // If polygon is completed, remove it COMPLETELY (no history saving)
          return {
            ...state,
            polygons: state.polygons.slice(0, -1), // Remove last polygon
            tempPoints: [], // Ensure tempPoints are cleared
          };
        }
      } 

      if (state.historyStack.length > 0) {
        // Standard undo logic for brush strokes and finalized polygons
        const prevState = state.historyStack[state.historyStack.length - 1];
        return {
          ...prevState,
          redoStack: [state, ...state.redoStack], // Push current state to redo stack
          historyStack: state.historyStack.slice(0, -1), // Remove last history entry
          tempPoints: [], // Make sure no stray tempPoints remain
        };
      }

      return state;

    case "REDO":
      if (state.redoStack.length === 0) return state; // Nothing to redo

      const nextState = state.redoStack[0];
      return {
        ...nextState,
        historyStack: [...state.historyStack, state], // Save current state in history stack
        redoStack: state.redoStack.slice(1), // Remove next redo state
      };
    case "SET_TEMP_POINTS":
      log("SET_TEMP_POINTS", action.payload)
      return {
        ...state,
        tempPoints: action.payload
      };
    default:
      return state;
  }
};

// Create context
const AnnotationContext = createContext<
  { state: AnnotationState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

// Provider component
export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(annotationReducer, {
    image: { file: SAMPLE_IMAGE, dimensions: { width: 600, height: 400 } },
    polygons: [],
    lines: [],
    classes: PREDEFINED_CLASSES,
    activeTool: "brush",
    brushSize: 4,
    activeClass: PREDEFINED_CLASSES[0] || null,
    historyStack: [],
    redoStack: [],
    tempPoints: []
  });

  return <AnnotationContext.Provider value={{ state, dispatch }}>{children}</AnnotationContext.Provider>;
};

// Custom hook to use the context
export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error("useAnnotation must be used within an AnnotationProvider");
  }
  return context;
};
