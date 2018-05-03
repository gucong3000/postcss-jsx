import React from 'react';
import glm from 'glamorous';

const minWidth = 700;
const a = 1
const Component1 = glm.a(
  /* start */
  {
    // stylelint-disable-next-line
    "unknownProperty": '1.8em', // must not trigger any warnings
    unknownProperty: '1.8em', // must not trigger any warnings
    [`unknownPropertyaa${a}`]: '1.8em', // must not trigger any warnings
    [`unknownProperty` + 1 + "a"]: '1.8em', // must not trigger any warnings
    display: 'inline-block',
    [`@media (minWidth: ${minWidth}px)`]: {
      color: 'red',
    },
    // unkown pseudo class selector
    ':focused': {
      backgroundColor: 'red',
    },
    "@fontFace": {
		"fontFamily": 'diyfont',
	},
	"@page:first": {
		margin: "300px"
	},
	"@charset": "utf-8"
  },
  // end
  ({ primary }) => ({
    unknownProperty: '1.8em', // unknown prop
    ...minWidth.length,
    color: primary ? '#fff' : '#DA233C',
  }),
);

const Component2 = glm(Component1, {
  displayName: 'Component2',
  forwardProps: ['shouldRender'],
  rootEl: 'div',
})(props => ({
  fontFamily: 'Arial, Arial, sans-serif', // duplicate font-family names
  fontSize: props.big ? 36 : 24,
}));

const Component3 = glm.div({
  padding: '8px 12px',
  ...Component2
});

export default () => (
  <div>
    <Component1 />
    <Component2 />
    <Component3 />
  </div>
);
