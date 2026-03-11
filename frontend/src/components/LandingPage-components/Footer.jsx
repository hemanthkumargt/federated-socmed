import React from 'react';
import styled from 'styled-components';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';

/* ===== COLOR TOKENS ===== */
const WHITE = '#FFFFFF';
const DARK_SLATE = '#0F172A';
const TEXT_MUTED = '#94a3b8';
const BORDER_TRANSPARENT = 'rgba(255, 255, 255, 0.1)';

/* ===== STYLED COMPONENTS ===== */

const FooterContainer = styled.footer`
  display: flex;
  flex-direction: column;
  background-color: transparent;
  color: ${WHITE};
  width: 100%;
  font-family: 'Nunito', sans-serif;
  border-top: 1px solid ${BORDER_TRANSPARENT};
  position: relative;
  z-index: 10;
`;

const TopSection = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const SocialMediaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const SocialIconsRow = styled.div`
  display: flex;
  gap: 25px;

  & > svg {
    font-size: 32px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #f472b6;

    &:hover {
      color: ${WHITE};
      transform: translateY(-5px) scale(1.1);
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: ${WHITE};
  font-family: 'Outfit', sans-serif;
`;

const NewsletterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  border-radius: 12px;
  overflow: hidden;
`;

const NewsletterInput = styled.input`
  padding: 14px 20px;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  color: ${WHITE};
  outline: none;
  font-size: 15px;
  width: 280px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #f472b6;
  }
`;

const NewsletterButton = styled.button`
  padding: 14px 28px;
  border: none;
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
  color: ${WHITE};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${BORDER_TRANSPARENT};
  width: 100%;
  margin: 0;
`;

const BottomSection = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
`;

const LinksRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
`;

const FooterLink = styled.a`
  font-size: 15px;
  color: ${TEXT_MUTED};
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    color: #f472b6;
  }
`;

const CopyrightText = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  margin: 5px 0;
  line-height: 1.6;
`;

/* ===== COMPONENT ===== */

const Footer = () => {
  return (
    <FooterContainer>
      <TopSection>
        <SocialMediaContainer>
          <SectionTitle>Connect with us</SectionTitle>
          <SocialIconsRow>
            <FacebookOutlinedIcon />
            <InstagramIcon />
            <XIcon />
            <YouTubeIcon />
          </SocialIconsRow>
        </SocialMediaContainer>

        <NewsletterContainer>
          <SectionTitle>Stay updated</SectionTitle>
          <NewsletterForm onSubmit={(e) => e.preventDefault()}>
            <NewsletterInput placeholder="Enter your email" type="email" />
            <NewsletterButton type="submit">
              Subscribe
            </NewsletterButton>
          </NewsletterForm>
        </NewsletterContainer>
      </TopSection>

      <Divider />

      <BottomSection>
        <LinksRow>
          <FooterLink>About Us</FooterLink>
          <FooterLink>Contact</FooterLink>
          <FooterLink>Privacy Policy</FooterLink>
          <FooterLink>Terms of Service</FooterLink>
        </LinksRow>

        <div>
          <CopyrightText>
            Built as a Software Engineering project — Connect Federated Network
          </CopyrightText>
          <CopyrightText>
            © {new Date().getFullYear()} Connect Project. All rights reserved.
          </CopyrightText>
        </div>
      </BottomSection>
    </FooterContainer>
  );
};

export default Footer;
