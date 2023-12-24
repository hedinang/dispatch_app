import {useTheme} from "@material-ui/core/styles";

export function FEEDBACK_STATUS_TO_COLORS() {
  const theme = useTheme();
  const mapColors = {
    GOOD: theme.palette.primary.greenSecondary,
    BAD: theme.palette.primary.redThird,
    GOOD_NO_COMMENT: theme.palette.primary.transparent,
    BAD_NO_COMMENT: theme.palette.primary.transparent,
  };

  return mapColors;
}