import { makeStyles } from "@material-ui/core";
import colors from "../../themes/colors";

export const useStyles = makeStyles((theme) => ({
    tab: {
        textTransform: 'none',
        backgroundColor: `${colors.blueEyes}`,
        borderTop: `1px solid ${colors.grayMain}`,

        '&:last-child': {
            borderBottom: `1px solid ${colors.grayMain}`,
        }
    },
    startIcon: {
        marginRight: '0px',
    },
    tabsInfo: {
        marginLeft: '24px',
        height: 24,
    },
    btnHistoryIcon: {
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: '4px',
        padding: '5px 12px',
    },
    paperHistory: {
        bottom: 0,
        top: props => Math.max(0, 100 - props.offset),
        maxHeight: props => `calc(100% - ${Math.min(0, 100 - props.offset) + Math.max(0, 100 - props.offset)}px)`,
        minWidth: 300,
        maxWidth: 500,
    },
  appBar: {
    backgroundColor: 'unset',
    color: '#5a5a5a',
    fontFamily: 'AvenirNext',
    fontWeight: 600,
    boxShadow: 'none',
  },
  muiTabRoot: {
    minWidth: 10,
    padding: '12px 0px',
    marginRight: 32,
    textTransform: 'none',
    fontFamily: 'AvenirNext',
    fontWeight: 600,

    '& .MuiTab-wrapper': {
      alignItems: 'flex-start',
    },

    '&:nth-child(3)': {
      minWidth: 70, 
    },
    '&:nth-child(4)': {
      minWidth: 80, 
    }
  },
  tabPanel: {
    flex: 1,
    backgroundColor: 'rgb(245, 245, 245)',
    marginLeft: 24,
    marginTop: 8,
    padding: 16
  },
  appBarVertical: {
    backgroundColor: 'unset',
    boxShadow: 'none',
    flexShrink: 0,
    width: 255,
    color: '#3b3b3b',
    '& .Mui-selected': {
      backgroundColor: `${colors.periwinkleSecondary}`,
      color: `${colors.white}`
    }
  },
  tabPanelVertical: {
    flex: 1,
    borderTop: '1px solid rgb(204, 204, 204)',
    borderLeft: '1px solid rgb(204, 204, 204)',
    padding: 16,
    maxWidth: 'calc(100% - 290px)',
    maxHeight:'1100px',
    overflowY:'auto',
  },
  tabsVehicleInfo: {
    height: 24,
    marginLeft: 16,
  },
  tabPanelVehicle: {
    flex: 1,
    backgroundColor: 'rgb(245, 245, 245)',
    padding: 16
  },
}));