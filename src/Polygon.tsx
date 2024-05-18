import { Point } from "./polygon-utils";

export interface PolygonProps {
  points: Point[];
}

export function Polygon(props: PolygonProps) {
  const polygonPoints = props.points.map(([x, y]) => `${x},${y}`).join(" ");
  const polygonPath = `M${polygonPoints}Z`;

  return <path className="polygon" d={polygonPath} />;
}
