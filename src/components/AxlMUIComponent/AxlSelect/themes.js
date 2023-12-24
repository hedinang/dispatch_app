import colors from "../../../themes/colors";
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  spacing: 8,
});

export const mainTheme = createTheme({
  overrides: {
    MuiInputBase: {
      root: {
        padding: theme.spacing(1, 4, 1, 1),
        display: 'flex',
        lineHeight: 1,
      },
    },
    MuiSelect: {
      root: {
        padding: theme.spacing(0),
      },
      select: {
        '&:focus': {
          backgroundColor: colors.transparent,
        }
      },
      selectMenu: {},
      outlined: {},
    },
  }
});
