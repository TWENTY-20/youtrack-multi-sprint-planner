import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { getHideFinished, saveHideFinished } from "./globalStorageAccess";

export function useHideFinishedSprints(
  defaultValue: boolean
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [state, setState] = useState<boolean>(defaultValue);
  const isFirstRender = useRef(true); // Track first render

  // Load initial value
  useEffect(() => {
    getHideFinished()
      .then((value) => {
        setState(value as boolean);
      })
      .catch((ex) => {
        console.error("Failed to get hide finished state", ex);
      });
  }, []);

  // Save state to storage (but skip first render)
  useEffect(() => {
    if (state === undefined) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false; // Skip first execution
      return;
    }

    saveHideFinished(state).catch((ex) => {
      console.error("Failed to save hide finished state", ex);
    });
  }, [state]);

  return [state, setState];
}
