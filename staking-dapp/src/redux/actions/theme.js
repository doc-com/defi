import { THEME_COLOR, THEME_COLOR_BOOLEAN } from '../constants';

export function themeColor(value) {
  return {
    type: THEME_COLOR,
    payload: value,
  };
}

export function themeColorBoolean(value) {
  return {
    type: THEME_COLOR_BOOLEAN,
    payload: value,
  };
}
