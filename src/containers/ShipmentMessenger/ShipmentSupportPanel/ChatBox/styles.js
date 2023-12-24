import {Typography, styled, Box} from "@material-ui/core";

export const SeenText = styled(Typography)({
  fontFamily: 'AvenirNext-DemiBoldItalic',
  fontSize: 9.5,
  fontWeight: 600,
  fontStyle: 'italic',
  textAlign: 'left',
  color: '#393060',
  paddingLeft: 5,
  paddingRight: 5
});

export const Scroll = styled(Box)({
  overflow: 'hidden',
  width: '100%'
});
export const InnerScroll = styled(Box)({
  display: 'flex',
  alignContent: 'flex-start',
  flexDirection: 'row',
  width: '100%',
  overflowX: 'scroll',
  marginBottom: -20,
  paddingBottom: 20
});