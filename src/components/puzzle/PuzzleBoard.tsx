"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSwappingStrategy,
} from "@dnd-kit/sortable";
import PuzzleTile from "@/components/puzzle/PuzzleTile";

interface PuzzleBoardProps {
  gridSize: number;
  tileOrder: number[];
  image: HTMLImageElement | null;
  onSwap: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
}

export default function PuzzleBoard({
  gridSize,
  tileOrder,
  image,
  onSwap,
  disabled = false,
}: PuzzleBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const positions = tileOrder.map((_, i) => i);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const fromIndex = Number(active.id);
        const toIndex = Number(over.id);
        if (Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
        onSwap(fromIndex, toIndex);
      }}
    >
      <SortableContext items={positions} strategy={rectSwappingStrategy}>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            touchAction: "none",
          }}
        >
          {positions.map((pos) => (
            <PuzzleTile
              key={pos}
              id={pos}
              tileIndex={tileOrder[pos]}
              gridSize={gridSize}
              image={image}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
