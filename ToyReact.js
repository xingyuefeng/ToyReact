class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {

    if (name.match(/^on([\s\S]+)$/)) {
      let eventName = RegExp.$1.replace(/^([\s\S]+)$/, s => s.toLowerCase())
      this.root.addEventListener(eventName, value)
    }

    this.root.setAttribute(name, value);
  }
  appendChild(vchild) {
    let range = document.createRange()
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild)
      range.setEndAfter(this.root.lastChild)
    } else {
      range.setStart(this.root, 0)
      range.setEnd(this.root, 0)
    }
    vchild.mountTo(range)
  }
  mountTo(range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class Component {
  constructor() {
    this.children = [];
    this.props = {}
  }

  mountTo(range) {
    this.range = range
    this.update()
  }

  setAttribute(name, value) {
    this[name] = value;
    this.props[name] = value;
  }

  update() {
    // 占位符，防止删除range的时候，后面的dom排到前来
    let placeholder = document.createComment('placeholder')
    let range = document.createRange()
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder)
    this.range.deleteContents()
    let vdom = this.render()

    vdom.mountTo(this.range)
  }

  appendChild(child) {
    this.children.push(child);
  }

  setState(state) {
    let merge = (oldState, newState) => {
      for (let key in  newState) {
        if (typeof newState[key] === 'object') {
          if (typeof oldState[key] !== 'object') {
            oldState[key] = {}
          } 
          merge(oldState[key], newState[key])
        } else {
          oldState[key] = newState[key]
        }
      }
    }
    if (!this.state && state) {
      this.state = {}
     
    }
    merge(this.state, state)
    this.update()
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
          if (!(child instanceof Component) &&
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
    let range = document.createRange()
    if (element.children.length) {
      range.setStartAfter(element.lastChild)
      range.setEndAfter(element.lastChild)
    } else {
      range.setStart(element, 0)
      range.setEnd(element, 0)
    }
    vdom.mountTo(range);
  },
};

export { ToyReact, Component };
