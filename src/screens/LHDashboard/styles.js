import { makeStyles } from '@material-ui/core';
import colors from '../../themes/colors';

export const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#43425d',
  },
  moreInfo: {
    backgroundColor: '#43425d',
    color: colors.white,
    '&:hover': {
      color: colors.white,
      backgroundColor: '#43425d',
    },
  },
  csvdownload: {
    float: 'right',
    paddingBottom: '0.5rem',
  },
  tabs: {
    marginLeft: '42px',
  },
  tab: {
    textTransform: 'inherit',
  },
  autocomplete: {
    minWidth: '15rem',
    fontSize: '0.8125rem',
  },
  paperContainer: {
    height: '100%',
    backgroundColor: '#f0f0f7',
  },
  tableContainer: {
    height: '100%',
    maxHeight: 'calc(100vh - 270px)',
  },
  tableHeader: {
    backgroundColor: '#43425d',
    color: 'colors.white !important',
  },
  tableCell: {
    backgroundColor: '#43425d',
    color: colors.white,
    textTransform: 'unset',

    '&:hover': {
      color: colors.white,
    },
  },
  'MuiTableCell-head': {
    color: 'colors.white !important',
  },
  stickyHeader: {
    color: 'colors.white !important',
  },
  tableSortLabel: {
    color: colors.white,
    '&:hover': {
      color: colors.white,
    },
    '&:focus': {
      color: colors.white,
    },
    '&.MuiTableSortLabel-active': {
      color: colors.white,
      fontWeight: 'bold',

      '& .MuiTableSortLabel-icon': {
        color: `${colors.white} !important`,
      },
    },
  },
  iconButton: {
    padding: 0,
  },
  note: {
    fontWeight: 500,
    paddingRight: '0.5rem',
  },
  dialogContent: {
    overflowX: 'hidden',
  },
}));
