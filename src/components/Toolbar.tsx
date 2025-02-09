// Toolbar.tsx (using MUI)
import React from 'react'
import { IconButton } from '@mui/material'
import BrushIcon from '@mui/icons-material/Brush'
import PolylineIcon from '@mui/icons-material/Polyline'
import DeleteIcon from '@mui/icons-material/Delete'
import { Slider } from '@mui/material'

interface ToolbarProps {
  currentTool: string
  onToolChange: (tool: string) => void
  brushSize: number
  onBrushSizeChange: (size: number) => void 
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  currentTool, 
  onToolChange,
  brushSize,
  onBrushSizeChange
 }) => {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <IconButton 
        color={currentTool === 'brush' ? 'primary' : 'default'}
        onClick={() => onToolChange('brush')}
      >
        <BrushIcon />
      </IconButton>
      <IconButton 
        color={currentTool === 'polygon' ? 'primary' : 'default'}
        onClick={() => onToolChange('polygon')}
      >
        <PolylineIcon />
      </IconButton>
      <IconButton 
        color={currentTool === 'eraser' ? 'primary' : 'default'}
        onClick={() => onToolChange('eraser')}
      >
        <DeleteIcon />
      </IconButton>
      {currentTool === 'brush' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label>Brush Size</label>
          <Slider
            value={brushSize}
            onChange={(e, val) => onBrushSizeChange(val as number)}
            min={1}
            max={50}
            step={1}
            valueLabelDisplay="auto"
            style={{ width: 100 }}
          />
        </div>
      )}
    </div>
  )
}

export default Toolbar
