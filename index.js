import { ToyReact, Component } from "./ToyReact";

class Com extends Component {
  render() {
    return <div>1

      {this.children}
    </div>
  }
}

const a = (
  <Com id="id">
    <div>2222</div>
  </Com>
);


ToyReact.render(
  a,
  document.getElementById('app')
)
