import React, { useRef, useEffect, useState, JSX, useImperativeHandle, forwardRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva'
import styled from 'styled-components'
import { useAnnotation } from '../context/AnnotationContext.tsx'

const CanvasArea = forwardRef((props, ref) => {
  console.log("🛠️ CanvasArea received ref:", ref);
  const { state, dispatch, setCanvasRef, setBrushMasks, setPolygonMasks } = useAnnotation()
  const { image, activeTool, activeClass, brushSize, lines, polygons, tempPoints } = state;

  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null)
  const isDrawing = useRef(false)
  const stageRef = useRef<any>(null);
  

  useEffect(() => {
    if (!image.file) return;

    const img = new window.Image();
    img.src = image.file;
    img.onload = () => {
      setKonvaImage(img);
    };
  }, [image.file]);

  useEffect(() => {
    if (stageRef.current) {
      setCanvasRef(stageRef);
    }
  }, [setCanvasRef]);
  
  useEffect(() => {
    if (image.dimensions.width && image.dimensions.height) {
      const { brushMasks, polygonMasks } = getPixelData();
      setBrushMasks(brushMasks);
      setPolygonMasks(polygonMasks);
    }
  }, [lines, polygons]);

  const handleBrushMouseDown = (e: any) => {
    if (activeTool !== 'brush' && activeTool !== 'eraser') return // Only draw if tool is "brush"
  
    isDrawing.current = true
  
    // Get current pointer position
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const categoryId = activeTool === 'eraser' ? 0 : activeClass?.id
    console.log('categoryId', categoryId)
    // Start a new line
    dispatch({
      type: 'ADD_BRUSH_LINE',
      payload: {
        points: [point.x, point.y],
        color: activeClass?.color || '#9C27B0',
        strokeWidth: brushSize || 4,
        categoryId,
        erase: activeTool === "eraser"
      }
    });
  };

  const handleBrushMouseMove = (e: any) => {
    if (!isDrawing.current || (activeTool !== "brush" && activeTool !== "eraser")) return
  
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
  
    // Last line in the array
    const lastLine = lines[lines.length - 1]
    // Add the new point
    if (!lastLine) return;
    
    // Add the new point (keeping categoryId)
    const updatedLine = {
      ...lastLine,
      points: [...lastLine.points, point.x, point.y]
    };
  
    // Update the state
    dispatch({ type: 'UPDATE_LAST_LINE', payload: updatedLine });
  }
  
  const handleBrushMouseUp = () => {
    isDrawing.current = false
  }

  const handlePolygonClick = (e: any) => {
    if (activeTool !== 'polygon') return
  
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
  
    // If this is the first vertex, or we have no points yet, just add it
    if (state.tempPoints.length === 0) {
      dispatch({ type: "SET_TEMP_POINTS", payload: [point.x, point.y] });
      return;
    }
  
    // Check distance from new click to the first vertex
    const firstX = tempPoints[0]
    const firstY = tempPoints[1]
  
    const dist = Math.sqrt(
      Math.pow(point.x - firstX, 2) + Math.pow(point.y - firstY, 2)
    )
  
    // Let's pick a threshold in pixels. If user clicks within 10px
    // of the first vertex, we'll consider that "close enough" to close the polygon.
    const CLOSE_THRESHOLD = 10
  
    // If user clicked near the first point AND we have at least 3 vertices (6 coords):
    if (dist < CLOSE_THRESHOLD && tempPoints.length >= 6) {
      // Finalize the polygon
      dispatch({
        type: 'ADD_POLYGON',
        payload: {
          points: tempPoints,
          categoryId: activeClass?.id,
          color: activeClass?.color || '#9C27B0'
        }
      });
      // Reset tempPoints for a new polygon
      dispatch({ type: "SET_TEMP_POINTS", payload: [] });
    } else {
      dispatch({ type: "SET_TEMP_POINTS", payload: [...tempPoints, point.x, point.y] });
    }
  }  

  const getPixelData = (): { brushMasks: ImageData[], polygonMasks: ImageData[] } => {
    console.log("📌 getPixelData() called!");

    if (!image.dimensions) {
      console.warn("⚠️ Image dimensions are not set!");
      return { brushMasks: [], polygonMasks: [] };
    }

    const { width, height } = image.dimensions;

    // Render brush strokes
    const brushMasks = lines.map((line) => renderBrushStrokeToCanvas(line, width, height));

    // Render polygons
    const polygonMasks = polygons.map((poly) => renderPolygonToCanvas(poly, width, height));

    console.log("✅ Converted to masks:", { brushMasks, polygonMasks });

    return { brushMasks, polygonMasks };
  };

  const renderBrushStrokeToCanvas = (line: any, width: number, height: number): ImageData => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
  
    if (!ctx) throw new Error("Could not get canvas context");
  
    // Draw the brush stroke
    ctx.beginPath();
    ctx.moveTo(line.points[0], line.points[1]);
    for (let i = 2; i < line.points.length; i += 2) {
      ctx.lineTo(line.points[i], line.points[i + 1]);
    }
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  
    return ctx.getImageData(0, 0, width, height);
  };
  
  const renderPolygonToCanvas = (poly: any, width: number, height: number): ImageData => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
  
    if (!ctx) throw new Error("Could not get canvas context");
  
    // Draw the polygon
    ctx.beginPath();
    ctx.moveTo(poly.points[0], poly.points[1]);
    for (let i = 2; i < poly.points.length; i += 2) {
      ctx.lineTo(poly.points[i], poly.points[i + 1]);
    }
    ctx.closePath();
    ctx.fillStyle = poly.color;
    ctx.fill();
  
    return ctx.getImageData(0, 0, width, height);
  };
  
  return (
    <CanvasContainer>
      <Stage
        ref={stageRef}
        width={image.dimensions.width}
        height={image.dimensions.height}
        style={{ border: '1px solid #ccc' }}
        onMouseDown={handleBrushMouseDown}
        onMouseMove={handleBrushMouseMove}
        onMouseUp={handleBrushMouseUp}
        onClick={handlePolygonClick}
      >
        <Layer>
          {konvaImage && (
            <KonvaImage
              image={konvaImage}
              x={0}
              y={0}
              width={image.dimensions.width}
              height={image.dimensions.height}
            />
          )}
        </Layer>
        <Layer>
          {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            opacity={line.erase ? 1 : 0.5} 
            globalCompositeOperation= { line.erase ? 'destination-out' : 'source-over' }
          />
        ))}
        {polygons.map((poly, i) => (
          <Line
            key={i}
            points={poly.points}
            fill={poly.color}
            stroke={poly.color}
            closed
            opacity={0.5}
            lineJoin="round"
          />
        ))}
        {tempPoints.length > 2 && (
          <Line
            points={tempPoints}
            fill={activeClass?.color || '#9C27B0'}
            stroke={activeClass?.color || '#9C27B0'}
            closed={false}
            opacity={0.5}
            lineJoin="round"
          />
        )}
        {tempPoints.length > 0 &&
          // For every pair (x, y), render a small Circle
          tempPoints.reduce((acc: JSX.Element[], _, index, arr) => {
            if (index % 2 === 0 && index + 1 < arr.length) {
              const x = arr[index]
              const y = arr[index + 1]
              acc.push(
                <Circle
                  key={`temp-vertex-${index}`}
                  x={x}
                  y={y}
                  radius={4}
                  fill={activeClass?.color || '#9C27B0'}
                  opacity={0.8}
                />
              )
            }
            return acc
          }, [])
        }

        </Layer>
      </Stage>
    </CanvasContainer>
  )
})

export default CanvasArea;

const CanvasContainer = styled.div`
  width: 600px;
  height: 500px;
  border: 2px solid #000;

  @media (max-width: 430px) {
    width: 100%;
  }
`
