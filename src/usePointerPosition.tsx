import * as React from "react";

export function usePointerPosition(): [number, number] {
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);

  function handleMouseMovement(event: MouseEvent) {
    setX(event.x);
    setY(event.y);
  }

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMovement);

    return () => window.removeEventListener("mousemove", handleMouseMovement);
  }, []);

  return [x, y];
}
