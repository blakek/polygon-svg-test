import { isPointInPolygon, Point, pointToString } from "./polygon-utils";
import { usePointerPosition } from "./usePointerPosition";

export interface PointInPolygonProps {
  polygon: Point[];
  tolerance?: number;
}

export function PointInPolygon(props: PointInPolygonProps) {
  const pointerPosition = usePointerPosition();

  const [isInside, reason] = isPointInPolygon(props.polygon, pointerPosition, {
    tolerance: props.tolerance,
  });

  const innerText = isInside ? "inside" : "outside";
  const innerTextClass = isInside ? "positiveText" : "negativeText";

  return (
    <div className="outputText">
      <span>{pointToString(pointerPosition)}</span> is
      <span className={innerTextClass}> {innerText} </span>
      the polygon
      {reason && <div className="negativeText">reason: {reason}</div>}
    </div>
  );
}
