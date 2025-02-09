import React, { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva'
import styled from 'styled-components'

interface CanvasAreaProps {
  width?: number
  height?: number
  imageUrl?: string
  activeTool?: 'brush' | 'polygon' | 'eraser'
  activeClassColor?: string
  brushSize?: number
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  width = 800,
  height = 600,
  imageUrl,
  activeTool,
  activeClassColor,
  brushSize
}) => {
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null)
  const [lines, setLines] = useState<any[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const stageRef = useRef<any>(null)

  useEffect(() => {
    if (!imageUrl) return

    const img = new window.Image()
    img.src = imageUrl
    img.onload = () => {
      setKonvaImage(img)
    }
  }, [imageUrl])

  const handleMouseDown = (e: any) => {
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
        color: activeClassColor || '#9C27B0', // example purple
        strokeWidth: brushSize || 4 
      }
    ])
  }
  
  const handleMouseMove = (e: any) => {
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
  
  const handleMouseUp = () => {
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
