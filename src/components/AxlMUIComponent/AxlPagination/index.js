import React from 'react';
import Pagination from '@material-ui/lab/Pagination';
import {Box, ThemeProvider} from "@material-ui/core";
import * as themes from "./theme";
import THEME_DEFINED from "../../../constants/theme";

export default function AxlPagination({theme = 'main', ...props}) {
  return <ThemeProvider theme={themes[THEME_DEFINED[theme]]}>
    <Box>
      <Pagination {...props} />
    </Box>
  </ThemeProvider>;
}
