import React from 'react';
import { Button } from 'reactstrap';

const buttonStyle = {
    width: '100%', 
    height: '200px', 
    fontSize: '7rem', 
    fontWeight: '100'
};

const VoteButton = ({ isActive, color, message, handler }) => (
    <Button
        outline style={buttonStyle} 
        color={isActive ? color : 'second'}
        onClick={() => handler({message})}>{message}</Button>
)

export default VoteButton;