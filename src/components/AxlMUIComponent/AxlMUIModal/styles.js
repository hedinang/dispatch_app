import * as M from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

export const Container = M.styled(M.Box)(({theme}) => ({}));
export const Box = M.styled(M.Box)(({theme}) => ({
  padding: '7.5px 8.5px',
  borderRadius: 5,
  border: `1px solid ${theme.palette.primary.graySeventh}`,
  backgroundColor: theme.palette.primary.grayFourth
}));