import {Typography, styled, Box} from "@material-ui/core";

export const NoMessageContainer = styled(Box)(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const NoMessageText = styled(Typography)({
  fontFamily: 'AvenirNext-Medium',
  fontSize: 18,
  textAlign: 'left',
  color: '#393060',
  paddingLeft: 5,
  paddingRight: 5
});
