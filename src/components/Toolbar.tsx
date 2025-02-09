// Toolbar.tsx (using MUI)
import React from 'react'
import { IconButton } from '@mui/material'
import BrushIcon from '@mui/icons-material/Brush'
import PolylineIcon from '@mui/icons-material/Polyline'
import DeleteIcon from '@mui/icons-material/Delete'
import { Slider } from '@mui/material'
import { useAnnotation } from '../context/AnnotationContext.tsx'



const Toolbar: React.FC = () => {
  const { state, dispatch } = useAnnotation()
  const { activeTool, brushSize } = state

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <IconButton 
        color={activeTool === 'brush' ? 'primary' : 'default'}
        onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', payload: 'brush' })}
      >
        <BrushIcon />
      </IconButton>
      <IconButton 
        color={activeTool === 'polygon' ? 'primary' : 'default'}
        onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', payload: 'polygon' })}
      >
        <PolylineIcon />
      </IconButton>
      <IconButton 
        color={activeTool === 'eraser' ? 'primary' : 'default'}
        onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', payload: 'eraser' })}
      >
        <DeleteIcon />
      </IconButton>
      {activeTool === 'brush' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label>Brush Size</label>
          <Slider
            value={brushSize}
            onChange={(e, val) => dispatch({ type: 'SET_BRUSH_SIZE', payload: val as number })}
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
