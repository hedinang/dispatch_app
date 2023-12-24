import React, { Fragment, useEffect, useState } from 'react';

import moment from 'moment';
import { toast } from 'react-toastify';
import { Box, Button, CircularProgress, Grid, IconButton, LinearProgress, Link, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Tooltip, Typography } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import DescriptionIcon from '@material-ui/icons/Description';
import momentTz from 'moment-timezone';
import { compose } from 'recompose';
import { inject } from 'mobx-react';

import { useStyles } from './styles';
import ListHeader from '../../components/ListHeader';
import Pagination from '../../components/Pagination';
import BillingNote from '../../components/BillingNote';
import { getLinehauls, getReport, requestReport } from '../../stores/api';
import AxlDialog from '../../components/AxlDialog';
import Filters from './Filters';
import useSearchParams from '../../hooks/useSearchParams';
import { LINEHAUL_DELIMITER } from '../../constants/linehaul';
import { sleep } from '../../Utils/sleep';

const fields = [
  { id: 'delivery_region', label: 'Destination', isDisableSort: true, color: 'white' },
  { id: 'customer_name', label: 'Client Name', minWidth: '125px', isDisableSort: true, color: 'white' },
  { id: 'linehaul_id', label: 'LH Shipment ID', minWidth: '140px' },
  { id: 'delivery_ts', label: 'Planned Injection Date', minWidth: '220px', },
  { id: 'linehaul_type', label: 'Linehaul Type', minWidth: '140px', },
  { id: 'pickup_ts', label: 'LH Pickup Date', minWidth: '180px', },
  { id: 'timezone', label: 'LH Timezone', minWidth: '175px', isDisableSort: true, color: 'white' },
  { id: 'pickup_region', label: 'Origin', isDisableSort: true, color: 'white', minWidth: '100px', },
  { id: 'ah_client_success_name', label: 'Client Success', minWidth: '160px', isDisableSort: true, color: 'white' },
  { id: '_updated', label: 'Last Updated', minWidth: '140px', },
  { id: 'equipment', label: 'Equipment' },
  { id: 'status', label: 'Status' },
  { id: 'notes', label: 'Notes', isDisableSort: true, color: 'white' },
  { id: 'tracking_link', label: 'Tracking Link', isDisableSort: true, color: 'white', minWidth: '110px', }
];

