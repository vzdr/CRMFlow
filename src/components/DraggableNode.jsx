import { useDraggable } from '@dnd-kit/core';
import { FaPlay } from 'react-icons/fa';

export function DraggableNode({ id, label }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-background p-4 rounded-lg border border-border-color flex items-center gap-3 cursor-grab active:cursor-grabbing"
    >
      <FaPlay className="text-primary" />
      <span className="font-semibold text-lg">{label}</span>
    </div>
  );
}
