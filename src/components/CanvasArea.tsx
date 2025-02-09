import React, { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Image as KonvaImage } from 'react-konva'
import styled from 'styled-components'

interface CanvasAreaProps {
  width?: number
  height?: number
  imageUrl?: string
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  width = 800,
  height = 600,
  imageUrl
}) => {
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null)
  const stageRef = useRef<any>(null)

  useEffect(() => {
    if (!imageUrl) return

    const img = new window.Image()
    img.src = imageUrl
    img.onload = () => {
      setKonvaImage(img)
    }
  }, [imageUrl])

  return (
    <CanvasContainer>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc' }}
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
