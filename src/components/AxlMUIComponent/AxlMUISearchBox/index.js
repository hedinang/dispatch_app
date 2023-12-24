import React from 'react';
import {Box, ThemeProvider, Grid, IconButton} from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import THEME_DEFINED from '../../../constants/theme';
import * as themes from './themes';
import AxlMUIInput from "../AxMUIInput";
import ClearIcon from '@material-ui/icons/Clear';

export default function AxlMUISearchBox({
  theme='main',
  clear = true,
  showSearch = true,
  onClear = () => {},
  ...props
}) {
  return <ThemeProvider theme={themes[THEME_DEFINED[theme]]}>
    <Box bgcolor={'primary.main'} mb={2} pl={1} pr={1}>
      <Grid container direction={'row'} wrap={'nowrap'} alignItems={'center'} spacing={1}>
        <Grid item><IconButton><SearchIcon /></IconButton></Grid>
        <Grid item xs><AxlMUIInput {...props} spacing={0} theme={themes[THEME_DEFINED[theme]]} /></Grid>
        {clear && <Grid item><IconButton onClick={onClear}><ClearIcon /></IconButton></Grid>}
      </Grid>
    </Box>
  </ThemeProvider>
}