import { useDroppable } from '@dnd-kit/core';
import VoiceController from '../components/VoiceController';

function CanvasNode({ label, position }) {
  return (
    <div
      style={{ position: 'absolute', left: position.x, top: position.y }}
      className="bg-surface p-4 rounded-lg border-2 border-primary shadow-lg w-64 cursor-pointer hover:scale-105 transition-transform"
    >
      <h3 className="font-bold text-lg">{label}</h3>
    </div>
  );
}

export default function Canvas({ nodes }) {
  const { setNodeRef } = useDroppable({ id: 'canvas-drop-area' });

  return (
    <main ref={setNodeRef} className="flex-grow h-full grid-background relative">
      <div className="absolute top-4 left-4 bg-surface p-3 rounded-md shadow-md">
        <h1 className="text-3xl font-bold">Project Flow</h1>
      </div>

      {nodes.map(node => (
        <CanvasNode key={node.id} {...node} />
      ))}

      <VoiceController />
    </main>
  );
}
