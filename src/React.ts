const React = {
  createElement: (type, attributes, ...children) => {
    console.log(type, attributes, children);
  },
};

export default React;
