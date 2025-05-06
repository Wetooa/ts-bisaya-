import { InvalidTokenizerStateException } from "../../exceptions/lexer";
import { StateType } from "../../consts/lexer/state-type";

import { transitions } from "../../consts/lexer/transitions";
import { isEndState } from "../../utils/lexer";

export function transition(currentStateType: StateType, c: string): StateType {
  if (isEndState(currentStateType)) {
    return transition(StateType.START, c);
  }

  const transitionFn = transitions[currentStateType];

  if (!transitionFn) {
    throw new InvalidTokenizerStateException();
  }

  return transitionFn(c);
}
