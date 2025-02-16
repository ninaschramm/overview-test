import { Stage } from "konva/lib/Stage";
import React, { createContext, useReducer, useContext, useRef, useState } from "react";

// Define types
export interface ImageFile {
  id: number;
  file: string | null;
  dimensions: { width: number; height: number };
  name?: string;
}

interface Polygon {
  id: number;
  imageId: number;
  points: number[];
  rle: number[]; // RLE-encoded binary mask
  width: number;
  height: number;
  // bbox: [number, number, number, number]; // Bounding box [x, y, width, height]
  categoryId: number;
  color: string;
}

interface BrushLine {
  id: number;
  imageId: number;
  erase: any;
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
// const SAMPLE_IMAGE = "https://images.ctfassets.net/8j5aqoy0ts8s/6z7MzieJ83Qz6MYqTRGGC6/7f925f3ab696ab8aab84a120846f34fb/saturated-colors-960px_3x.png";

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
  activeClass: Class | null;
  images: ImageFile[];
  selectedImage: ImageFile | null;
  historyStack: Array<{
    polygons: Polygon[];
    lines: BrushLine[];
  }>;
  redoStack: Array<{
    polygons: Polygon[];
    lines: BrushLine[];
  }>;
  classes: Class[];
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
  | { type: "SET_TEMP_POINTS"; payload: number[] }
  | { type: "ADD_IMAGE"; payload: ImageFile }
  | { type: "SET_SELECTED_IMAGE"; payload: ImageFile | null }
  | { type: "REMOVE_IMAGE"; payload: string }
  | { type: "ADD_CLASS"; payload: Class }
  | { type: "REMOVE_CLASS"; payload: number };

// Reducer function to update the state
const annotationReducer = (state: AnnotationState, action: Action): AnnotationState => {
  switch (action.type) {
    case "ADD_POLYGON": {
      const newPolygon = {
        ...action.payload,
        id: state.polygons.length + state.lines.length + 1,
      };

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
      const newLine = {
        ...action.payload,
        id: state.polygons.length + state.lines.length + 1,
      };
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
    // case "REDO":
    //   if (state.redoStack.length === 0) return state; // No redo available

    //   const nextAnnotationData = state.redoStack[0]; // Get the next saved annotation state

    //   return {
    //     ...state,
    //     polygons: nextAnnotationData.polygons,
    //     lines: nextAnnotationData.lines,
    //     historyStack: [...state.historyStack, { polygons: state.polygons, lines: state.lines }], // Save current state
    //     redoStack: state.redoStack.slice(1), // Remove used redo state
    //   };
    case "SET_TEMP_POINTS":
      return {
        ...state,
        tempPoints: action.payload
      };
    case "ADD_IMAGE":
      return { ...state, images: [...state.images, action.payload] };
    case "SET_SELECTED_IMAGE":
      return { ...state, selectedImage: action.payload }; 
    case "REMOVE_IMAGE":
      return { ...state, images: state.images.filter(img => img.file !== action.payload) };
    case "ADD_CLASS":
      return { ...state, classes: [...state.classes, action.payload] };
    case "REMOVE_CLASS":
      return { ...state, classes: state.classes.filter(cls => cls.id !== action.payload) };
    default:
      return state;
  }
};

// Create context
const AnnotationContext = createContext<
  { 
    state: AnnotationState;
    dispatch: React.Dispatch<Action>;
    canvasRef: React.RefObject<Stage | null>;
    setCanvasRef: (ref: React.RefObject<Stage | null>) => void;
    brushMasks: ImageData[]; // Add brushMasks
    polygonMasks: ImageData[]; // Add polygonMasks
    setBrushMasks: (masks: ImageData[]) => void; // Add setBrushMasks
    setPolygonMasks: (masks: ImageData[]) => void; // Add setPolygonMasks
  } | undefined
>(undefined);

// Provider component
export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<Stage | null>(null);
  const setCanvasRef = (ref: any) => {
    canvasRef.current = ref.current;
  };
  const [brushMasks, setBrushMasks] = useState<ImageData[]>([])
  const [polygonMasks, setPolygonMasks] = useState<ImageData[]>([])
  const [state, dispatch] = useReducer(annotationReducer, {
    images: [],
    selectedImage: null,
    polygons: [],
    lines: [],
    classes: PREDEFINED_CLASSES,
    activeTool: "brush",
    brushSize: 4,
    activeClass: PREDEFINED_CLASSES[0] || null,
    historyStack: [],
    redoStack: [],
    tempPoints: [],
  });

  return <AnnotationContext.Provider value={{ state, dispatch, canvasRef, setCanvasRef, brushMasks, setBrushMasks, polygonMasks, setPolygonMasks }}>{children}</AnnotationContext.Provider>;
};

// Custom hook to use the context
export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error("useAnnotation must be used within an AnnotationProvider");
  }
  return context;
};
