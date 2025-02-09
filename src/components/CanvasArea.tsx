import React, { useRef, useEffect, useState, JSX } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva'
import styled from 'styled-components'

interface CanvasAreaProps {
  width?: number
  height?: number
  imageUrl?: string
  activeTool?: 'brush' | 'polygon' | 'eraser'
  activeClass?: { name: string, color: string, id: number }
  brushSize?: number
  lines: any[]
  setLines: React.Dispatch<React.SetStateAction<any[]>>
  polygons: any[]
  setPolygons: React.Dispatch<React.SetStateAction<any[]>>
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  width = 800,
  height = 600,
  imageUrl,
  activeTool,
  activeClass,
  brushSize,
  lines,
  setLines,
  polygons,
  setPolygons
}) => {
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tempPoints, setTempPoints] = useState<number[]>([])

  const stageRef = useRef<any>(null)

  useEffect(() => {
    if (!imageUrl) return

    const img = new window.Image()
    img.src = imageUrl
    img.onload = () => {
      setKonvaImage(img)
    }
  }, [imageUrl])

  const handleBrushMouseDown = (e: any) => {
    if (activeTool !== 'brush') return // Only draw if tool is "brush"
  
    setIsDrawing(true)
  
    // Get current pointer position
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
  
    // Start a new line
    setLines((prevLines) => [
      ...prevLines,
      { 
        points: [point.x, point.y], 
        color: activeClass?.color || '#9C27B0', // example purple
        strokeWidth: brushSize || 4 
      }
    ])
  }

  const handlePolygonClick = (e: any) => {
    if (activeTool !== 'polygon') return
  
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
  
    // If this is the first vertex, or we have no points yet, just add it
    if (tempPoints.length === 0) {
      setTempPoints([point.x, point.y])
      return
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
      setPolygons((prev) => [
        ...prev,
        {
          points: tempPoints,
          color: activeClass?.color || '#9C27B0',
          categoryId: activeClass?.id
        }
      ])
      // Reset tempPoints for a new polygon
      setTempPoints([])
    } else {
      // Otherwise, just add this point to tempPoints
      setTempPoints((prev) => [...prev, point.x, point.y])
    }
  }  

  // const handlePolygonDblClick = () => {
  //   if (activeTool !== 'polygon') return
  
  //   // Only finalize if we have at least 3 points
  //   if (tempPoints.length >= 6) {
  //     setPolygons((prev) => [
  //       ...prev,
  //       {
  //         points: tempPoints,
  //         color: activeClass?.color || '#9C27B0'
  //       }
  //     ])
  //   }
    
  //   setTempPoints([])
  // }  
  
  const handleBrushMouseMove = (e: any) => {
    if (!isDrawing || activeTool !== 'brush') return
  
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
  
    // Last line in the array
    const lastLine = lines[lines.length - 1]
    // Add the new point
    lastLine.points = [...lastLine.points, point.x, point.y]
  
    // Update the state
    setLines([...lines])
  }
  
  const handleBrushMouseUp = () => {
    if (activeTool === 'brush') {
      setIsDrawing(false)
    }
  }

  return (
    <CanvasContainer>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
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
              width={width}
              height={height}
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
