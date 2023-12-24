import React from 'react';
import { Table, TableCell, Typography, TableRow } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  description: {
    padding: '8px 24px',
    textAlign: 'left'
  },
  descriptionTable: {
    '&>tr>td': {
      borderBottom: 'none',
      padding: '5px',
      width: '50%',
    },
  },
}));
const Description = () => {
  const classes = useStyles();
  return (
    <div className={classes.description}>
      <Typography>Noted*</Typography>
      <Table className={classes.descriptionTable}>
        <TableRow>
          <TableCell>{'${customer_name}'}</TableCell>
          <TableCell>Customer name</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{'${tracking_link}'}</TableCell>
          <TableCell>Link to tracking code</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{'${client_name}'}</TableCell>
          <TableCell>Client Name</TableCell>
        </TableRow>
      </Table>
    </div>
  );
};

export default Description;
