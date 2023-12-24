import { Button, withStyles } from '@material-ui/core';

export const GreenButton = withStyles({
  root: {
    color: '#ffffff',
    backgroundColor: '#70b920',
    '&:hover': {
      backgroundColor: '#61a01d',
    },
  },
  label: {
    fontFamily: 'AvenirNext-DemiBold',
  },
})(Button);
