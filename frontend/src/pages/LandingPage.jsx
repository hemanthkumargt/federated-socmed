import React from 'react';
import styled from 'styled-components';

import NavBar from '../components/LandingPage-components/NavBar';
import Explore from '../components/LandingPage-components/Explore';
import FeatureCard from '../components/LandingPage-components/FeatureCard';
import Footer from '../components/LandingPage-components/Footer';

import { featuresData } from '../components/LandingPage-components/featuresData';
import Testimonials from '../components/LandingPage-components/Contact'; // Still exported structurally there

import { createGlobalStyle } from 'styled-components';
import '../styles/LandingPage.css';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Nunito', 'Outfit', sans-serif;
    background: #020617 !important;
    color: #ffffff;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
`;

const Container_LandingPage = styled.div`
  width: 100vw;
  overflow-x: hidden;
  position: relative;
  min-height: 100vh;
`;

const VideoBgGlobal = styled.video`
    position: fixed;
    top: 50%;
    left: 50%;
    min-width: 100vw;
    min-height: 100vh;
    object-fit: cover;
    transform: translate(-50%, -50%);
    z-index: -2;
    opacity: 0.6;
    background: radial-gradient(circle at top right, #1e1b4b, #020617);
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
`;

const FeaturesSection = styled.section`
  width: 100vw;
  padding: 100px 0px;
  background-color: transparent;
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
`;
const FeaturesTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #ffffff;
  margin-bottom: 60px;
  text-align: center;
  text-shadow: 0 4px 10px rgba(0,0,0,0.8);

  span {
    color: #f472b6; // pinkish blue
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  gap: 32px;
  max-width: 1200px;
  width: 100%;
  padding: 0 40px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;


const LandingPage = () => {
  const [bgVideo] = React.useState(() => {
    const wallpapers = [
      "/media/sakura-field-minecraft-moewalls-com-small.mp4",
      "/media/minecraft-sakura-oasis-moewalls-com.mp4",
      "/media/sakura_oasis.mp4",
      "/media/rainy-evening-minecraft.1920x1080.mp4",
      "/media/lakeside.mp4",
      "/media/rainy_evening.mp4"
    ];
    return wallpapers[Math.floor(Math.random() * wallpapers.length)];
  });

  return (
    <Container_LandingPage className="landing-container">
      <GlobalStyle />
      <VideoBgGlobal key={bgVideo} autoPlay loop muted playsInline className="video-bg-fallback">
        <source src={bgVideo} type="video/mp4" />
      </VideoBgGlobal>

      <ContentLayer>
        <NavBar />
        <Explore />

        <FeaturesSection id="features">
          <FeaturesTitle>
            Why <span>Connect?</span>
          </FeaturesTitle>

          <FeaturesGrid className="features-grid">
            {featuresData.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </FeaturesGrid>
        </FeaturesSection>
        
        <Testimonials />
        <Footer />
      </ContentLayer>
    </Container_LandingPage>
  );
};

export default LandingPage;
