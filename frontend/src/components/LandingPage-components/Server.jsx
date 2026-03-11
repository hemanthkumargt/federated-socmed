import React from 'react';
import styled from 'styled-components';
import Image3 from '../../Images/Image3.png';
import Image4 from '../../Images/Image4.png';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


/* ===== COLORS ===== */
const WHITE = '#FFFFFF';
const INDIGO = '#4F46E5';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#475569';
const BG_LIGHT = '#F8FAFC';

/* ===== LAYOUT ===== */

const Section = styled.section`
  width: 100vw;
  padding: 100px 0px;
  background-color: ${BG_LIGHT};
    overflow-x: hidden;

  display: flex;
  justify-content: center;
`;

const Container_Server = styled.div`
  max-width: 1200px;
  width: 100%;

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 60px;
  }
`;


const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Title = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: ${TEXT_DARK};

  span {
    color: ${INDIGO};
  }
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: ${TEXT_MUTED};
`;

const Points = styled.ul`
  margin-top: 12px;
  padding-left: 18px;
  color: ${TEXT_MUTED};

  li {
    margin-bottom: 10px;
    font-size: 16px;
  }
`;


const ImagesWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 420px;

  @media (max-width: 900px) {
    height: 360px;
  }
`;

const ImageOne = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 70%;
  height: 100%;
  object-fit: cover;

  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease-in-out;


  &:hover {
    transform: scale(1.03);
  }
`;

const ImageTwo = styled.img`
  position: absolute;
  bottom: -20px;
  right: 0;
  width: 65%;
  height: 85%;
  object-fit: cover;

  border-radius: 16px;
  border: 6px solid ${WHITE};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.03);
  }
`;

const ButtonWrapper = styled.div`
  margin-top: 28px;
`;

const LearnMoreButton = styled.a`
  display: inline-block;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;

  background-color: ${INDIGO};
  color: ${WHITE};
  border-radius: 12px;

  transition: all 0.25s ease;

  &:hover {
    background-color: #3f38bc;
    transform: translateY(-2px);
  }
`;

/* ===== COMPONENT ===== */

const ServersSection = () => {
  return (
    <Section id="servers">
      <Container_Server>
        <Content>
          <Title>
            Communities Powered by <span>Servers</span>
          </Title>

          <Description>
            Every community on the platform runs on its own server.
            Servers operate independently while still being able to
            communicate with one another.
          </Description>

          <Description>
            Users choose a home server, join communities, and interact
            across servers without a single central authority controlling
            the entire network.
          </Description>

          <Points>
            <li>Each server hosts its own community and data</li>
            <li>Servers communicate securely with each other</li>
            <li>No single server controls the entire platform</li>
            <li>Communities grow independently and naturally</li>
          </Points>

          <ButtonWrapper>
            <LearnMoreButton href="/servers">
              Learn More About Servers <ArrowForwardIcon style={{ verticalAlign: 'middle'}} />
            </LearnMoreButton>
          </ButtonWrapper>
        </Content>

        <ImagesWrapper>
          <ImageOne
            src={Image3}
            alt="Server illustration"
          />
          <ImageTwo
            src={Image4}
            alt="Multiple servers illustration"
          />
        </ImagesWrapper>
      </Container_Server>
    </Section>
  );
};

export default ServersSection;
