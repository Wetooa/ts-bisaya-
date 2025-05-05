import { InvalidTokenizerStateException } from "../../exceptions/lexer";
import { StateType } from "./consts/state-type";

import { transitions } from "./consts/transitions";
import { isEndState } from "./utils";

export function transition(currentStateType: StateType, c: string): StateType {
  if (isEndState(currentStateType)) {
    return transition(StateType.START, c);
  }

  const transitionFn = transitions.get(currentStateType);

  if (!transitionFn) {
    throw new InvalidTokenizerStateException();
  }

  return transitionFn(c);
}
