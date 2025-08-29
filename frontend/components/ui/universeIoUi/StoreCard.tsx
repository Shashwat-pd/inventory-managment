import React from 'react';
import styled from 'styled-components';
interface StoreCardProps {
    title : string,
}
const StoreCard = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-inner">
          <div className="card-front">
            <div className="scanlines" />
            <div className="noise" />
            <div className="product-image">
              <svg className="product-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="brutal-pattern" patternUnits="userSpaceOnUse" width={8} height={8}>
                    <rect width={8} height={8} fill="#fff" />
                    <rect width={4} height={4} fill="#000" />
                    <rect x={4} y={4} width={4} height={4} fill="#000" />
                  </pattern>
                </defs>
                <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#fff" stroke="#fff" strokeWidth={3} />
                <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="#000" stroke="#fff" strokeWidth={2} />
                <rect x={35} y={35} width={30} height={30} fill="url(#brutal-pattern)" />
                <polygon points="50,25 70,40 50,55 30,40" fill="#fff" />
                <circle cx={50} cy={45} r={8} fill="#000" />
                <rect x={46} y={41} width={8} height={8} fill="#fff" />
                <polygon points="50,60 65,70 50,75 35,70" fill="#fff" />
              </svg>
            </div>
            <div className="card-content">
              <div className="product-title">BRUTAL ITEM</div>
              <div className="product-price">99.99</div>
              <div className="product-description">UNCOMPROMISING. RAW. FUNCTIONAL.</div>
              <div className="buy-button">
                <div>ADD TO CART</div>
              </div>
            </div>
          </div>
          <div className="card-back">
            <svg className="product-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="brutal-pattern" patternUnits="userSpaceOnUse" width={8} height={8}>
                  <rect width={8} height={8} fill="#fff" />
                  <rect width={4} height={4} fill="#000" />
                  <rect x={4} y={4} width={4} height={4} fill="#000" />
                </pattern>
              </defs>
              <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="#fff" stroke="#fff" strokeWidth={3} />
              <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="#000" stroke="#fff" strokeWidth={2} />
              <rect x={35} y={35} width={30} height={30} fill="url(#brutal-pattern)" />
              <polygon points="50,25 70,40 50,55 30,40" fill="#fff" />
              <circle cx={50} cy={45} r={8} fill="#000" />
              <rect x={46} y={41} width={8} height={8} fill="#fff" />
              <polygon points="50,60 65,70 50,75 35,70" fill="#fff" />
            </svg>
            <div className="added-text">99.99</div>
            <div className="added-subtext">ADDED TO CART</div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 280px;
    height: 340px;
    background: #fff;
    border: 4px solid #000;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform-style: preserve-3d;
  }

  .card:active .card-inner {
    transform: rotateY(180deg);
  }

  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background: #fff;
  }

  .card-back {
    transform: rotateY(180deg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: #000000;
    color: #fff;
    border: 8px solid #fff;
    box-sizing: border-box;
  }

  .added-text {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 20px;
    animation: added-glitch 2s ease-out;
  }

  .added-subtext {
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.8;
  }

  .card::after {
    content: "";
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      #fff 30%,
      #fff 70%,
      transparent
    );
    box-shadow:
      0 0 8px #fff,
      0 0 16px #fff,
      0 0 24px rgba(255, 255, 255, 0.8);
    opacity: 0.6;
    z-index: 10;
    animation: scanline 4s linear infinite;
  }

  .card:hover::after {
    opacity: 1;
    animation: scanline-fast 1.2s linear infinite;
  }

  .card:hover {
    transform: rotate(-5deg) scale(1.1) skew(-2deg);
    box-shadow:
      10px 10px 0 #000,
      20px 20px 0 #333,
      30px 30px 0 #666,
      40px 40px 0 #999;
    border-width: 8px;
    filter: contrast(1.3) brightness(1.1);
  }

  .product-image {
    width: 100%;
    height: 150px;
    background: #000;
    position: relative;
    border-bottom: 8px solid #000;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .product-svg {
    width: 80px;
    height: 80px;
    transition: all 0.3s ease;
  }

  .card:hover .product-svg {
    animation:
      brutal-spin 0.4s ease-in-out,
      svg-glitch 0.6s ease-in-out;
    transform: scale(1.2);
  }

  .card-content {
    padding: 16px;
    position: relative;
    z-index: 2;
    background: #fff;
    height: calc(100% - 160px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .product-title {
    font-size: 16px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 6px;
    border-bottom: 4px solid #000;
    padding-bottom: 2px;
    line-height: 1.1;
  }

  .product-price {
    font-size: 20px;
    font-weight: 900;
    margin-bottom: 8px;
  }

  .product-description {
    font-size: 10px;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    flex-grow: 1;
  }

  .buy-button {
    width: 100%;
    padding: 10px;
    background: #000;
    color: #fff;
    border: 4px solid #000;
    font-family: "Helvitica", monospace;
    text-align: center;
    font-size: 14px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .buy-button::before {
    content: "BUY NOW";
    position: absolute;
    top: 10px;
    left: -100%;
    width: 100%;
    height: 100%;
    background: #d9d4d4;
    transition: all 0.3s ease;
  }

  .card:hover .buy-button::before {
    left: 0;
  }

  .card:hover .buy-button {
    color: #060606;
  }

  .card:hover .buy-button span {
    position: relative;
    z-index: 1;
  }

  @keyframes added-glitch {
    0% {
      transform: scale(0.8);
      filter: invert(0);
      opacity: 0;
    }
    10% {
      transform: scale(1.2) skew(-5deg);
      filter: invert(1);
      opacity: 1;
    }
    20% {
      transform: scale(0.9) skew(3deg);
      filter: invert(0);
    }
    30% {
      transform: scale(1.1) skew(-2deg);
      filter: invert(1);
    }
    40% {
      transform: scale(1) skew(1deg);
      filter: invert(0);
    }
    50% {
      transform: scale(1.05) skew(0deg);
      filter: invert(1);
    }
    70% {
      transform: scale(1);
      filter: invert(0);
    }
    100% {
      transform: scale(1);
      filter: invert(0);
    }
  }

  @keyframes scanline-glitch {
    0% {
      height: 2px;
      opacity: 1;
    }
    20% {
      height: 8px;
      opacity: 0.3;
    }
    40% {
      height: 1px;
      opacity: 1;
    }
    60% {
      height: 12px;
      opacity: 0.2;
    }
    80% {
      height: 2px;
      opacity: 0.8;
    }
    100% {
      height: 2px;
      opacity: 1;
    }
  }

  @keyframes scanline-chaos {
    0% {
      transform: translateY(0);
    }
    25% {
      transform: translateY(-2px) scaleY(1.5);
    }
    50% {
      transform: translateY(1px) scaleY(0.8);
    }
    75% {
      transform: translateY(-1px) scaleY(1.2);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes scanline {
    0% {
      top: -100%;
      opacity: 0;
    }
    3% {
      opacity: 0.3;
    }
    97% {
      opacity: 0.3;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }

  @keyframes scanline-fast {
    0% {
      top: -100%;
      opacity: 0;
    }
    8% {
      opacity: 1;
    }
    92% {
      opacity: 1;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }

  @keyframes brutal-spin {
    0% {
      transform: scale(1.2) rotate(0deg);
    }
    25% {
      transform: scale(1.4) rotate(90deg);
    }
    50% {
      transform: scale(1.2) rotate(180deg);
    }
    75% {
      transform: scale(1.4) rotate(270deg);
    }
    100% {
      transform: scale(1.2) rotate(360deg);
    }
  }

  @keyframes brutal-click {
    0% {
      transform: scale(1.2) rotate(0deg);
      filter: invert(0);
    }
    15% {
      transform: scale(1.4) rotate(-10deg);
      filter: invert(1);
    }
    30% {
      transform: scale(1.1) rotate(5deg);
      filter: invert(0);
    }
    45% {
      transform: scale(1.3) rotate(-3deg);
      filter: invert(1);
    }
    60% {
      transform: scale(1.15) rotate(2deg);
      filter: invert(0);
    }
    75% {
      transform: scale(1.25) rotate(-1deg);
      filter: invert(1);
    }
    90% {
      transform: scale(1.1) rotate(0deg);
      filter: invert(0);
    }
    100% {
      transform: scale(1.2) rotate(0deg);
      filter: invert(0);
    }
  }

  @keyframes brutal-spin {
    0% {
      transform: scale(1.2) rotate(0deg);
    }
    25% {
      transform: scale(1.4) rotate(90deg);
    }
    50% {
      transform: scale(1.2) rotate(180deg);
    }
    75% {
      transform: scale(1.4) rotate(270deg);
    }
    100% {
      transform: scale(1.2) rotate(360deg);
    }
  }

  @keyframes svg-glitch {
    0%,
    100% {
      filter: invert(0);
    }
    10% {
      filter: invert(1);
    }
    20% {
      filter: invert(0);
    }
    30% {
      filter: invert(1);
    }
    40% {
      filter: invert(0);
    }
  }

  @keyframes glitch {
    0%,
    100% {
      transform: translate(-50%, -50%);
    }
    20% {
      transform: translate(-48%, -52%);
    }
    40% {
      transform: translate(-52%, -48%);
    }
    60% {
      transform: translate(-50%, -52%);
    }
    80% {
      transform: translate(-48%, -50%);
    }
  }

  @keyframes diagonal-slide {
    0% {
      transform: translateX(-100%) translateY(-100%);
    }
    100% {
      transform: translateX(0) translateY(0);
    }
  }

  .noise {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    background-image: radial-gradient(circle, #000 1px, transparent 1px);
    background-size: 4px 4px;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .card:hover .noise {
    opacity: 0.05;
    animation: noise-move 0.1s infinite;
  }

  @keyframes noise-move {
    0% {
      transform: translate(0, 0);
    }
    10% {
      transform: translate(-1px, -1px);
    }
    20% {
      transform: translate(1px, -1px);
    }
    30% {
      transform: translate(-1px, 1px);
    }
    40% {
      transform: translate(1px, 1px);
    }
    50% {
      transform: translate(-1px, -1px);
    }
    60% {
      transform: translate(1px, -1px);
    }
    70% {
      transform: translate(-1px, 1px);
    }
    80% {
      transform: translate(1px, 1px);
    }
    90% {
      transform: translate(-1px, -1px);
    }
    100% {
      transform: translate(0, 0);
    }
  }`;

export default StoreCard;
