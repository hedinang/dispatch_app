import React from 'react';
import * as M from '@material-ui/core';
import * as S from "./styles";
import {lightTheme} from "../../../themes";
import {mainTheme} from "./styles";

const mapToTheme = {
  light: lightTheme,
  main: mainTheme,
};

const customTheme = M.createTheme({
  spacing: 1,
});

export default function AxlMUIInput({children, spacing = 1, theme = 'light', ...props}) {
  return(<M.ThemeProvider theme={mapToTheme[theme]}>
    <M.Box width={1} padding={customTheme.spacing(spacing)} boxSizing={'border-box'}>
      <M.InputBase fullWidth {...props}>
        {children}
      </M.InputBase>
    </M.Box>
  </M.ThemeProvider>);
}
