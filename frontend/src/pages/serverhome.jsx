import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ServerHeader from '../components/ServerHeader';
import ServerList from '../components/ServerList';
import { servers, categories as initialCategories } from '../data/data';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: transparent !important;
  }
`;

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100vw;
  font-family: 'Nunito', sans-serif;
`;

const VideoBg = styled.video`
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 100vw;
  min-height: 100vh;
  width: auto;
  height: auto;
  z-index: 1;
  transform: translate(-50%, -50%);
  object-fit: cover;
  opacity: 1;
`;

const ContentOverlay = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 48px 64px;
  overflow-y: auto;
  height: calc(100vh - 40px);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

function Home() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Rainy evening Minecraft — as requested for the Servers page
    const bgVideo = "/media/sakura-field-minecraft-moewalls-com-small.mp4";

    // Calculate counts dynamically based on servers list
    const categoriesWithCounts = useMemo(() => {
        return initialCategories.map(cat => {
            let count = 0;
            if (cat.id === 'all') {
                count = servers.length;
            } else {
                count = servers.filter(s => s.category === cat.id).length;
            }
            return { ...cat, count };
        });
    }, []);

    const filteredServers = selectedCategory === 'all'
        ? servers
        : servers.filter(server => server.category === selectedCategory);

    return (
        <PageWrapper>
            <GlobalStyle />
            <VideoBg key={bgVideo} autoPlay loop muted playsInline>
              <source src={bgVideo} type="video/mp4" />
            </VideoBg>
            <ContentOverlay>
                <Sidebar
                    categories={categoriesWithCounts}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                <MainContent>
                    <ServerHeader />
                    <ServerList servers={filteredServers} />
                </MainContent>
            </ContentOverlay>
        </PageWrapper>
    );
}

export default Home;

