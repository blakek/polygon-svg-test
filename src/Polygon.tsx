import { Point } from "./polygon-utils";

export interface PolygonProps {
  points: Point[];
}

export function Polygon(props: PolygonProps) {
  if (props.points.length < 3) {
    return null;
  }

  const polygonPoints = props.points.map(([x, y]) => `${x},${y}`).join(" ");
  const polygonPath = `M${polygonPoints}Z`;

  return <path className="polygon" d={polygonPath} />;
}
