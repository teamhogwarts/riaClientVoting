import React from 'react';
import { Jumbotron } from 'reactstrap';

const Header = ({ title, lead }) => (
  <Jumbotron>
    <h1 className="display-3">{title}</h1>
    <p className="lead">{lead}</p>
  </Jumbotron>
)

export default Header;