function LinehaulDashboard(props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [desc, setDesc] = useState(false);
  const [orderBy, setOrderBy] = useState('');
  const [total, setTotal] = useState();
  const [size, setSize] = useState(20);
  const [linehaul, setLinehaul] = useState([]);
  const [isOpenNote, setIsOpenNote] = useState(false);
  const [selectedLinehaul, setSelectedLinehaul] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState(null);
  const { isReportsManager, isSuperAdmin } = props && props.userStore;

  const classes = useStyles();
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  useEffect(() => {
    setIsLoading(true);
    const requestParams = Object.assign({}, Object.fromEntries(searchParams));
    const {injection_date, pickup_regions, delivery_regions, client_ids, linehaul_types, ...otherParams} = requestParams;
    const payload = {
      ...otherParams,
      injection_date_start: searchParams.get('injection_date') ? moment(searchParams.get('injection_date')).format('YYYY-MM-DD') : null,
      injection_date_end: searchParams.get('injection_date') ? moment(searchParams.get('injection_date')).format('YYYY-MM-DD') : null,
      pickup_regions: searchParams.get('pickup_regions') ? searchParams.get('pickup_regions').split(LINEHAUL_DELIMITER) : [],
      delivery_regions: searchParams.get('delivery_regions') ? searchParams.get('delivery_regions').split(LINEHAUL_DELIMITER) : [],
      client_ids: searchParams.get('client_ids') ? searchParams.get('client_ids').split(LINEHAUL_DELIMITER) : [],
      linehaul_types: searchParams.get('linehaul_types') ? searchParams.get('linehaul_types').split(LINEHAUL_DELIMITER) : [],
    }
    getLinehauls(payload).then((res) => {
      if (res.status === 200) {
          setLinehaul(res.data.items);
          setTotal(res.data.total);
          setSize(res.data.size);
          setIsLoading(false);
        }
        else {
          toast.error(res.message);
          setIsLoading(false);
        }
    })


  }, [searchParams]);


  const handleRequestSort = (evt, property) => {
    const orderDesc = !(orderBy === property && desc);
    if (property === 'injection_date') {
        property = 'delivery_ts';
    }
    setOrderBy(property);
    setDesc(orderDesc);

    searchParams.set('order_by', property);
    searchParams.set('desc', orderDesc);
    setSearchParams(searchParams);
  };

  const handleChangePage = (_, newPage) => {
    const targetPage = newPage - 1 < 0 ? 0 : newPage - 1;

    searchParams.set('page', targetPage);
    setSearchParams(searchParams);
  };

  const handleClickIcon = (val, setField, item) => {
    setField(val);
    setSelectedLinehaul(item);
  };
  const openP44 = (url) => {
    window.open(url, "noreferrer");
  };

  const handleCheckFileLinehaulCSV = async () => {
    setIsGenerating(true);
    const injection_date = searchParams.get('injection_date');
    const pickup_regions = searchParams.get('pickup_regions');
    const delivery_regions = searchParams.get('delivery_regions');
    const client_ids = searchParams.get('client_ids');
    const linehaul_types = searchParams.get('linehaul_types');

    // check file is exists
    const response = await requestReport('linehauls', {
      injection_date_start: injection_date ? moment(injection_date).format('YYYY-MM-DD') : null,
      injection_date_end: injection_date ? moment(injection_date).format('YYYY-MM-DD') : null,
      pickup_regions: pickup_regions ? pickup_regions.split(LINEHAUL_DELIMITER) : [],
      delivery_regions: delivery_regions ? delivery_regions.split(LINEHAUL_DELIMITER) : [],
      client_ids: client_ids ? client_ids.split(LINEHAUL_DELIMITER) : [],
      linehaul_types: linehaul_types ? linehaul_types.split(LINEHAUL_DELIMITER) : [],
    });

    if(!response.ok) {
      toast.error(response && response.data && response.data.message || "Unable to download CSV file please try again later", {containerId: 'main'});
      setIsGenerating(false);
      return;
    }
    
    let canRetry = true;
    while(canRetry) {
      const resp = await getReport(response.data.id);
      setReport(resp.data);
      
      if(resp.ok && !["ERROR", "UPLOAD_ERROR", "COMPLETED", "NO_ITEMS"].includes(resp.data.status)) {
        await sleep(5000);
      }
      else {
        canRetry = false;
        setIsGenerating(false);
      }
    }
  }

  const handleOpenDialog = (val) => {
    setIsOpen(val)
    setReport(null);
  }

  const handleDownloadFileCSV = (evt, id) => {
    if (evt) evt.preventDefault();
    if(!id) return;

    window.open(`${process.env.REACT_APP_API_ROOT}/reports/uploaded/${id}/download`, '_blank');
  }

  return (
    <Box px={4} pt={4} bgcolor={'#fff'}>
      <Box display={'flex'} alignItems={'center'}>
        <Filters />
        {(isReportsManager || isSuperAdmin) && (
          <Tooltip title="Download CSV">
            <IconButton size="medium" aria-label="download" onClick={() => handleOpenDialog(true)} style={{marginLeft: 8, padding: 6, marginTop: -12}}> 
              <GetAppIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box mt={1}>
        <Paper elevation={0} className={classes.paperContainer}>
          <TableContainer className={classes.tableContainer}>
            {isLoading ? (
              <LinearProgress />
            ) : (
              <Table stickyHeader >
                <ListHeader fields={fields} desc={desc} orderBy={orderBy} onRequestOrder={handleRequestSort} classTableHead={classes.tableHeader} classTableCell={classes.tableCell}
                classTableLabel = {classes.tableSortLabel} classTableSortLabel={classes.tableSortLabel}  />

                <TableBody>
                  {linehaul.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} style={{textAlign: 'center'}}>No Data</TableCell>
                    </TableRow>
                  ) : (
                    linehaul.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.consignee}</TableCell>
                        <TableCell>{item.customer_name}</TableCell>
                        <TableCell>{item.linehaul_id}</TableCell>
                        <TableCell>{item.delivery_ts ? momentTz.tz(item.delivery_ts, item.timezone || momentTz.tz.guess()).format("MM/DD/YYYY HH:mm"): null}</TableCell>
                        <TableCell>{item.linehaul_type}</TableCell>
                        <TableCell>{item.pickup_ts ? momentTz.tz(item.pickup_ts, item.timezone || momentTz.tz.guess()).format("MM/DD/YYYY HH:mm"): null}</TableCell>
                        <TableCell>{item.timezone}</TableCell>
                        <TableCell>{item.linehaul_type === 'First Mile' ? `${item.pickup_city}, ${item.pickup_state}` : item.shipper}</TableCell>
                        <TableCell>{item.ah_client_success}</TableCell>
                        <TableCell>{item._updated ? momentTz.tz(item._updated, item.timezone || momentTz.tz.guess()).format("MM/DD/YYYY HH:mm:ss") : null}</TableCell>
                        <TableCell>{item.equipment}</TableCell>
                        <TableCell>{item.status}</TableCell>

                        <TableCell>
                          <IconButton size="medium" aria-label="edit"  onClick={() => handleClickIcon(true, setIsOpenNote, item)}>
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          {item.p44_public_url != null && item.p44_public_url !="" ?
                          <Button variant="contained" size="medium" className={classes.moreInfo} onClick={() => openP44(item.p44_public_url)}>
                            Track
                          </Button>
                          : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>
        {!isLoading && (
          <Box display={'flex'} justifyContent="center" mt={1}>
            <Pagination total={total} size={size} onChange={handleChangePage} forceUpdatePage={page} />
          </Box>
        )}
        <AxlDialog isOpen={isOpenNote} childrenTitle={'Linehaul Notes'} handleClose={() => handleClickIcon(false, setIsOpenNote, '')} alignTitle="center" maxWidth="sm" DialogContentProps={{ classes: { root: classes.dialogContent } }}>
          <BillingNote handleClose={() => handleClickIcon(false, setIsOpenNote, '')} data={selectedLinehaul} />
        </AxlDialog>
      </Box>

      <AxlDialog
        maxWidth="sm"
        isOpen={isOpen}
        handleClose={() => isGenerating ? null : handleOpenDialog(false)}
        childrenTitle={'Confirmation'}
        children={<Box display={'flex'} justifyContent={'center'} flexDirection={'column'}>
          <Typography style={{marginBottom: 16, fontWeight: 700, fontSize: 16}}>Are you sure you want to download this file with filter below:</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4} style={{fontWeight: 300, textAlign: 'right'}}>Injection Date:</Grid>
            <Grid item xs={8}><span style={{fontWeight: 500}}>{searchParams.get('injection_date') ? moment(searchParams.get('injection_date')).format("YYYY-MM-DD") : 'All Time'}</span></Grid>

            <Grid item xs={4} style={{fontWeight: 300, textAlign: 'right'}}>Origin:</Grid>
            <Grid item xs={8}><span style={{fontWeight: 500}}>{searchParams.get('pickup_regions') ? searchParams.get('pickup_regions').split(LINEHAUL_DELIMITER).join(", ") : 'All Origin'}</span></Grid>

            <Grid item xs={4} style={{fontWeight: 300, textAlign: 'right'}}>Destination:</Grid>
            <Grid item xs={8}><span style={{fontWeight: 500}}>{searchParams.get('delivery_regions') ? searchParams.get('delivery_regions').split(LINEHAUL_DELIMITER).join(", ") : "All Destination"}</span></Grid>

            <Grid item xs={4} style={{fontWeight: 300, textAlign: 'right'}} >Clients:</Grid>
            <Grid item xs={8}><span style={{fontWeight: 500}}>{searchParams.get('client_ids') ? searchParams.get('client_ids').split(LINEHAUL_DELIMITER).join(", ") : "All Client"}</span></Grid>

            <Grid item xs={4} style={{fontWeight: 300, textAlign: 'right'}}>Linehaul Types:</Grid>
            <Grid item xs={8}><span style={{fontWeight: 500}}>{searchParams.get('linehaul_types') ? searchParams.get('linehaul_types').split(LINEHAUL_DELIMITER).join(", ") : "All Linehaul Type"}</span></Grid>

            <Grid item xs={12}>
              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} style={{gap: 8}}>
                  <Button variant="contained" color="primary" disabled={isGenerating || (report && report.url)} onClick={() => handleCheckFileLinehaulCSV()} size="small">Generate</Button>
                  {isGenerating && <CircularProgress size={24}/>}
                  {report && <span>Status: {report.status}</span>}
                </Box>

                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} style={{gap: 8}}>
                  {report && (report.count !== null && report.count !== undefined) && <span>{report.count.toLocaleString("en-US")} records</span>}
                  {report && report.url && report.count !== 0 && <Link onClick={(evt) => handleDownloadFileCSV(evt, report.id)} underline='always' component={"button"} style={{marginTop: -4}}>Download</Link>}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>}
      />
    </Box>
  );
}

export default compose(inject('userStore'))(LinehaulDashboard);
