import { THEME_COLOR, THEME_COLOR_BOOLEAN } from '../constants';

const initialState = {
  THEME_COLOR: 'dark',
  THEME_COLOR_BOOLEAN: false,
};
const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case THEME_COLOR:
      return {
        ...state,
        THEME_COLOR: action.payload,
      };
    case THEME_COLOR_BOOLEAN:
      return {
        ...state,
        THEME_COLOR_BOOLEAN: action.payload,
      };

    default:
      return state;
  }
};

export default themeReducer;
