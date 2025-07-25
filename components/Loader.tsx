"use client"
import React from "react"
import styled from "styled-components"

const Loader = () => {
  return (
    <Wrapper>
      <div className="loader">
        Loading
        <span />
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4); /* noir doux et propre sans flou */

  .loader {
    position: relative;
    width: 150px;
    height: 150px;
    background: transparent;
    border: 3px solid rgba(0, 102, 255, 0.1);
    border-radius: 50%;
    text-align: center;
    line-height: 150px;
    font-family: sans-serif;
    font-size: 20px;
    color: #3b82f6;
    letter-spacing: 2px;
    text-transform: uppercase;
    text-shadow: 0 0 10px #3b82f6;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  }

  .loader::before {
    content: "";
    position: absolute;
    top: -3px;
    left: -3px;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid #0066ff;
    border-right: 3px solid #0066ff;
    border-radius: 50%;
    animation: animateC 2s linear infinite;
  }

  .loader span {
    display: block;
    position: absolute;
    top: calc(50% - 2px);
    left: 50%;
    width: 50%;
    height: 4px;
    background: transparent;
    transform-origin: left;
    animation: animate 2s linear infinite;
  }

  .loader span::before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #00aeff;
    top: -6px;
    right: -8px;
    box-shadow: 0 0 20px 5px #0066ff;
  }

  @keyframes animateC {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes animate {
    0% {
      transform: rotate(45deg);
    }
    100% {
      transform: rotate(405deg);
    }
  }
`

export default Loader
