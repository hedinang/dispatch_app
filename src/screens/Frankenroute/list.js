import React, {useEffect, useState} from "react";
import {Box, Button, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, LinearProgress} from "@material-ui/core";
import moment from "moment";

import useStyles from "./styles";
import {listProblems} from "../../stores/api";

function ListFrankenRoute(props) {
  const classes = useStyles();
  const {clients} = props;
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ownOnly, setOwnOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    listProblems(ownOnly).then(res => {
      if (res.ok) {
        setProblems(res.data);
      } else {
        setProblems([]);
      }
      setLoading(false);
    })
  }, [])

  const getStatusColor = (status) => {
    if (!status) return undefined;

    if (status === 'CONFIRMED') {
      return '#199000';
    } else if (status === 'COMPLETED') {
      return '#b3a52f';
    } else if (status.indexOf('FAIL') > -1 || status.indexOf('ERROR') > -1) {
      return '#ff0000';
    } else {
      return undefined;
    }
  }

  const renderClients = (ids) => {
    if (!ids) return '';
    const names = ids.map(id => {
      const client = clients.filter(cl => cl.id === id).pop();
      if (!client || !client.company) {
        return id;
      }
      return client.company;
    });

    return names.join(", ");
  }

  const renderActions = (v, item) => {
    return (
      <Button href={`/frankenroute/${item.id}`} target="_self" size="small" variant="outlined" disableElevation>
        View
      </Button>
    )
  }

  const columns = [
    {field: "_created", label: "Created", renderer: (v) => moment(v).format("MM/DD ddd")},
    {field: "dropoff_earliest_ts", label: "Delivery Date", renderer: (v) => moment(v).format("MM/DD ddd")},
    {field: "regions", label: "Regions", renderer: (v) => v ? v.join(', ') : ''},
    {field: "client_ids", label: "Clients", renderer: renderClients},
    {field: "num_shipments", label: "No. of shipments", renderer: (v) => v},
    {field: "creator_name", label: "Created by"},
    {field: "status", label: "Status", renderer: (v) => <Box style={{color: getStatusColor(v)}}>{v}</Box>},
    {field: "", label: "Actions", renderer: renderActions},
  ];

  if (loading) {
    return (
      <Box align="center">
        <Box>Loading recent problems</Box>
        <LinearProgress color="primary" />
      </Box>
    )
  }

  return (
    <TableContainer className={classes.tableContainer}>
      <Table stickyHeader className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableHead}>
            {columns.map(col => (
              <TableCell className={classes.tableHead}>{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {problems.map(prb => (
            <TableRow className={classes.tableRow}>
              {columns.map(col => {
                const {field, renderer} = col;
                const value = prb[field];

                return (
                  <TableCell className={classes.tableCell}>
                    {renderer ? renderer(value, prb) : value}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ListFrankenRoute;