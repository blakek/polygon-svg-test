import { isPointInPolygon, Point } from "./polygon-utils";
import { usePointerPosition } from "./usePointerPosition";

export interface PointInPolygonProps {
  polygon: Point[];
  tolerance?: number;
}

export function PointInPolygon(props: PointInPolygonProps) {
  const [pointerX, pointerY] = usePointerPosition();

  const isInside = isPointInPolygon(props.polygon, [pointerX, pointerY], {
    tolerance: props.tolerance,
  });
  const innerText = isInside ? "inside" : "outside";
  const innerTextClass = isInside ? "positiveText" : "negativeText";

  return (
    <div className="outputText">
      <span>{`(${pointerX}, ${pointerY})`}</span> is
      <span className={innerTextClass}> {innerText} </span>
      the polygon
    </div>
  );
}
