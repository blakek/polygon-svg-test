export type Point = [number, number];
export type Polygon = Point[];

export type IsPointInPolygonOptions = {
  /** If provided, a point on the polygon's edge or within this distance of the
   * edge will be considered inside the polygon. This also helps with rounding
   * errors. */
  tolerance?: number;
};

const BOUNDING_BOX_CHECK_MINIMUM_POINTS = 5; // TODO: increase this to a much higher number
const BOUNDING_BOX_CHECK_TOLERANCE = Number.EPSILON * 100;
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

export function getBoundingBox(
  polygon: Polygon,
  options: IsPointInPolygonOptions = {}
): Polygon {
  const { tolerance = BOUNDING_BOX_CHECK_TOLERANCE } = options;

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

  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ] as Polygon;
}

// #region untested code

const lookupMap = new Map();

export function doesPointIntersectLine(
  [x, y]: Point,
  [[x1, y1], [x2, y2]]: [Point, Point]
): boolean {
  const lookupKey = [x, y, x1, y1, x2, y2];

  if (!lookupMap.has(lookupKey)) {
    const isWithinYBounds = y < y1 !== y < y2;

    const lineSlope = (x2 - x1) / (y2 - y1);
    const verticalDifference = y - y1;
    const lineIntersect = lineSlope * verticalDifference + x1;
    lookupMap.set(lookupKey, isWithinYBounds && x < lineIntersect);
  }

  return lookupMap.get(lookupKey);
}

export function doesPointIntersectLine_v2b(
  [x, y]: Point,
  [[x1, y1], [x2, y2]]: [Point, Point],
  options: IsPointInPolygonOptions
): boolean {
  const { tolerance = 0 } = options;

  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  const isWithinYBounds = y > minY - tolerance && y < maxY + tolerance;
  const n = ((x2 - x1) * (y - y1)) / (y2 - y1) + x1 - x;

  console.log({ n });

  if (!isWithinYBounds) {
    return false;
  }

  return n < 0 || Math.abs(n) < tolerance;
}

export function doesPointIntersectLine_v3a(
  [x, y]: Point,
  [[x1, y1], [x2, y2]]: [Point, Point],
  options: IsPointInPolygonOptions = {}
): boolean {
  const { tolerance = Number.EPSILON } = options;

  const a = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
  const intersects = Math.abs(a) <= tolerance;

  console.log({ a, tolerance });

  // const lineSlope = (x2 - x1) / (y2 - y1);
  // const verticalDifference = y - y1;
  // const intersects = Math.abs(lineSlope * verticalDifference + x1) <= x;

  const xMin = Math.min(x1, x2);
  const xMax = Math.max(x1, x2);
  const yMin = Math.min(y1, y2);
  const yMax = Math.max(y1, y2);

  return (
    intersects && true
    // x >= xMin - tolerance &&
    // x <= xMax + tolerance &&
    // y >= yMin - tolerance &&
    // y <= yMax + tolerance
  );
}

export function doesPointIntersectLine_v2(
  [x, y]: Point,
  [[x1, y1], [x2, y2]]: [Point, Point]
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

export function isPointInPolygon(
  polygon: Polygon,
  point: Point,
  options: Partial<IsPointInPolygonOptions> = {}
): boolean {
  // Point cannot be inside a polygon with less than 3 points
  if (polygon.length < POLYGON_MINIMUM_POINTS) {
    return false;
  }

  // Optimization: For large polygons, first check if the point is within the bounding box
  if (polygon.length >= BOUNDING_BOX_CHECK_MINIMUM_POINTS) {
    const boundingBox = getBoundingBox(polygon);
    const tolerance = options.tolerance || BOUNDING_BOX_CHECK_TOLERANCE;

    if (!isPointInPolygon(boundingBox, point, { tolerance })) {
      return false;
    }
  }

  return polygon.reduce((wasLastInside, vertex, pointIndex, polygon) => {
    const previousVertex = polygon.at(pointIndex - 1)!;
    const intersectsLine = doesPointIntersectLine(
      point,
      [vertex, previousVertex],
      options
    );

    if (intersectsLine) {
      return !wasLastInside;
    }

    return wasLastInside;
  }, false as boolean);
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

// #endregion
