import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TableCell, TableHead, TableRow, TableSortLabel } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const useTableCellStyle = makeStyles(
  (theme) => ({
    root: {
      fontWeight: 500,
      fontFamily: 'AvenirNext',
      fontStretch: 'normal',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      fontStyle: 'normal',
      borderBottom: '1px solid #e0e0eb',
      padding: '10px 15px',
    },
    head: {
      color: '#bebfc0',
      textTransform: 'uppercase',
    },
  }),
  { name: 'MuiTableCell' },
);

const ListHeader = (props) => {
  const { desc, orderBy, onRequestOrder, fields, classTableHead, classTableCell, classTableSortLabel } = props;
  const classes = useStyles();
  useTableCellStyle();
  const createSortHandler = (property) => (event) => {
    onRequestOrder(event, property);
  };
  return (
    <TableHead className={classTableHead}>
      <TableRow>
        {fields.map(
          (field) =>
            !field.hidden && (
              <TableCell key={field.id} sortDirection={orderBy === field.id ? (desc ? 'desc' : 'asc') : false} className={classTableCell} style={{minWidth: field.minWidth || 'auto', width: field.width || 'auto'}} align={field.align || 'left'}>
                {!field.isDisableSort ? (
                  <TableSortLabel
                    active={orderBy === field.id}
                    direction={desc ? 'desc' : 'asc'}
                    onClick={createSortHandler(field.id)}
                    className={classTableSortLabel}
                  >
                    {field.label}
                    {orderBy === field.id ? (
                      <span className={classes.visuallyHidden}>{desc ? 'sorted descending' : 'sorted ascending'}</span>
                    ) : null}
                  </TableSortLabel>
                ) : (
                  field.label
                )}
              </TableCell>
            ),
        )}
      </TableRow>
    </TableHead>
  );
};
export default React.memo(ListHeader);
