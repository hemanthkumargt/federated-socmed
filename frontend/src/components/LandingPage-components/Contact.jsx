import React from 'react';
import styled from 'styled-components';

const DarkSection = styled.section`
  width: 100vw;
  padding: 80px 24px 120px;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 40px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 60px;
  font-family: 'Outfit', sans-serif;
  text-shadow: 0 4px 10px rgba(0,0,0,0.8);
`;

const TestimonialsGrid = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 1100px;
  width: 100%;
`;

const TestimonialCard = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 340px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const Quote = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #e2e8f0;
  margin-bottom: 30px;
  flex-grow: 1;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(190, 24, 93, 0.2) 100%);
  color: #f472b6;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 700;
  font-size: 16px;
  color: #f8fafc;
`;

const UserHandle = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const Testimonials = () => {
  return (
    <DarkSection id="testimonials">
      <SectionTitle>What our users are saying</SectionTitle>
      <TestimonialsGrid>
        <TestimonialCard>
          <Quote>"Finally, a social network that feels like a real community again! The immersive theme is top notch."</Quote>
          <UserInfo>
            <Avatar>A</Avatar>
            <UserDetails>
              <UserName>Alice</UserName>
              <UserHandle>@alice@social.network</UserHandle>
            </UserDetails>
          </UserInfo>
        </TestimonialCard>

        <TestimonialCard>
          <Quote>"I love that I can host my own instance and still talk to my friends on the big servers. True freedom in a beautifully designed space."</Quote>
          <UserInfo>
            <Avatar>B</Avatar>
            <UserDetails>
              <UserName>Bob</UserName>
              <UserHandle>@bob@own.server</UserHandle>
            </UserDetails>
          </UserInfo>
        </TestimonialCard>

        <TestimonialCard>
          <Quote>"No ads, no tracking, just pure chronological goodness. This is how the internet should look and feel."</Quote>
          <UserInfo>
            <Avatar>C</Avatar>
            <UserDetails>
              <UserName>Charlie</UserName>
              <UserHandle>@charlie@art.place</UserHandle>
            </UserDetails>
          </UserInfo>
        </TestimonialCard>
      </TestimonialsGrid>
    </DarkSection>
  );
};

export default Testimonials;
