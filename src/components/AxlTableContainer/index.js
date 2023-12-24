import { LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableRow, makeStyles } from '@material-ui/core';
import React from 'react';
import _ from 'lodash';

import ListHeader from './header';

export const useStyles = makeStyles((theme) => ({
  tableCellSmall: {
    padding: '8px 15px',
  }
}))

function AxlTableContainer({ isLoading, fields, data, colSpan, desc, orderBy, handleRequestSort, size = 'small' }) {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      {isLoading ? <LinearProgress /> : (
        <Table stickyHeader size={size}>
          <ListHeader fields={fields} desc={desc} orderBy={orderBy} onRequestOrder={handleRequestSort}/>
          {(!data || data.length === 0) ? (
            <TableBody>
              <TableRow>
                <TableCell component='th' scope='row' colSpan={colSpan} align='center' classes={{root: size === 'small' && classes.tableCellSmall}}>
                  No data
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {data && data.map((item, idx) => {
                return (
                  <TableRow key={idx}>
                    {fields.map((field, idx) => {
                      return field && !field.hidden &&
                        <TableCell component='th' scope='row' align={field.align || 'left'} key={field.fieldName + idx} classes={{root: size === 'small' && classes.tableCellSmall}}>
                          {
                            field.renderer ? field.renderer(item[field.fieldName], item, data) : item[field.fieldName]
                          }</TableCell>;
                    })}
                  </TableRow>
                );
              })
              }
            </TableBody>
          )}
        </Table>
      )}
    </TableContainer>
  );
}

export default AxlTableContainer;