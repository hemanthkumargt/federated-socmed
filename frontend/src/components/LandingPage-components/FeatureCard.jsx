import React from 'react';
import styled from 'styled-components';

const WHITE = '#FFFFFF';
const INDIGO = '#4F46E5';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#475569';
const BORDER_LIGHT = '#E5E7EB';

const Card = styled.div`
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  display: flex;
  flex-direction: column;
  gap: 16px;

  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;

  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(190, 24, 93, 0.2) 100%);
  border: 1px solid rgba(244, 114, 182, 0.3);

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 28px;
    color: #f472b6;
  }
`;

const Title = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #94a3b8;
  margin: 0;
`;

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <Card>
      <IconWrapper>
        <Icon />
      </IconWrapper>

      <Title>{title}</Title>
      <Description>{description}</Description>
    </Card>
  );
};


export default FeatureCard;
