import * as M from "@material-ui/core";
import colors from "../../../themes/colors";

export const mainTheme = M.createTheme({
  overrides: {
    MuiPagination: {},
    MuiPaginationItem: {
      page: {
        '&$selected': {
          color: colors.white,
          backgroundColor: colors.periwinkle,
        },
      },
    },
  },
});
