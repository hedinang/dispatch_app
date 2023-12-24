import * as M from '@material-ui/core';
import {lightTheme, colors} from "../../../themes";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

export const HeaderButton = M.styled(M.IconButton)(({theme}) => ({
  fontFamily: 'AvenirNext-Medium',
  fontSize: 11,
  fontWeight: 500,
  padding: theme.spacing(0),
  color: theme.palette.primary.white
}));

export const IconArrowDropDown = M.styled(ArrowDropDownIcon)(({theme}) => ({
  verticalAlign: 'middle',
  cursor: 'pointer'
}));

export const mainTheme = M.createTheme({
  palette: {
    primary: colors
  },
  overrides: {
    MuiTable: {
      root: {
        border: `1px solid ${colors.grayMain}`,
      }
    },
    MuiTableHead: {
      root: {
        backgroundColor: colors.gray,
      }
    },
    MuiTableRow: {
      root: {
        "&$hover:hover": {
          cursor: 'pointer',
          backgroundColor: colors.periwinkleFourth,
        }
      },
      hover: {
        "&:hover": {
          backgroundColor: colors.periwinkleFourth,
        }
      },
    },
    MuiTableCell: {
      root: {
        fontSize: 14,
        borderBottom: `1px solid ${colors.grayMain}`,
        padding: lightTheme.spacing(2.5),
      },
      head: {
        fontSize: 14,
        backgroundColor: colors.textSecondary,
        fontFamily: 'AvenirNext-Medium',
        fontWeight: 500,
        color: colors.white,
        lineHeight: 1.3,
        padding: lightTheme.spacing(1.5),
      },
      body: {
        fontFamily: 'AvenirNext-Medium',
        fontSize: 14,
        fontWeight: 500,
        color: colors.blackSecondary,
        paddingLeft: lightTheme.spacing(1.5),
        paddingRight: lightTheme.spacing(1.5),
      }
    },
  }
})
