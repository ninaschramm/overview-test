import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SetupPage from "./pages/SetupPage.tsx";
import AnnotationPage from "./pages/AnnotationPage.tsx";
import React from "react";
import ExportPage from "./pages/ExportPage.tsx";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import theme from './styles/theme.ts'
import { AnnotationProvider } from "./context/AnnotationContext.tsx";
import Layout from "./components/Layout.tsx";

function App() {
  return (
    <StyledThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        <AnnotationProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<SetupPage />} />
                <Route path="/annotate" element={<AnnotationPage />} />
                <Route path="/export" element={<ExportPage />} />
              </Routes>
            </Layout>
          </Router>
        </AnnotationProvider>
      </MuiThemeProvider>
    </StyledThemeProvider>
  );
}

export default App;
