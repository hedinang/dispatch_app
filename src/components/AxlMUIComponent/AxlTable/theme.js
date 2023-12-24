import * as M from "@material-ui/core";
import {lightTheme, defaultTheme} from "../../../themes";
import fonts from "../../../themes/fonts";
import colors from "../../../themes/colors";

const mainTheme = M.createTheme({
  palette: {
    primary: colors,
  },
  overrides: {
    MuiTable: {
      root: {
        minWidth: 650,
        backgroundColor: colors.white,
      }
    },
    MuiTableBody: {
      root: {},
    },
    MuiTableCell: {
      root: {
        color: colors['greyish-brown'],
        fontFamily: fonts.Medium,
        fontSize: 14,
      },
      head: {
        color: colors.gray,
      },
      body: {
      }
    },
    MuiTableRow: {
      root: {
        '&$selected': {
          backgroundColor: '#887fff1a',
        },
        '&$selected:hover': {
          backgroundColor: '#887fff1a',
        }
      },
    },
  },
});

const darkTheme = M.createTheme({
  palette: {
    primary: colors,
  },
  overrides: {
    MuiTable: {
      root: {
        minWidth: 650,
        backgroundColor: colors.blueEyes,
        borderRadius: 3,
        overflow: 'hidden',
      }
    },
    MuiTableBody: {
      root: {},
    },
    MuiTableCell: {
      root: {
        color: colors['greyish-brown'],
        fontFamily: fonts.Medium,
        fontSize: 14,
        borderBottom: 'none',
      },
      head: {
        color: colors.white,
        backgroundColor: colors.blueNightTwo,
      },
      body: {
      }
    },
  },
});

export {
  lightTheme, defaultTheme, mainTheme, darkTheme
}
