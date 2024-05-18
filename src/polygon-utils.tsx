export type Point = [number, number];
export type Polygon = Point[];
export type Line = [Point, Point];

const POLYGON_MINIMUM_POINTS = 3;

export function arePointsEqual(point1: Point, point2: Point): boolean {
  return point1[0] === point2[0] && point1[1] === point2[1];
}

export function arePolygonsEqual(
  polygon1: Polygon,
  polygon2: Polygon
): boolean {
  if (polygon1.length !== polygon2.length) {
    return false;
  }

  // Find polygon1[0] in polygon2
  const offset = polygon2.findIndex((point) =>
    arePointsEqual(point, polygon1[0])
  );

  if (offset === -1) {
    return false;
  }

  const shouldTryReverse = !arePointsEqual(
    polygon1[1],
    polygon2[(offset + 1) % polygon2.length]
  );

  const step = shouldTryReverse ? -offset : offset;

  const getOffsetIndex = (p1i: number) =>
    Math.abs((p1i + step) % polygon2.length);

  return polygon1.every((point, index) =>
    arePointsEqual(point, polygon2[getOffsetIndex(index)])
  );
}

export const pointToString = ([x, y]: Point): string => `(${x}, ${y})`;

export function getMinMaxXY(
  polygon: Polygon,
  tolerance = 0
): [minX: number, minY: number, maxX: number, maxY: number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  polygon.forEach(([x, y]) => {
    if (x < minX) {
      minX = x;
    }

    if (x > maxX) {
      maxX = x;
    }

    if (y < minY) {
      minY = y;
    }

    if (y > maxY) {
      maxY = y;
    }
  });

  minX -= tolerance;
  minY -= tolerance;
  maxX += tolerance;
  maxY += tolerance;

  return [minX, minY, maxX, maxY];
}

export function getBoundingBox(polygon: Polygon, tolerance = 0): Polygon {
  const [minX, minY, maxX, maxY] = getMinMaxXY(polygon, tolerance);

  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ] as Polygon;
}

export function doesPointIntersectLine(
  [x, y]: Point,
  [[x1, y1], [x2, y2]]: Line
): boolean {
  const isWithinYBounds = y < y1 !== y < y2;

  if (!isWithinYBounds) {
    return false;
  }

  const lineSlope = (x2 - x1) / (y2 - y1);
  const verticalDifference = y - y1;
  const lineIntersect = lineSlope * verticalDifference + x1;
  return x < lineIntersect;
}

export function isPointInBoundingBox(
  polygon: Polygon,
  point: Point,
  tolerance = 0
): boolean {
  const [minX, minY, maxX, maxY] = getMinMaxXY(polygon, tolerance);

  return (
    point[0] >= minX && point[0] <= maxX && point[1] >= minY && point[1] <= maxY
  );
}

export function isPointInPolygon(
  polygon: Polygon,
  point: Point,
  /**
   * If provided, a point on the polygon's edge or within this distance of the
   * edge will be considered inside the polygon. This also helps with rounding
   * errors.
   */
  tolerance = 0
): [isInPolygon: boolean, reason?: string] {
  // Point cannot be inside a polygon with less than 3 points
  if (polygon.length < POLYGON_MINIMUM_POINTS) {
    return [false, "not a polygon"];
  }

  // Optimization: First check if the point is within the bounding box.
  const isInBoundingBox = isPointInBoundingBox(polygon, point, tolerance);

  if (!isInBoundingBox) {
    return [false, "outside bounding box"];
  }

  const isInside = polygon.reduce(
    (wasLastInside, vertex, pointIndex, polygon) => {
      const previousVertex = polygon.at(pointIndex - 1)!;

      const intersectsLine = doesPointIntersectLine(point, [
        vertex,
        previousVertex,
      ]);

      // If we intersect a line, we toggle the inside/outside state
      if (intersectsLine) {
        return !wasLastInside;
      }

      // Keep the same state if we don't intersect the line
      return wasLastInside;
    },
    false
  );

  return [isInside];
}

export function isValidPoint(maybePoint: unknown): maybePoint is Point {
  return (
    Array.isArray(maybePoint) &&
    maybePoint.length === 2 &&
    maybePoint.every(isFinite)
  );
}

export function isValidPolygon(maybePolygon: unknown): maybePolygon is Polygon {
  if (!Array.isArray(maybePolygon)) {
    return false;
  }

  if (maybePolygon.length < POLYGON_MINIMUM_POINTS) {
    return false;
  }

  return maybePolygon.every((point) => isValidPoint(point));
}
