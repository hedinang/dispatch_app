import { createTheme } from '@material-ui/core/styles';

import fonts from './fonts';
import colors from './colors';
import { placeholder } from './pseudo';

const theme = createTheme();

const palette = {
  primary: {
    main: '#887fff',
  },
  secondary: {
    main: '#2a2444',
    subsidiary: '#ccccc',
  },
  third: {
    main: '#6c62f5',
  },
  text: {
    primary: '#4f4c75',
    secondary: '#6c62f5',
    third: '#4a4a4a',
    select: '#737273',
  },
  background: {
    paper: '#FFF',
    list: '#f4f3ff',
  },
  color: colors,
};

const typography = {
  fontFamily: 'AvenirNext',
  h1: {
    fontFamily: 'AvenirNext-DemiBold',
  },
  h2: {
    fontFamily: 'AvenirNext-DemiBold',
  },
  h3: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 26,
    fontWeight: 600,
    color: '#4a4a4a',
  },
  h4: {
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 16,
    fontWeight: 600,
    color: '#5e5b78',
  },
  h5: {
    fontFamily: 'AvenirNext-DemiBold',
  },
  h6: {
    fontFamily: 'AvenirNext-DemiBold',
  },
  body1: {
    fontFamily: 'AvenirNext',
    fontSize: 13.5,
    color: '#393060',
    lineHeight: 1.3,
  },
  body2: {
    fontFamily: 'AvenirNext',
    fontSize: 10,
  },
  subtitle1: {
    lineHeight: '1.3em',
  },
  button: {},
};

// eslint-disable-next-line import/prefer-default-export
export const lightTheme = createTheme({
  palette: palette,
  typography: typography,
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: colors.blackdrop,
      },
      invisible: {},
    },
    MuiButton: {
      root: {
        borderRadius: 3,
      },
      label: {
        fontFamily: 'AvenirNext',
        fontSize: 14,
        fontWeight: 600,
        textTransform: 'none',
        whiteSpace: 'nowrap',
      },
    },
    MuiLinearProgress: {
      root: {
        height: 3,
      },
      colorPrimary: {
        color: colors.gray,
        backgroundColor: colors.grayMain,
      },
      barColorPrimary: {
        backgroundColor: colors.periwinkle,
      },
    },
    MuiCheckbox: {
      root: {
        color: colors.gray,
        '&$checked': {
          color: colors.periwinkle,
        },
      },
      colorPrimary: {
        color: colors.gray,
        '&$checked': {
          color: colors.periwinkle,
        },
      },
      colorSecondary: {
        color: colors.gray,
        '&$checked': {
          color: colors.periwinkle,
        },
      },
    },
    MuiRadio: {
      root: {},
      colorPrimary: {
        color: colors.gray,
      },
    },
    MuiFormControlLabel: {
      label: {
        color: colors.blackMain,
      },
    },
    MuiInputBase: {
      root: {},
      input: {
        borderRadius: 4,
        ...placeholder({
          fontFamily: 'AvenirNext',
          fontSize: 10,
          fontWeight: 500,
          color: '#bfbfbf',
          opacity: 0.45,
        }),
      },
      inputMultiline: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        ...placeholder({
          fontFamily: 'AvenirNext',
          fontSize: 10,
          fontWeight: 500,
          color: '#bfbfbf',
          opacity: 1,
        }),
      },
      colorSecondary: {
        backgroundColor: colors.whiteTwo,
      },
    },
    MuiTableCell: {
      root: {
        fontFamily: fonts.Medium,
        fontSize: 14,
      },
      head: {
        color: colors.blackMain,
      },
      body: {},
    },
    MuiTabs: {
      root: {},
      vertical: {},
      flexContainer: {},
      flexContainerVertical: {},
      centered: {},
      scroller: {},
      fixed: {},
      scrollable: {},
      scrollButtons: {},
      scrollButtonsDesktop: {},
      indicator: {
        height: 5,
        backgroundColor: colors.periwinkle,
      },
    },
    MuiTab: {
      root: {},
      selected: {},
      textColorInherit: {},
      textColorPrimary: {},
      textColorSecondary: {},
    },
    MuiTimeline: {},
    MuiTimelineItem: {
      root: {
        '&:nth-last-child(1) .MuiTimelineConnector-root': {
          display: 'none',
        },
      },
    },
    MuiTimelineDot: {
      root: {
        marginTop: 0,
        marginBottom: 0,
      },
      defaultGrey: {},
      outlinedGrey: {},
      defaultPrimary: {
        backgroundColor: colors.periwinkle,
      },
      outlinedPrimary: {
        backgroundColor: colors.periwinkle,
      },
      defaultSecondary: {
        backgroundColor: colors.red,
      },
      outlinedSecondary: {
        backgroundColor: colors.red,
      },
    },
    MuiTimelineSeparator: {
      root: {
        position: 'relative',
        top: 30,
      },
    },
    MuiTimelineConnector: {
      root: {
        width: 1,
        backgroundColor: colors.transparent,
        borderLeftWidth: 1,
        borderLeftStyle: 'dotted',
        borderLeftColor: colors.graySeventh,
      },
    },
    MuiList: {},
    MuiListItem: {
      root: {
        '&$selected': {
          color: colors.white,
          backgroundColor: colors.periwinkle,
        },
        '&$selected:hover': {
          color: colors.white,
          backgroundColor: colors.periwinkle,
        },
      },
    },
    MuiTooltip: {
      popper: {
        zIndex: 100000,
      },
    },
    MuiPopover: {
      root: {
        zIndex: '100000 !important',
      },
    },
  },
  props: {
    MuiButton: {
      disableElevation: true,
    },
  },
});
