import {styled, Typography, Box} from '@material-ui/core';
import fonts from "../../themes/fonts";
import colors from "../../themes/colors";

export const Text = styled(Typography)(({theme}) => ({
  fontSize: 15,
  fontFamily: fonts.Medium,
}));
export const Label = styled(Text)(({theme}) => ({
  color: colors.gray,
}));
export const LabelStrong = styled(Text)(({theme}) => ({
  color: colors.gray,
  fontFamily: fonts.DemiBold,
}));
export const Title = styled(Text)(({theme}) => ({
  color: colors["greyish-brown"],
  fontFamily: fonts.Bold,
  fontSize: 20,
  margin: theme.spacing(1, 0, 2, 0),
}));
export const FormControl = styled(Box)(({theme}) => ({
  margin: theme.spacing(0.5, 0),
}));
export const Control = styled(Box)(({theme}) => ({}));
export const Controls = styled(Box)(({theme}) => ({}));
export const TextOption = styled('i')(({theme}) => ({
  fontFamily: fonts.MediumItalic,
  fontSize: 13,
  color: colors.gray,
  marginLeft: theme.spacing(1),
}));
export const TextRequired = styled('span')(({theme}) => ({
  fontFamily: fonts.Medium,
  fontSize: 13,
  color: colors.red,
}));

export default {}