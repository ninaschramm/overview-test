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
  polygons: Polygon[];
  lines: BrushLine[];
  tempPoints: number[];
  activeTool: string;
  brushSize: number;
  // etc.
  historyStack: Array<{
    polygons: Polygon[];
    lines: BrushLine[];
  }>;
  redoStack: Array<{
    polygons: Polygon[];
    lines: BrushLine[];
  }>;
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
      case "ADD_POLYGON": {
        // Actually let's call it "FINISH_POLYGON" for clarity
        const newPolygon = action.payload; // { points, color, categoryId }
        const oldSnapshot = {
          polygons: [...state.polygons],
          lines: [...state.lines],
        };
      
        return {
          ...state,
          polygons: [...state.polygons, newPolygon],
          tempPoints: [],
          redoStack: [],
          historyStack: [...state.historyStack, oldSnapshot], // store old annotation data
        };
      }      
    case "ADD_BRUSH_LINE":
      const newLine = action.payload; // { points, color, strokeWidth, categoryId }
      const oldSnapshot = {
        polygons: [...state.polygons],
        lines: [...state.lines],
      };
      return {
        ...state,
        historyStack: [...state.historyStack, oldSnapshot], // Save history
        redoStack: [],
        lines: [...state.lines, newLine],
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
    case "UNDO": {
      // 1) If we have partial polygon:
      if (state.tempPoints.length > 0) {
        // remove last vertex
        return {
          ...state,
          tempPoints: state.tempPoints.slice(0, -2)
        };
      }
    
      // 2) Otherwise, revert from history
      if (state.historyStack.length > 0) {
        const oldAnnotationData = state.historyStack[state.historyStack.length - 1];
    
        return {
          ...state,
          polygons: oldAnnotationData.polygons,
          lines: oldAnnotationData.lines,
          historyStack: state.historyStack.slice(0, -1) // remove last snapshot
        };
      }
    
      return state;
    }
    case "REDO":
      if (state.redoStack.length === 0) return state; // No redo available

      const nextAnnotationData = state.redoStack[0]; // Get the next saved annotation state

      return {
        ...state,
        polygons: nextAnnotationData.polygons,
        lines: nextAnnotationData.lines,
        historyStack: [...state.historyStack, { polygons: state.polygons, lines: state.lines }], // Save current state
        redoStack: state.redoStack.slice(1), // Remove used redo state
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
