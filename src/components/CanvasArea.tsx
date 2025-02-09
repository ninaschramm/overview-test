import React, { useRef, useEffect, useState, JSX } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva'
import styled from 'styled-components'
import { useAnnotation } from '../context/AnnotationContext.tsx'

const CanvasArea: React.FC = () => {
  const { state, dispatch } = useAnnotation()
  const { image, activeTool, activeClass, brushSize, lines, polygons, tempPoints } = state;

  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const stageRef = useRef<any>(null)

  useEffect(() => {
    if (!image.file) return;

    const img = new window.Image();
    img.src = image.file;
    img.onload = () => {
      setKonvaImage(img);
    };
  }, [image.file]);

  const handleBrushMouseDown = (e: any) => {
    if (activeTool !== 'brush') return // Only draw if tool is "brush"
  
    setIsDrawing(true)
  
    // Get current pointer position
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
  
    // Start a new line
    dispatch({
      type: 'ADD_BRUSH_LINE',
      payload: {
        points: [point.x, point.y],
        color: activeClass?.color || '#9C27B0',
        strokeWidth: brushSize || 4,
        categoryId: activeClass?.id
      }
    });
  };

  const handleBrushMouseMove = (e: any) => {
    if (!isDrawing || activeTool !== 'brush') return
  
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
    if (activeTool === 'brush') {
      setIsDrawing(false)
    }
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
          {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            opacity={0.5}
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
}

export default CanvasArea

const CanvasContainer = styled.div`
  width: 600px;
  height: 500px;
  border: 2px solid #000;

  @media (max-width: 430px) {
    width: 100%;
  }
`
