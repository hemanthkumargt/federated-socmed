import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import Header from './Header';

const GlobalAuthStyle = createGlobalStyle`
  body {
    background: transparent !important;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

const AppWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const VideoBg = styled.video`
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 100vw;
  min-height: 100vh;
  width: auto;
  height: auto;
  z-index: -1;
  transform: translate(-50%, -50%);
  object-fit: cover;
  opacity: 1;
`;

const GlassContainer = styled.div`
  display: grid;
  grid-template-areas: 
    "sidebar-left global-header sidebar-right"
    "sidebar-left main-content sidebar-right";
  grid-template-columns: 280px 1.2fr 340px;
  grid-template-rows: 90px 1fr;
  gap: 24px;
  height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background: transparent;
  position: relative;
  z-index: 1;

  @media (max-width: 1200px) {
    grid-template-columns: 240px 1fr 300px;
  }

  @media (max-width: 992px) {
    grid-template-areas: 
      "global-header"
      "main-content";
    grid-template-columns: 1fr;
    grid-template-rows: 90px 1fr;
    padding: 16px;
  }
`;

const MainScrollArea = styled.main`
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`;

const wallpapers = [
  "/media/rainy-evening-minecraft.1920x1080.mp4"
];

const Layout = ({ children }) => {
  const [bgVideo, setBgVideo] = React.useState("");

  React.useEffect(() => {
    // Randomize on mount
    const randomWP = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    setBgVideo(randomWP);
    document.body.style.backgroundColor = "#020617";
  }, []);

  return (
    <AppWrapper>
      <GlobalAuthStyle />
      {bgVideo && (
        <VideoBg key={bgVideo} autoPlay loop muted playsInline>
          <source src={bgVideo} type="video/mp4" />
        </VideoBg>
      )}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255, 255, 255, 0.45)', zIndex: 0 }}></div>
      <GlassContainer className="app-container">
        <SidebarLeft />
        <Header />
        <MainScrollArea className="main-content">
          {children}
        </MainScrollArea>
        <SidebarRight />
      </GlassContainer>
    </AppWrapper>
  );
};

export default Layout;