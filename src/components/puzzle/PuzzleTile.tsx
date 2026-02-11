"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PuzzleTileProps {
  id: number; // position id
  tileIndex: number; // which tile image to show
  gridSize: number;
  image: HTMLImageElement | null;
  disabled?: boolean;
}

export default function PuzzleTile({
  id,
  tileIndex,
  gridSize,
  image,
  disabled = false,
}: PuzzleTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tileSize, setTileSize] = useState(0);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tilePos = useMemo(() => {
    const row = Math.floor(tileIndex / gridSize);
    const col = tileIndex % gridSize;
    return { row, col };
  }, [tileIndex, gridSize]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const update = () => setTileSize(el.clientWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image || tileSize === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = tileSize * dpr;
    canvas.height = tileSize * dpr;
    canvas.style.width = `${tileSize}px`;
    canvas.style.height = `${tileSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, tileSize, tileSize);

    const sourceW = image.naturalWidth / gridSize;
    const sourceH = image.naturalHeight / gridSize;
    const sx = tilePos.col * sourceW;
    const sy = tilePos.row * sourceH;

    ctx.drawImage(
      image,
      sx,
      sy,
      sourceW,
      sourceH,
      0,
      0,
      tileSize,
      tileSize
    );
  }, [image, gridSize, tilePos, tileSize]);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      style={style}
      className={`relative aspect-square select-none rounded-lg border border-white/10 bg-white/5 shadow-lg transition-shadow ${
        isDragging ? "z-10 shadow-love-500/30" : "shadow-black/20"
      } ${disabled ? "opacity-70" : "cursor-grab active:cursor-grabbing"}`}
      {...attributes}
      {...listeners}
    >
      <canvas ref={canvasRef} className="h-full w-full rounded-lg" />
    </div>
  );
}
