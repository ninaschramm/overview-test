import React from 'react'
import CanvasArea from '../components/CanvasArea.tsx'
import Toolbar from '../components/Toolbar.tsx'
import ImageSelector from '../components/ImageSelector.tsx'
import { Select, MenuItem, Button } from '@mui/material'
import { useAnnotation } from '../context/AnnotationContext.tsx'
import { useNavigate } from 'react-router-dom'

const AnnotationPage: React.FC = () => {
  const { state, dispatch } = useAnnotation();
  const { activeClass, classes } = state;
  const navigate = useNavigate();

  return (
    <div style={{ margin: '20px' }}>
      <h1>Annotation Page</h1>
      <Toolbar />
      <Select
        value={activeClass ? activeClass.id : ""}
        onChange={(e) => {
          const selectedClass = classes.find((cl) => cl.id === e.target.value);
          if (selectedClass) {
            dispatch({ type: "SET_ACTIVE_CLASS", payload: selectedClass });
          }
        }}
        style={{ marginRight: "1rem" }}
      >
        {classes.map((cl) => (
          <MenuItem key={cl.id} value={cl.id}>
            {cl.name}
          </MenuItem>
        ))}
      </Select>
      <ImageSelector />
      <CanvasArea />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate("/export")}
        style={{ marginTop: "20px" }}
      >
        Export Annotations
      </Button>
    </div>
  )
}

export default AnnotationPage
