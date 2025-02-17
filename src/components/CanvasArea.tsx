import React, { useRef, useEffect, useState, JSX, forwardRef, useMemo } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva'
import styled from 'styled-components'
import { useAnnotation } from '../context/AnnotationContext.tsx'

const CanvasArea = forwardRef((props, ref) => {
  const { state, dispatch, setCanvasRef } = useAnnotation()
  const { activeTool, activeClass, brushSize, lines, polygons, tempPoints, selectedImage } = state;

  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null)
  const isDrawing = useRef(false)
  const stageRef = useRef<any>(null);
  
  const filteredLines = useMemo(() => {
    return lines.filter(line => line.imageId === selectedImage?.id);
  }, [lines, selectedImage]);
  
  const filteredPolygons = useMemo(() => {
    return polygons.filter(poly => poly.imageId === selectedImage?.id);
  }, [polygons, selectedImage]);


  useEffect(() => {
    if (!selectedImage || !selectedImage.file ) return;
    const img = new window.Image();
    img.src = selectedImage.file;
    img.onload = () => {
      setKonvaImage(img);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (stageRef.current) {
      setCanvasRef(stageRef);
    }
  }, [setCanvasRef]);
  
  // useEffect(() => {
  //   if (selectedImage?.dimensions.width && selectedImage?.dimensions.height) {
  //     const { polygonMasks, brushMasks } = getPixelData();
  //     setPolygonMasks(polygonMasks);
  //     setBrushMasks(brushMasks);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [polygons, lines]);

  const handleBrushMouseDown = (e: any) => {
    if (activeTool !== 'brush' && activeTool !== 'eraser') return // Only draw if tool is "brush"
  
    isDrawing.current = true
  
    // Get current pointer position
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    const categoryId = activeTool === 'eraser' ? 0 : activeClass?.id
    // Start a new line
    dispatch({
      type: 'ADD_BRUSH_LINE',
      payload: {
        points: [point.x, point.y],
        color: activeClass?.color || '#9C27B0',
        strokeWidth: brushSize || 4,
        categoryId,
        erase: activeTool === "eraser",
        imageId: selectedImage?.id,
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
          color: activeClass?.color || '#9C27B0',
          imageId: selectedImage?.id,
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
        width={selectedImage?.dimensions.width}
        height={selectedImage?.dimensions.height}
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
              width={selectedImage?.dimensions.width}
              height={selectedImage?.dimensions.height}
            />
          )}
        </Layer>
        <Layer>
          {filteredLines.map((line, i) => (
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
        {filteredPolygons.map((poly, i) => (
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
  max-width: 700px;
  width: fit-content;
  height: fit-content;
  border: 2px solid #000;

  @media (max-width: 430px) {
    width: 100%;
  }
`
