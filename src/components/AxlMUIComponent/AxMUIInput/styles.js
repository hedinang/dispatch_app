import React from 'react';
import * as M from '@material-ui/core';
import {lightTheme} from "../../../themes";
import {placeholder} from "../../../themes/pseudo";

export const mainTheme = M.createTheme({
  overrides: {
    MuiInputBase: {
      root: {
        borderRadius: 30,
        border: `1px solid ${lightTheme.palette.primary.grayTwelfth}`,
        padding: '7px 15px',
      },
      input: {
        padding: 0,
        height: 'auto',
        lineHeight: 1.3,
        ...placeholder({
          fontFamily: 'AvenirNext-Regular',
          fontSize: 12,
          fontWeight: 500,
          color: lightTheme.palette.primary.grayTwelfth,
          opacity: 1,
        })
      },
      inputMultiline: {
        ...placeholder({
          fontFamily: 'AvenirNext-Regular',
          fontSize: 10,
          fontWeight: 500,
          color: lightTheme.palette.primary.grayTwelfth,
          opacity: 1,
        })
      },
      colorSecondary: {
        backgroundColor: lightTheme.palette.primary.whiteTwo,
      },
    }
  }
})
