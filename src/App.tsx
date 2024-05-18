import * as React from "react";
import { PointInPolygon } from "./PointInPolygon";
import { Polygon } from "./Polygon";
import { getBoundingBox } from "./polygon-utils";
import "./styles.css";
import { usePolygon } from "./usePolygon";

export default function App() {
  const { addPoint, clear, points, redo, undo, undoHistory } = usePolygon();
  const [color, setColor] = React.useState("#ff69b4");
  const [showBoundingBox, setShowBoundingBox] = React.useState(true);
  const [shouldShowInPolygon, setShouldShowInPolygon] = React.useState(true);
  const [tolerance, setTolerance] = React.useState(
    // Just so you can see the tolerance area…
    // Normally, you'd use something like `Number.EPSILON`
    14
  );

  function handleClick(event: React.MouseEvent) {
    addPoint([event.clientX, event.clientY]);
  }

  function log(name: string, variable: unknown) {
    console.log(`${name} = `);
    console.log(JSON.stringify(variable));

    (window as any)[name] = variable;
    console.log(`"${name}" has also been saved to window.${name}`);
  }

  React.useEffect(() => {
    document.body.style.setProperty("--accent-color", color);
  }, [color]);

  const isUndoDisabled = points.length === 0;
  const isRedoDisabled = undoHistory.length === 0;

  return (
    <div className="app">
      <div className="actionArea">
        <button disabled={isUndoDisabled} onClick={undo}>
          undo
        </button>

        <button disabled={isRedoDisabled} onClick={redo}>
          redo
        </button>

        <button onClick={clear}>clear</button>

        <button
          onClick={() => {
            log("polygon", points);
          }}
        >
          log []
        </button>

        <button
          onClick={() => {
            const pointsAsObject = points.map(([x, y]) => ({ x, y }));
            log("polygon", pointsAsObject);
          }}
        >
          log {"{}"}
        </button>

        <input
          onChange={(e) => setColor(e.target.value)}
          type="color"
          value={color}
        />

        <label>
          <input
            checked={showBoundingBox}
            onChange={(event) => setShowBoundingBox(event.target.checked)}
            type="checkbox"
          />
          show bounding box
        </label>

        <label>
          <input
            checked={shouldShowInPolygon}
            onChange={(event) => setShouldShowInPolygon(event.target.checked)}
            type="checkbox"
          />
          show if pointer inside
        </label>

        <label>
          Tolerance:
          <input
            onChange={(event) => setTolerance(event.target.valueAsNumber)}
            type="number"
            value={tolerance.toString()}
          />
        </label>
      </div>

      {showBoundingBox && (
        <svg className="boundingBox">
          <Polygon points={getBoundingBox(points, { tolerance })} />
        </svg>
      )}

      {shouldShowInPolygon && (
        <PointInPolygon polygon={points} tolerance={tolerance} />
      )}

      <svg className="clickArea" onClick={handleClick}>
        <Polygon points={points} />
      </svg>
    </div>
  );
}
