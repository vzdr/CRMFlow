import NodeLibrary from './layouts/NodeLibrary';
import Canvas from './layouts/Canvas';
import ConfigPanel from './components/ConfigPanel';

export default function App() {
  return (
    <div className="flex w-screen h-screen font-sans overflow-hidden">
      <NodeLibrary />
      <Canvas />
      <ConfigPanel />
    </div>
  );
}
