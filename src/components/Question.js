import React from 'react';
import { Fade, Alert } from 'reactstrap';

const Question = ({ message }) => (
    <Fade in={true} tag="h1">
        <Alert color="success">
            {message}
        </Alert>
    </Fade>
)

export default Question;
