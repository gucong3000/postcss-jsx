"use strict";
const styled = require("styled-components");
const Button = styled.button`
/* Adapt the colours based on primary prop */
background: ${props => props.primary ? "palevioletred" : "white"};
color: ${props => props.primary ? "white" : "palevioletred"};

font-size: 1em;
margin: 1em;
padding: 0.25em 1em;
border: 2px solid palevioletred;
border-radius: 3px;
`;
require("styled");
const StyledCounter = require("styled-components").div;
StyledCounter(require("styled-components").div.b);
module.exports = Button;
