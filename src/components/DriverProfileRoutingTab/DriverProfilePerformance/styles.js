import {styled, Typography, Paper} from "@material-ui/core";
import fonts from "../../../themes/fonts";
import colors from "../../../themes/colors";

export const Container = styled(Paper)(({theme}) => ({
  height: 'calc(100% - 40px)',
}));
export const Text = styled(Typography)(({theme}) => ({
  fontFamily: fonts.Regular,
  fontSize: 13,
  marginBottom: theme.spacing(1),
}));
export const Title = styled(Typography)(({theme}) => ({
  fontFamily: fonts.DemiBold,
  fontSize: 16,
  marginBottom: theme.spacing(1),
}));
export const Title2 = styled(Title)(({theme}) => ({
  color: colors['greyish-brown'],
}));
export const Text1 = styled(Text)(({theme}) => ({
  fontSize: 13,
  fontFamily: fonts.Bold,
  color: '#bfc0c1',
  display: 'flex',
  alignItems: 'center',
}));
export const Text2 = styled(Text)(({theme}) => ({
  fontSize: 13,
  fontFamily: fonts.Medium,
  color: colors['greyish-brown'],
  wordBreak: 'break-word',
}));
export const Text3 = styled(Text)(({theme}) => ({
  fontSize: 13,
  fontFamily: fonts.Medium,
  color: 'inherit',
}));
export const Text4 = styled(Text)(({theme}) => ({
  fontSize: 16,
  fontFamily: fonts.DemiBold,
}));
export const Text5 = styled(Text)(({theme}) => ({
  fontSize: 13,
  fontFamily: fonts.Regular,
}));
export const Link = styled('a')(({theme}) => ({
  fontSize: 13,
  fontFamily: fonts.Medium,
  color: '#4a90e2',
  textDecoration: 'underline',
  cursor: 'pointer',
}));