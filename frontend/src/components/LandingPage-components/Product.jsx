import React from 'react';
import styled from 'styled-components';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';


const WHITE = '#FFFFFF';
const INDIGO = '#4F46E5';
const INDIGO_DARK = '#4338CA';
const TEXT_DARK = '#192746';
const TEXT_MUTED = '#475569';
const BG_LIGHT = '#F8FAFC';
const BORDER_LIGHT = '#E5E7EB';


const Section = styled.section`
  width: 100vw;
  min-height: 100vh;
  background-color: ${BG_LIGHT};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: ${TEXT_DARK};
  margin-bottom: 12px;

  span {
    color: ${INDIGO};
  }
`;

const SectionSubtitle = styled.p`
  max-width: 700px;
  text-align: center;
  font-size: 18px;
  line-height: 1.6;
  color: ${TEXT_MUTED};
  margin-bottom: 60px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 40px;
  max-width: 900px;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background-color: ${WHITE};
  border: 1px solid ${BORDER_LIGHT};
  border-radius: 16px;
  padding: 36px 28px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: ${INDIGO};
  }
`;

const IconWrapper = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 12px;

  background-color: rgba(79, 70, 229, 0.1);
  color: ${INDIGO};

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 28px;
  }
`;

const CardTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: ${TEXT_DARK};
`;

const CardDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${TEXT_MUTED};
`;


const Product = () => {
  return (
    <Section id="product">
      <SectionTitle>
        Our <span>Product</span>
      </SectionTitle>

      <SectionSubtitle>
        A federated social networking platform designed for meaningful
        conversations, independent communities, and open collaboration —
        without relying on a single central authority.
      </SectionSubtitle>

      <ProductGrid>
        <ProductCard>
          <IconWrapper>
            <PublicOutlinedIcon style={{ color: '#192746' }} />
          </IconWrapper>

          <CardTitle>Our Mission</CardTitle>
          <CardDescription>
            To create a social network where communities own their data,
            servers operate independently, and users can connect freely
            across platforms without centralized control.
          </CardDescription>
        </ProductCard>

        <ProductCard>
          <IconWrapper>
            <VerifiedOutlinedIcon style={{ color: '#192746' }}/>
          </IconWrapper>

          <CardTitle>Our Values</CardTitle>
          <CardDescription>
            We value openness, privacy, and thoughtful interaction.
            Our platform is built to encourage healthy discussions,
            transparency, and scalable collaboration across communities.
          </CardDescription>
        </ProductCard>
      </ProductGrid>
    </Section>
  );
};

export default Product;
