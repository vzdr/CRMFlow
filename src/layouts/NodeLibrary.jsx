import { DraggableNode } from '../components/DraggableNode';

export default function NodeLibrary({ nodes }) {
  return (
    <aside className="w-72 h-full bg-surface border-r border-border-color p-6 flex-shrink-0">
      <h2 className="text-2xl font-bold mb-6">Nodes</h2>
      <div className="space-y-4">
        {nodes.map(node => (
          <DraggableNode key={node.id} id={node.id} label={node.label} />
        ))}
      </div>
    </aside>
  );
}
