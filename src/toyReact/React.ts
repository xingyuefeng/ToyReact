type CreateElementType = string;

type Attributes = {
  [key: string]: string
};
// jsx编译属性
interface CreateDomAttributes {
  type: CreateElementType,
  attributes: Attributes,
  children: CreateDomAttributes
}

function createDom(type: CreateElementType, attributes: Attributes, ...children): Element {
  // console.log(type, attributes, children);
  let element:HTMLElement;
  if (typeof type === 'string') {
    element = document.createElement(type);
    if (attributes) {
      Object.keys(attributes).forEach((name) => element.setAttribute(name, attributes[name]));
    }
  }
  const insertChildren = (childrenChild: CreateDomAttributes[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    childrenChild.forEach((itm:any) => {
    // eslint-disable-next-line
      let child = itm;
      if (typeof child === 'object' && Array.isArray(child)) {
        insertChildren(child);
      } else {
        // if (child === null || child === undefined) {
        if (!child) {
          child = document.createTextNode('');
        }
        if (typeof child === 'string') {
          child = document.createTextNode(child);
        }
        element.appendChild(child);
      }
    });

    return element;
  };

  insertChildren(children);

  return element;
}

const React = {
  createElement: (type, attributes, ...children) => createDom(type, attributes, ...children),
};

export default React;
