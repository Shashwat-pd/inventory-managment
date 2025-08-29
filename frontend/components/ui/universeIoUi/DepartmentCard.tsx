import React from 'react';
import styled from 'styled-components';

interface DepartmentCardProps {
  title: string;
}

const DepartmentCard = ({ title }: DepartmentCardProps) => {
  return (
    <StyledWrapper>
      <div className="card mb-2">{title}</div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 365px;
    height: 254px;
    background: white;
    border: 3px inset white;
    background: #e8e8e8;
    box-shadow: inset 20px 20px 60px #c5c5c5, inset -20px -20px 60px #ffffff;
    transition: all .5s ease-in-out;
    border-radius: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bolder;
    color: black;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    
    /* Solution 1: Fixed font size - most common approach */
    font-size: 18px;
    text-align: center;
    padding: 20px;
    
    /* Handle text overflow for very long text */
    overflow: hidden;
    word-wrap: break-word;
    hyphens: auto;
  }

  .card:hover {
    transform: translateY(-5px);
    transition: all .5s ease-in-out;
  }
`;

export default DepartmentCard;