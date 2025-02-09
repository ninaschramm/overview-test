import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import SetupPage from "./pages/SetupPage.tsx";
import AnnotationPage from "./pages/AnnotationPage.tsx";
import React from "react";
// import ExportPage from "./pages/ExportPage.tsx";
import { ThemeProvider } from '@mui/material/styles'
import theme from './styles/theme.ts'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* <Route path="/" element={<SetupPage />} /> */}
          <Route path="/annotate" element={<AnnotationPage />} />
          {/* <Route path="/export" element={<ExportPage />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
