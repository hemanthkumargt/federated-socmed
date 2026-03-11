import styled from "styled-components"
import { Link } from 'react-router-dom'

const HeroContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 20px 80px;
    width: 100vw;
    min-height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
    background-color: transparent;
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const TagLine = styled.h1`
    font-size: 72px;
    font-weight: 800;
    margin-bottom: 20px;
    color: #ffffff;
    text-align: center;
    line-height: 1.1;
    max-width: 900px;
    font-family: 'Outfit', sans-serif;
    text-shadow: 0 4px 20px rgba(0,0,0,0.8);

    @media (max-width: 768px) {
        font-size: 48px;
    }
`;

const SupportingText = styled.p`
    font-size: 22px;
    margin-bottom: 60px;
    line-height: 1.6;
    color: #f1f5f9;
    text-align: center;
    max-width: 700px;
    font-weight: 500;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const ActionCardsContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 600px;
    width: 100%;
    margin-top: 20px;
`;

const ActionCard = styled.div`
    flex: 1;
    min-width: 300px;
    max-width: 450px;
    background: rgba(15, 23, 42, 0.65); /* Increased for better contrast */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 24px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        background: rgba(30, 41, 59, 0.6);
        border-color: rgba(255, 255, 255, 0.4);
        box-shadow: 0 25px 50px rgba(0,0,0,0.6);
    }
`;

const CardTitle = styled.h3`
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 16px 0;
    font-family: 'Space Grotesk', sans-serif;
`;

const CardDescription = styled.p`
    font-size: 16px;
    color: #e2e8f0;
    line-height: 1.6;
    margin-bottom: 30px;
    flex-grow: 1;
`;

const PrimaryButton = styled(Link)`
    display: inline-block;
    padding: 16px 32px;
    background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
    color: #ffffff;
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
    border-radius: 12px;
    text-align: center;
    transition: all 0.2s;
    border: none;
    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);

    &:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6);
    }
`;

const SecondaryButton = styled(Link)`
    display: inline-block;
    padding: 16px 32px;
    background: transparent;
    color: #ffffff;
    text-decoration: none;
    font-weight: 700;
    font-size: 16px;
    border-radius: 12px;
    text-align: center;
    transition: all 0.2s;
    border: 2px solid rgba(255, 255, 255, 0.3);

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.6);
    }
`;

const Explore = () => {
    return (
        <HeroContainer id="home">
            <ContentWrapper>
                <TagLine>Shape Your Reality.</TagLine>
                <SupportingText>Connect, build, and explore across independent communities. You own your data, your rules, and your vibrant network.</SupportingText>
                
                <ActionCardsContainer className="hero-action-container">
                    <ActionCard className="hero-glass-card">
                        <CardTitle style={{ fontSize: '36px', marginBottom: '20px' }}>Welcome to the Realm</CardTitle>
                        <CardDescription style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>
                            Experience the next evolution of social networking. Immersive, decentralized, and entirely yours.
                        </CardDescription>
                        <PrimaryButton to="/servers" style={{ fontSize: '18px', padding: '18px 48px', borderRadius: '14px' }}>
                            Start Your Adventure
                        </PrimaryButton>
                    </ActionCard>
                </ActionCardsContainer>
            </ContentWrapper>
        </HeroContainer>
    )
}

export default Explore;