import React, { useState } from 'react'
import CanvasArea from '../components/CanvasArea.tsx'
import Toolbar from '../components/Toolbar.tsx'
import { Select, MenuItem } from '@mui/material'

interface AnnotationClass {
  id: number
  name: string
  color: string
}

const PREDEFINED_CLASSES: AnnotationClass[] = [
  { name: 'Car', color: '#ff0000', id: 1 },
  { name: 'Person', color: '#00ff00', id: 2 },
  { name: 'Tree', color: '#0000ff', id: 3 }
]

const AnnotationPage: React.FC = () => {
  const sampleImage = 'https://images.ctfassets.net/8j5aqoy0ts8s/6z7MzieJ83Qz6MYqTRGGC6/7f925f3ab696ab8aab84a120846f34fb/saturated-colors-960px_3x.png'

  const [activeTool, setActiveTool] = useState<'brush' | 'polygon' | 'eraser'>('brush')
  const [activeClassIndex, setActiveClassIndex] = useState<number>(0)
  const [brushSize, setBrushSize] = useState<number>(4)
  const [lines, setLines] = useState<any[]>([])
  const [polygons, setPolygons] = useState<any[]>([])

  return (
    <div style={{ margin: '20px' }}>
      <h1>Annotation Page</h1>
      <Toolbar 
        currentTool={activeTool} 
        onToolChange={(tool) => setActiveTool(tool as 'brush' | 'polygon' | 'eraser')}
        brushSize={brushSize}
        onBrushSizeChange={(size) => setBrushSize(size)}
      />
      <Select
        value={activeClassIndex}
        onChange={(e) => setActiveClassIndex(e.target.value as number)}
        style={{ marginRight: '1rem' }}
      >
        {PREDEFINED_CLASSES.map((cl, index) => (
          <MenuItem key={cl.name} value={index}>
            {cl.name}
          </MenuItem>
        ))}
      </Select>
      <CanvasArea 
        imageUrl={sampleImage}
        width={600}
        height={400}
        activeTool={activeTool}
        activeClass={PREDEFINED_CLASSES[activeClassIndex]}
        brushSize={brushSize}
        lines={lines}
        setLines={setLines}
        polygons={polygons}
        setPolygons={setPolygons}
      />
    </div>
  )
}

export default AnnotationPage
