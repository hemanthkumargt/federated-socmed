import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { getApiBaseUrl } from "../config/api";
import { FiMail, FiLock, FiUser, FiCalendar, FiArrowRight } from "react-icons/fi";

// Moved getApiBaseUrl inside handled functions to ensure it's always current

// Adding fun sketch/pixel-ish font for headers
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Space+Grotesk:wght@500;700&display=swap');
  
  body {
    font-family: 'Outfit', sans-serif;
    background: transparent !important; /* Force override of the app's global pink bg */
    margin: 0;
    padding: 0;
  }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #020617; /* Fallback for white flash fix */
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: 0;
  opacity: 1;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  width: 900px;
  max-width: 95vw;
  height: 600px;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 32px;
  border: 4px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), inset 0 0 0 2px rgba(255,255,255,0.2);
  overflow: hidden;
  animation: ${float} 6s ease-in-out infinite;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 500px;
    animation: none;
  }
`;

const FormSection = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => (props.$active ? 1 : 0)};
  pointer-events: ${props => (props.$active ? 'auto' : 'none')};
  position: absolute;
  width: 50%;
  height: 100%;
  left: ${props => (props.$isSignUp ? (props.$active ? '50%' : '100%') : (props.$active ? '0' : '-50%'))};
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    position: relative;
    left: 0;
    display: ${props => (props.$active ? 'flex' : 'none')};
  }
`;

const OverlayPanel = styled.div`
  position: absolute;
  top: 0;
  left: ${props => (props.$isSignUp ? '0' : '50%')};
  width: 50%;
  height: 100%;
  background: rgba(14, 13, 33, 0.7); /* Deepened for visibility */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px;
  color: white;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-sizing: border-box;
  backdrop-filter: blur(15px);
  border-left: ${props => props.$isSignUp ? 'none' : '2px solid rgba(255,255,255,0.1)'};
  border-right: ${props => props.$isSignUp ? '2px solid rgba(255,255,255,0.1)' : 'none'};

  @media (max-width: 768px) {
    display: none; // hide side panel on mobile to save space
  }
`;

const Title = styled.h2`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: ${props => (props.$dark ? '#ffffff' : '#ffffff')};
  margin-bottom: 8px;
  text-shadow: ${props => props.$dark ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'};
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => (props.$dark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)')};
  margin-bottom: 32px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 16px;
  width: 100%;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 14px 14px 45px;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: #ec4899;
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: #ec4899;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);

  &:hover {
    background: #db2777;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #f472b6;
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const OutlineButton = styled(Button)`
  background: transparent;
  border: 2px solid white;
  box-shadow: none;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.5);
  color: #86efac;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
`;

const AnimatedLogo = styled.div`
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  transform: rotate(-5deg);
  animation: ${float} 3s ease-in-out infinite;
`;

const RealmSwitcher = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px;
  border-radius: 12px;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
`;

const RealmBtn = styled.button`
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$active ? '#ec4899' : 'transparent'};
  color: white;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.$active ? 1 : 0.6};

  &:hover {
    background: ${props => props.$active ? '#ec4899' : 'rgba(255, 255, 255, 0.1)'};
    opacity: 1;
  }
`;

const AuthPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginData, setLoginData] = useState({ displayName: "", password: "" });
  const [signupData, setSignupData] = useState({
    displayName: "", firstName: "", lastName: "", dob: "", email: "", password: ""
  });

  const handleLoginChange = (e) => { setLoginData({ ...loginData, [e.target.name]: e.target.value }); setError(""); };
  const handleSignupChange = (e) => { setSignupData({ ...signupData, [e.target.name]: e.target.value }); setError(""); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const dynamicApiUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${dynamicApiUrl}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Crucial: save the server we logged into
        localStorage.setItem("activeServer", dynamicApiUrl);
        
        setSuccess("Login successful! Entering the world...");
        const redirectPath = data.user.role === 'admin' ? '/admin' : '/';
        setTimeout(() => navigate(redirectPath), 800);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) { setError("Network error. Please try again."); } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const dynamicApiUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${dynamicApiUrl}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signupData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Crucial: save the server we signed up on
        localStorage.setItem("activeServer", dynamicApiUrl);

        setSuccess("Account forged! Entering the world...");
        setTimeout(() => navigate("/"), 800);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) { setError("Network error. Please try again."); } finally { setLoading(false); }
  };


  const [bgVideo] = useState(() => {
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

  const serverName = "Connect";

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <VideoBackground key={bgVideo} autoPlay loop muted playsInline>
          <source src={bgVideo} type="video/mp4" />
        </VideoBackground>

        <ContentWrapper style={{ background: 'rgba(2, 6, 23, 0.75)', border: '1px solid rgba(255,255,255,0.1)' }}>
          
          <OverlayPanel $isSignUp={isSignUp} style={{ background: 'rgba(236, 72, 153, 0.15)', backdropFilter: 'blur(30px)' }}>
            <AnimatedLogo style={{ background: 'linear-gradient(45deg, #ec4899, #be185d)' }}>✨</AnimatedLogo>
            {isSignUp ? (
              <>
                <Title>Already Forged?</Title>
                <Subtitle>Return to Connect and reconnect with your friends.</Subtitle>
                <OutlineButton onClick={() => { setIsSignUp(false); setError(""); setSuccess(""); }}>
                  ENTER PORTAL
                </OutlineButton>
              </>
            ) : (
              <>
                <Title>New Player?</Title>
                <Subtitle>Forge your identity in the Connect and start exploring.</Subtitle>
                <OutlineButton onClick={() => { setIsSignUp(true); setError(""); setSuccess(""); }}>
                  CREATE AVATAR
                </OutlineButton>
              </>
            )}
          </OverlayPanel>

          <FormSection $active={!isSignUp} $isSignUp={false}>
            <Title $dark>Welcome Back</Title>
            <Subtitle $dark>Connect to the world</Subtitle>
            <form onSubmit={handleLogin}>
              <InputGroup>
                <InputIcon><FiUser /></InputIcon>
                <Input type="text" name="displayName" placeholder="Gamer Tag (Username)" value={loginData.displayName || ""} onChange={handleLoginChange} required />
              </InputGroup>
              <InputGroup>
                <InputIcon><FiLock /></InputIcon>
                <Input type="password" name="password" placeholder="Secret Phrase" value={loginData.password} onChange={handleLoginChange} required />
              </InputGroup>
              {error && !isSignUp && <ErrorMessage>{error}</ErrorMessage>}
              {success && !isSignUp && <SuccessMessage>{success}</SuccessMessage>}
              <Button type="submit" disabled={loading}>
                {loading ? "CONNECTING..." : "ENTER REALM"} <FiArrowRight />
              </Button>
            </form>
          </FormSection>

          <FormSection $active={isSignUp} $isSignUp={true} style={{ overflowY: 'auto', padding: '20px 40px' }}>
             <Title $dark>Forge Identity</Title>
             <Subtitle $dark>Join Connect today.</Subtitle>
             <form onSubmit={handleSignup} style={{ paddingBottom: '20px' }}>
                <div style={{display: 'flex', gap: '10px'}}>
                  <InputGroup>
                    <InputIcon><FiUser /></InputIcon>
                    <Input type="text" name="firstName" placeholder="First Name" value={signupData.firstName} onChange={handleSignupChange} required />
                  </InputGroup>
                  <InputGroup>
                    <InputIcon><FiUser /></InputIcon>
                    <Input type="text" name="lastName" placeholder="Last Name" value={signupData.lastName} onChange={handleSignupChange} required />
                  </InputGroup>
                </div>
                <InputGroup>
                  <InputIcon><FiUser /></InputIcon>
                  <Input type="text" name="displayName" placeholder="Gamer Tag (Username)" value={signupData.displayName} onChange={handleSignupChange} required />
                </InputGroup>
                <InputGroup>
                  <InputIcon><FiCalendar /></InputIcon>
                  <Input type="date" name="dob" value={signupData.dob} onChange={handleSignupChange} required style={{paddingLeft: '45px', color: signupData.dob ? 'white' : 'rgba(255,255,255,0.5)'}} />
                </InputGroup>
                <InputGroup>
                  <InputIcon><FiMail /></InputIcon>
                  <Input type="email" name="email" placeholder="Email Address" value={signupData.email} onChange={handleSignupChange} required />
                </InputGroup>
                <InputGroup>
                  <InputIcon><FiLock /></InputIcon>
                  <Input type="password" name="password" placeholder="Secret Phrase" value={signupData.password} onChange={handleSignupChange} required />
                </InputGroup>
                {error && isSignUp && <ErrorMessage>{error}</ErrorMessage>}
                {success && isSignUp && <SuccessMessage>{success}</SuccessMessage>}
                <Button type="submit" disabled={loading}>
                  {loading ? "FORGING..." : "CREATE AVATAR"} <FiArrowRight />
                </Button>
             </form>
          </FormSection>

        </ContentWrapper>
      </PageContainer>
    </>
  );
};

export default AuthPage;
