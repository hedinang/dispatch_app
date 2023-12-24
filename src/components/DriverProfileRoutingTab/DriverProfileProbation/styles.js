import {styled, Typography} from '@material-ui/core';
import fonts from "../../../themes/fonts";
import colors from "../../../themes/colors";

export const Container = styled(Typography)(({theme, spacing}) => ({}));
export const Text = styled(Typography)(({theme, spacing}) => ({
  fontFamily: fonts.Medium,
  fontSize: 13,
  color: colors['greyish-brown'],
  marginBottom: 10,
}));
export const Text_1 = styled(Text)(({theme, spacing}) => ({
  fontSize: 20,
}));
export const Text_2 = styled(Text)(({theme, spacing}) => ({
  fontFamily: fonts.MediumItalic,
}));
export const Text_3 = styled(Text)(({theme, spacing}) => ({
  fontFamily: fonts.Bold,
  color: '#bfc0c1',
}));
export const Text_4 = styled(Text)(({theme, spacing}) => ({}));
export const Text_5 = styled(Text_3)(({theme, spacing}) => ({
  fontSize: 12,
}));
export const Text_5_1 = styled(Text_5)(({theme, spacing}) => ({
  fontSize: 11,
}));
export const Text_6 = styled(Text)(({theme, spacing}) => ({
  fontSize: 11,
}));