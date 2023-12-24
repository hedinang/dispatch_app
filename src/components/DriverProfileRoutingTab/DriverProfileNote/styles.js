import { makeStyles } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

export const useStyles = makeStyles(() => ({
    card: {
      display: 'flex', 
      flex: '1 1 auto', 
      flexDirection:'column',
      "& .actions": {
        opacity: 0
      },
      "&:hover .actions":  {
        opacity: 1,
        alignSelf: 'center',
        marginRight: '5px'
      }
    },
    cursor: {
      cursor: 'pointer'
    },
    cardContent: {
      padding: '0px !important'
    },
    caption: {
      color: grey[500],
      padding: '8px 12px',
      backgroundColor: 'rgb(238,238,238)',
      display: 'block',
    },
    content: {
      display: 'inline-block',
      backgroundColor: '#fff',
      padding: '8px 12px 12px 12px',
      width: '100%',
      fontSize: '14px',
      color: '#3b3b3b'
    },
    username: {
      color: '#3b3b3b',
      fontFamily: 'sans-serif',
      fontSize: '0.9rem',
      fontWeight: 'bold'
    }
  }));