class ElementWrapper {
  constructor(type) {
    // this.root = document.createElement(type);
    this.type = type;
    this.children = [];
    this.props = Object.create(null);
  }

  get vdom() {
    return this;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(vchild) {

    this.children.push(vchild);
  }
  mountTo(range) {
    this.range = range;
    let placeholder = document.createComment('placeholder');
    let endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEnd(range.endContainer, range.endOffset);
    endRange.insertNode(placeholder);

    range.deleteContents();
    let element = document.createElement(this.type);
    
    for (let name in this.props) {
      let value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^([\s\S]+)$/, (s) =>
          s.toLowerCase()
        );
        element.addEventListener(eventName, value);
      }
      if (name === "className") {
        element.setAttribute("class", value);
      } else {
        element.setAttribute(name, value);
      }
    }

    for (let child of this.children) {
      let range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }

    range.insertNode(element);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
    this.type = "#text";
    this.children = [];
    this.props = Object.create(null);
  }
  mountTo(range) {
    this.range = range;
    range.deleteContents();
    range.insertNode(this.root);
  }
  get vdom() {
    return this;
  }
}

class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }

  get type() {
    return this.constructor.name;
  }



  mountTo(range) {
    this.range = range;
    this.update();
  }

  setAttribute(name, value) {
    this[name] = value;
    this.props[name] = value;
  }

  update() {
    const vdom = this.render();
    if (this.oldVdom) {
      let isSameNode = (node1, node2) => {
        // console.log(node1, node2)
        if (node1.type !== node2.type) {
          return false;
        }
        for (let name in node1.props) {
          if (
            typeof node1.props[name] === "object" &&
            typeof node2.props[name] === "object" &&
            JSON.stringify(node1.props[name]) ===
              JSON.stringify(node2.props[name])
          ) {
            continue;
          }

          if (node1.props[name] !== node2.props[name]) {
            return false;
          }
        }
        if (
          Object.keys(node1.props).length !== Object.keys(node2.props).length
        ) {
          return false;
        }
        return true;
      };
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false;
        }
        if (node1.children.length !== node2.children.length) {
          return false;
        }
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) {
            return false;
          }
        }
        return true;
      };

      let replace = (newTree, oldTree) => {
        // 根对比
        if (isSameTree(newTree, oldTree)) {
          return;
        }
        // 根节点不同 直接全部替换
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range);
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i]);
          }
        }
      };

      replace(vdom, this.oldVdom);
    } else {
      vdom.mountTo(this.range);
    }

    this.oldVdom = vdom;
  }

  appendChild(vchild) {
    this.children.push(vchild);
  }

  setState(state) {
    let merge = (oldState, newState) => {
      for (let key in newState) {
        if (typeof newState[key] === "object" && newState[key] !== null) {
          if (typeof oldState[key] !== "object") {
            if (Array.isArray(newState[key])) {
              oldState[key] = [];
            } else {
              oldState[key] = {};
            }
          }
          merge(oldState[key], newState[key]);
        } else {
          oldState[key] = newState[key];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    this.update();
  }
}

const ToyReact = {
  createElement(type, attributes, ...children) {
    let element;
    if (typeof type === "string") {
      element = new ElementWrapper(type);
    } else {
      element = new type(); // 新class 组件
    }
    for (let atr in attributes) {
      element.setAttribute(atr, attributes[atr]);
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "object" && Array.isArray(child)) {
          insertChildren(child);
        } else {
          if (child === null || child === void 0) {
            child = "";
          }

          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper)
          ) {
            child = String(child);
          }
          if (typeof child === "string") {
            child = new TextWrapper(child);
          }
          element.appendChild(child);
        }
      }
    };
    insertChildren(children);

    return element;
  },
  render(vdom, element) {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  },
};

export { ToyReact, Component };
