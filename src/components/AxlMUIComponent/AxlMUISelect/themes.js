import colors from "../../../themes/colors";
import fonts from "../../../themes/fonts"
import { createTheme } from '@material-ui/core/styles';
import * as themes from "../../../themes";

const theme = createTheme({
  // spacing: 8,
});

export const mainTheme = createTheme({
  overrides: {
    MuiButton: {
      root: {
        paddingBottom: theme.spacing(0.5),
        borderBottom: `1px solid ${colors.periwinkle}`,
        borderRadius: theme.spacing(0),
        minWidth: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textTransform: 'none',
        textAlign: 'left',
        '&:hover': {
          backgroundColor: colors.transparent
        }
      },
      label: {},
      text: {
        padding: 0,
      },
      textPrimary: {
        color: 'red'
      }
    },
    MuiIconButton: {
      root: {},
      label: {}
    },
    MuiSvgIcon: {
      root: {
        color: colors.gray,
      }
    },
    MuiTypography: {
      root: {
        fontFamily: fonts.Bold,
        color: colors.gray,
        fontSize: 13,
      }
    },
    MuiTouchRipple: {
      root: {
        display: 'none',
      }
    }
  }
});

export const primaryTheme = createTheme({
  ...themes.lightTheme,
  overrides: {
    MuiBox: {
      root: {
        paddingBottom: theme.spacing(0.5),
        border: `1px solid ${colors.gray}`,
        borderRadius: theme.spacing(0),
        minWidth: 120,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }
    },
    MuiButton: {
      root: {
        border: `1px solid ${colors.gray}`,
        color: colors.gray,
        backgroundColor: colors.main,
        padding: '3px 15px !important',
        textTransform: 'none',
        borderRadius: theme.spacing(0),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        justifyContent: 'flex-start',
        '&:hover': {
          backgroundColor: colors.transparent
        }
      },
      label: {},
      text: {
        padding: 0,
      },
      textPrimary: {
        color: 'red'
      }
    },
    MuiIconButton: {
      root: {},
      label: {}
    },
    MuiSvgIcon: {
      root: {
        color: colors.gray,
      }
    },
    MuiList: {
      root: {
        padding: theme.spacing(1),
      }
    }
  }
});

export const lightTheme = createTheme({
  overrides: {
    MuiBox: {
      root: {
        paddingBottom: theme.spacing(0.5),
        border: `1px solid ${colors.gray}`,
        borderRadius: theme.spacing(0.375),
        minWidth: 120,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }
    },
    MuiButton: {
      root: {
        border: `1px solid ${colors.gray}`,
        color: colors.gray,
        backgroundColor: colors.main,
        padding: '0 10px !important',
        textTransform: 'none',
        '&:hover': {
          backgroundColor: colors.transparent
        }
      },
      label: {},
      text: {
        padding: 0,
      },
      textPrimary: {
        color: 'red'
      }
    },
    MuiIconButton: {
      root: {},
      label: {}
    },
    MuiSvgIcon: {
      root: {
        color: colors.gray,
      }
    }
  }
});
