import {Box, styled} from '@material-ui/core';
import colors from '../../../themes/colors';
import fonts from '../../../themes/fonts'

export const Text = styled(Box)(({theme}) => ({
  fontFamily: fonts.Medium,
  fontSize: 11,
  color: colors['greyish-brown'],
}));

export const LinkToActive = styled('a')(({theme}) => ({
  border: `1px solid ${colors.periwinkle}`,
  padding: theme.spacing(1, 2, 1, 2),
  fontSize: 13,
  color: colors.periwinkle,
  fontFamily: fonts.DemiBold,
  display: 'inline-block',
  borderRadius: theme.spacing(0.375),
  textDecoration: 'none',
}));

export default {}