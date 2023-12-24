import fonts from "../../../themes/fonts"
import { createTheme } from '@material-ui/core/styles';
import * as themes from '../../../themes';

const theme = createTheme({
  // spacing: 8,
});

export const mainTheme = createTheme({
  ...themes.lightTheme,
  overrides: {
    MuiInputBase: {
      root: {
        border: 'none',
      },
    },
    MuiIconButton: {
      root: {
        padding: 0,
      }
    }
  }
});

export const lightTheme = createTheme({
  ...themes.lightTheme,
  overrides: {
    MuiInputBase: {
      root: {
        border: 'none',
      },
    },
    MuiIconButton: {
      root: {
        padding: 0,
      }
    }
  }
});
