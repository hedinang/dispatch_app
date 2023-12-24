import {Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider} from "@material-ui/core";
import * as themes from "./theme";
import THEME_DEFINED from "../../../constants/theme";
import _ from "lodash";
import AxlPagination from "../AxlPagination";
import React, {useEffect, useState} from "react";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

export default function AxlTable({
  theme = 'main',
  fields = [],
  page = 1,
  result = {
   page: 0,
   count: 0,
   size: 10,
   items: [],
  },
  pagination = true,
  allowSelect = false,
  multipleSelect = true,
  rerender = [],
  onChange = () => {},
  selectedCallback = () => {},
  orderBy = (field) => {},
  orderByDefault = 'id',
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderByStatus, setOrderByStatus] = useState({});

  useEffect(() => {
    selectedCallback(selectedCallback);
  }, [selectedItems]);

  useEffect(() => {
    if(orderByDefault) {
      setOrderByStatus({[orderByDefault]: !orderByStatus[orderByDefault]});
    }
  }, [orderByDefault]);

  const select = (item) => {
    if(!allowSelect) return false;

    if(_.includes(selectedItems, item)) {
      const remove = _.remove(selectedItems, (i) => !_.isEqual(i, item));
      setSelectedItems(remove);
    } else {
      if(multipleSelect) {
        setSelectedItems(_.concat(selectedItems, item));
      } else {
        setSelectedItems([item])
      }
    }
  };

  const orderByHandle = (name) => {
    setOrderByStatus({[name]: !orderByStatus[name]});
    orderBy({[name]: !orderByStatus[name]});
  };

  return <ThemeProvider theme={themes[THEME_DEFINED[theme]]}>
    <Box>
      <TableContainer component={Box}>
        <Table>
          <TableHead>
            <TableRow>
              {fields.map((field, idx) => <TableCell key={idx}
              onClick={() => _.get(field, 'order', false) && orderByHandle(_.get(field, 'name'))}>
                {_.get(field, 'label', '-')}
                {_.get(field, 'order') && (orderByStatus[_.get(field, 'name')] ? <ArrowDownwardIcon style={{fontSize: 12}} /> : <ArrowUpwardIcon style={{fontSize: 12}} />)}
              </TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {!!result.items.length && result.items.map((item, x) => (
              <TableRow key={x}
                        allowSelect
                        value={item}
                        selected={_.includes(selectedItems, item)}
                        onClick={() => select(item)}>
                {fields.map((field, y) => {
                  return <TableCell key={y} component="th" scope="row">
                    {!rerender[field.name] ? _.defaultTo(item[field.name], '-') : rerender[field.name](item[field.name], item, result)}
                  </TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && <Box py={1} display="flex" justifyContent="center">
        <AxlPagination onChange={onChange} count={Math.ceil(result.count/result.size)} page={page} />
      </Box>}
    </Box>
  </ThemeProvider>
}