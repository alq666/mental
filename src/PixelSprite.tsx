/** Draws a sprite from rows of palette keys ("." is transparent), one SVG unit per pixel. */
export function PixelSprite({ rows, colors, mirrored = false }: { rows: string[]; colors: Record<string, string>; mirrored?: boolean }) {
  const width = rows[0].length;
  return (
    <svg viewBox={`0 0 ${width} ${rows.length}`} shapeRendering="crispEdges">
      <g transform={mirrored ? `translate(${width} 0) scale(-1 1)` : undefined}>
        {rows.flatMap((row, y) => [...row].map((key, x) => key === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={colors[key]} />))}
      </g>
    </svg>
  );
}
