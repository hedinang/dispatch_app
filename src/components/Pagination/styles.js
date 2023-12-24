import { makeStyles } from '@material-ui/core/styles';

export const usePaginationItemStyles = makeStyles(
  {
    root: {
      color: '#696781',
      fontWeight: 600,
      fontFamily: 'AvenirNext',
      fontStretch: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      // minWidth: '19px',
      // minHeight: '19px',
      // minWidth: 'unset',
      margin: '0 5px',
    },
    page: {
      '&.Mui-selected': {
        backgroundColor: '#887fff',
        color: 'white',
      },
    },
  },
  { name: 'MuiPaginationItem' },
);
export const rootStyle = makeStyles({
  hideLastPage: {
    '&>ul>li:nth-last-child(2)': { display: 'none' },
  },
  root: {
    padding: '6px 8px',
    display: 'flex',
    justifyContent: 'center',
    '&>.MuiPagination-root': {
      display: 'inline-flex',
    },
  },
  goTo: {
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '50px',
    fontFamily: 'AvenirNext',
    fontStretch: 'normal',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 12,
    '&>.MuiButton-root': {
      fontSize: 12,
      fontWeight: 600,
      fontFamily: 'AvenirNext',
      fontStretch: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      color: '#696781',
      minWidth: 'unset',
      padding: '0px',
      marginLeft: '9px',
    },
    '&>.MuiButton-endIcon': {
      marginRight: '0px !important',
      marginLeft: '-3px',
      marginTop: '2px',
    },
  },
  text: {
    color: '#cdccdf',
  },
  input: {
    width: '100px',
    height: '20px',
    borderRadius: '3px',
    border: 'solid 1px #cdccdf',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    marginLeft: '5px',
    color: '#696781',
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
    },
  },
  rightIcon: {
    color: '#696781',
  },
});
