import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/intro.css";

const IntroSplash = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Check if user has seen intro in this session
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      navigate("/login");
      return;
    }

    // Load GSAP dynamically
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    script.async = true;
    
    script.onload = () => {
      const { gsap } = window;
      
      // Timeline for splash animation
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("hasSeenIntro", "true");
          setTimeout(() => {
            setIsAnimating(false);
            navigate("/login");
          }, 500);
        }
      });

      // Splash background fade in
      tl.to(".splash-bg", {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      });

      // Glow pulse animation
      tl.to(".glow-pulse", {
        opacity: 1,
        scale: 1.2,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");

      // Brand reveal - PHARMA
      tl.fromTo(".pharma", 
        { 
          opacity: 0, 
          y: 50,
          rotationX: -90
        },
        { 
          opacity: 1, 
          y: 0,
          rotationX: 0,
          duration: 1,
          ease: "back.out(1.7)"
        }
      );

      // Brand reveal - CONNECT
      tl.fromTo(".connect", 
        { 
          opacity: 0, 
          y: 50,
          rotationX: -90
        },
        { 
          opacity: 1, 
          y: 0,
          rotationX: 0,
          duration: 1,
          ease: "back.out(1.7)"
        },
        "-=0.7"
      );

      // Light sweep effect
      tl.to(".light-sweep", {
        left: "100%",
        duration: 1.5,
        ease: "power2.inOut"
      }, "-=0.5");

      // Tagline fade in
      tl.to(".splash-tagline", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.8");

      // Hold for a moment
      tl.to({}, { duration: 1.5 });

      // Fade out everything
      tl.to("#splash", {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      });
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [navigate]);

  if (!isAnimating) return null;

  return (
    <>
      {/* 🎬 SPLASH SCREEN */}
      <div id="splash">
        <div className="splash-bg"></div>
        <div className="splash-content">
          <h1 className="brand-reveal">
            <span className="pharma">PHARMA</span>
            <span className="connect">CONNECT</span>
            <div className="light-sweep"></div>
          </h1>
          <p className="splash-tagline">A B2B MARKETPLACE FOR PHARMACEUTICALS</p>
          <div className="glow-pulse"></div>
        </div>
      </div>

      {/* 🌌 AMBIENT BACKGROUND */}
      <div className="bg-wrapper">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="particle-overlay"></div>
      </div>
    </>
  );
};

export default IntroSplash;
