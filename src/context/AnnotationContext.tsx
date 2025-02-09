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
  lines: any[];
  classes: Class[];
  activeTool: 'brush' | 'polygon' | 'eraser';
  brushSize: number;
  activeClass: Class;
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
  | { type: "SET_ACTIVE_CLASS"; payload: Class | null };


// Reducer function to update the state
const annotationReducer = (state: AnnotationState, action: Action): AnnotationState => {
  switch (action.type) {
    case "SET_IMAGE":
      return { ...state, image: action.payload };
    case "ADD_POLYGON":
      return { ...state, polygons: [...state.polygons, action.payload] };
    case "ADD_BRUSH_LINE":
      return { ...state, lines: [...state.lines, action.payload] };
    case "UPDATE_LAST_LINE":
      return {
        ...state,
        lines: [...state.lines.slice(0, -1), action.payload] // Replace the last line
      };
    case "SET_CLASSES":
      return { ...state, classes: action.payload };
    case "SET_ACTIVE_TOOL":
      return { ...state, activeTool: action.payload }; // 👈 Now updates the selected tool
    case "SET_BRUSH_SIZE":
      return { ...state, brushSize: action.payload }; // 👈 Now updates the brush size
    case "SET_ACTIVE_CLASS":
      return { ...state, activeClass: action.payload }; // 👈 Now updates the selected annotation class
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
    activeClass: PREDEFINED_CLASSES[0] || null
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
