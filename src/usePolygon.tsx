import * as React from "react";
import { Point } from "./polygon-utils";

type Action = ["addPoint", Point] | ["clear"] | ["redo"] | ["undo"];

type State = {
  undoHistory: Point[];
  points: Point[];
};

const initialState: State = {
  points: [],
  undoHistory: [],
};

function reducer(state: State, action: Action): State {
  const [actionType, payload] = action;

  switch (actionType) {
    case "addPoint":
      return {
        points: [...state.points, payload as Point],
        undoHistory: [],
      };

    case "clear":
      return initialState;

    case "redo":
      if (state.undoHistory.length === 0) {
        return state;
      }

      return {
        points: [...state.points, state.undoHistory.at(-1)!],
        undoHistory: state.undoHistory.slice(0, -1),
      };

    case "undo":
      if (state.points.length === 0) {
        return state;
      }

      return {
        points: state.points.slice(0, -1),
        undoHistory: [...state.undoHistory, state.points.at(-1)!],
      };
  }
}

export function usePolygon() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return {
    ...state,
    addPoint: (point: Point) => dispatch(["addPoint", point]),
    clear: () => dispatch(["clear"]),
    redo: () => dispatch(["redo"]),
    undo: () => dispatch(["undo"]),
  };
}
