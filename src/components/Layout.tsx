import React from "react";
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { NavLink } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import UploadIcon from "@mui/icons-material/Upload";
import styled from "styled-components";
import { useTheme } from "@mui/material/styles";

const menuItems = [
  { label: "Setup", path: "/", icon: <HomeIcon /> },
  { label: "Annotate", path: "/annotate", icon: <EditIcon /> },
  { label: "Export", path: "/export", icon: <UploadIcon /> },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect small screens

  return (
    <StyledLayout>
      {/* Header */}
      <StyledHeader position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap>
            Annotation Tool
          </Typography>
        </Toolbar>
      </StyledHeader>

      {isMobile ? (
        // **BOTTOM NAV MODE ON MOBILE**
        <BottomNavigation
          showLabels={false}
          sx={{ position: "fixed", bottom: 0, left: 0, width: "100%", backgroundColor: theme.palette.primary.main, zIndex: theme.zIndex.drawer + 1 }}
        >
          {menuItems.map(({ label, path, icon }) => (
            <BottomNavigationAction key={path} component={NavLink} to={path} icon={icon} />
          ))}
        </BottomNavigation>
      ) : (
        // **SIDEBAR MODE**
        <StyledSidebar variant="permanent">
          <Toolbar /> {/* Pushes content below header */}
          <List>
            {menuItems.map(({ label, path, icon }) => (
              <ListItem key={path} disablePadding>
                <ListItemButton component={StyledNavLink} to={path}>
                  <ListItemIcon sx={{ color: "inherit" }}>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </StyledSidebar>
      )}

      {/* Main Content */}
      <StyledContent style={{ 
        marginBottom: isMobile ? "56px" : "0", 
        marginLeft: isMobile? "0" : drawerWidth,
        height: isMobile? "calc(100dvh - 113px)" : "calc(100dvh - 56px)",
        }}>{children}</StyledContent>
    </StyledLayout>
  );
};

export default Layout;

const drawerWidth = 160;

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled(AppBar)(({ theme }) => ({
  zIndex: `${theme.zIndex.drawer + 1} !important`, // Force it to be above Drawer
  backgroundColor: theme.palette.primary.main,
}));


const StyledSidebar = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: "2px 0 5px rgba(0, 0, 0, 0.2)",
  },
}));

const StyledContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  marginTop: theme.mixins.toolbar.minHeight,
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "10px",
  "&.active": {
    fontWeight: "bold",
    backgroundColor: theme.palette.primary.dark,
  },
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
  },
}));
