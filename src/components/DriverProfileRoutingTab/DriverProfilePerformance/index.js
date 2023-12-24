import React, {useEffect, useState} from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  List,
  ListSubheader,
  ListItem,
  ListItemIcon,
  Collapse,
  ListItemText,
  ThemeProvider
} from "@material-ui/core";
import {inject} from "mobx-react";
import _ from 'lodash';
import moment from "moment";
import * as S from './styles';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import {AxlMUIBox, AxlMUISimpleBox} from "../../AxlMUIComponent/AxlMUIBox";
import AxlMUISelect from "../../AxlMUIComponent/AxlMUISelect";
import HistoryIcon from '@material-ui/icons/History';
import InfoIcon from '@material-ui/icons/Info';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import AssignmentChart from "../../AssignmentChart";
import DriverProfilePerformanceChart from "../DriverProfilePerformanceChart";
import {lightTheme} from "../../../themes";

@inject('driverStore')
export default class DriverProfilePerformance extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      engagedTimeData: null,
      pointData: null,
      timeRange: 14,
      engagedTimeSummary: [],
      engagedTimeSelected: null,
      anchorEl: null,
      isHistoryPanel: false,
      engagedOverview: null,
      statistics: [],
    }
  }

  componentDidMount() {
    this.getPoints();
    this.getStatistics();
    this.getEngagedTime();
    this.getEngagedTimeSummary();
    this.getPointingSystemOverview();
  }

  getEngagedTime = () => {
    this.props.driverStore.getEngagedTime({id: _.get(this, 'props.driver.id'), start: moment().subtract(this.state.timeRange, 'days').startOf('day'), end: moment().endOf('day')}).then(res => {
      if(res.ok && res.status === 200) {
        this.setState({engagedTimeData: res.data});
      }
    });
  };

  getEngagedTimeSummary = () => {
    this.props.driverStore.getEngagedSummary(_.get(this, 'props.driver.id')).then(res => {
      if(res.ok && res.status === 200 && res.data && res.data.length) {
        this.setState({
          engagedTimeSelected: _.get(res, `data[${res.data.length - 1}].id`),
          engagedTimeSummary: res.data
        });
      } else {
        this.setState({engagedTimeSummary: []});
      }
    })
  };

  getPointingSystemOverview = () => {
    const id = _.get(this, 'props.driver.id');
    const today = moment();
    const start = today.startOf('isoweek').format('YYYY-MM-DD');
    const end = today.endOf('isoweek').format('YYYY-MM-DD');
    this.props.driverStore.getPointingSystemOverview(id, start, end).then(res => {
      if(res.ok && res.status === 200) {
        this.setState({
          engagedOverview: res.data
        });
      } else {
        this.setState({engagedOverview: null});
      }
    })
  }

  getPoints = () => {
    this.props.driverStore.getPoints({id: _.get(this, 'props.driver.id')}).then(res => {
      if(res.ok && res.status === 200) {
        this.setState({pointData: res.data});
      }
    });
  };

  getStatistics = () => {
      this.props.driverStore.getStatistics(_.get(this, 'props.driver.id')).then(res => {
        this.setState({statistics: res.data});
      });
  }

  handleClick = (event) => {
    this.setState({anchorEl: event.currentTarget});
  };

  handleClose = () => {
    this.setState({anchorEl: null});
  };

  convertEngagedTimeToOptionSelect(e) {
    return ({
      label: `${_.get(e, 'from_date') ? moment(_.get(e, 'from_date')).format('MM/DD/YYYY') : '-'} - ${_.get(e, 'to_date') ? moment(_.get(e, 'to_date')).format('MM/DD/YYYY') : '-'}`,
      value: e.id,
    })
  }

  toggleHistory = () => {
    this.setState({isHistoryPanel: !this.state.isHistoryPanel});
  };

  render() {
    const {activeTab, engagedTimeData, pointData, engagedOverview, statistics} = this.state;
    const open = Boolean(this.state.anchorEl);
    const id = _.get(this, 'props.driver.id');
    const today = moment();
    const start = today.startOf('isoweek').format('YYYY-MM-DD');
    const end = today.endOf('isoweek').format('YYYY-MM-DD');
    const options = this.state.engagedTimeSummary.map((e, idx) => this.convertEngagedTimeToOptionSelect(e));
    const statistic = statistics.length > 0 ? statistics.filter(s => s.type === 'ALL_TIME') : [];
    const _pending = _.get(this, 'state.engagedOverview.shipment_pending_count');
    const _inprogress = _.get(this, 'state.engagedOverview.shipment_inprogress_count');
    const _total = _.get(this, 'state.engagedOverview.total_dropoffs');
    const _failed = _.get(this, 'state.engagedOverview.shipment_failed_count');
    const _succeeded = _.get(this, 'state.engagedOverview.shipment_successful_count');
    const _early = _.get(this, 'state.engagedOverview.shipment_early_count');
    const _late = _.get(this, 'state.engagedOverview.shipment_late_count');
    const _unassigned = _total - _inprogress - _failed - _succeeded - _pending;
    const overviewData = {
      unassigned: _unassigned,
      pending: _pending,
      inprogress: _inprogress,
      failed: _failed,
      succeeded: _succeeded,
      early: _early,
      late: _late,
      total: _total,
    };

    return <ThemeProvider theme={lightTheme}>
      {this.state.isHistoryPanel ? <Box textAlign={'left'}>
      <Box px={4} py={2}>
        <S.Link onClick={() => this.setState({isHistoryPanel: false})}>{`Back`}</S.Link>
        <Box m={1}></Box>
        <S.Title2>{`HISTORY`}</S.Title2>
      </Box>
      <DriverProfilePointingSystemHistoryList
        getPoint={this.props.driverStore.getPointingAssignmentDetail}
        getPointAssignments={() => this.props.driverStore.getPointingAssignments(id, start, end)} />
      </Box> : <Box textAlign={'left'} px={4} py={2}>
        <Grid container>
          <Grid item xs>
            <S.Text1>{`CYCLE`}</S.Text1>
            <S.Text2>{_.get(pointData, 'fromDate') ? moment.utc(_.get(pointData, 'fromDate')).format('MM/DD/YYYY') : '-'} - {_.get(pointData, 'toDate') ? moment.utc(_.get(pointData, 'toDate')).format('MM/DD/YYYY') : '-'}</S.Text2>
          </Grid>
          <Grid item xs>
            <S.Text1>{`POINTS`}</S.Text1>
            <S.Text2>{_.get(pointData, 'point', '-')}</S.Text2>
          </Grid>
          <Grid item xs>
            <S.Text1>{`HOURS WORKED`}</S.Text1>
            <S.Text2>{_.get(pointData, 'hours_worked', "")}</S.Text2>
          </Grid>
          <Grid item xs>
            <S.Text1>{`HOURS WORKED (Quarter-to-Date)`}</S.Text1>
            <S.Text2>{_.get(pointData, 'hours_worked_quarter_to_date', "")}</S.Text2>
          </Grid>
        </Grid>
        <Box mb={3} />
        <Grid container>
          <Grid item xs>
            <S.Text1>{`TOTAL ROUTES`}</S.Text1>
            <S.Text2>{_.get(pointData, 'routes', 0)}</S.Text2>
          </Grid>
          <Grid item xs>
            <S.Text1>{`TOTAL DROPOFF`}</S.Text1>
            <S.Text2>{_.get(engagedOverview, 'total_dropoffs', 0)}</S.Text2>
          </Grid>
          <Grid item xs>
            <S.Text1>{`TIPPING`}</S.Text1>
            <S.Text2>{`${_.get(engagedOverview, 'tip_count', 0)} tips ($${_.get(engagedOverview, 'tip_amount', 0)})`}</S.Text2>
          </Grid>
          <Grid item xs>
            <S.Text1>{`HISTORY`}</S.Text1>
            <S.Link onClick={() => this.setState({isHistoryPanel: true})}>{`View`}</S.Link>
          </Grid>
        </Grid>
        <Box mb={3} />
        <Grid container>
          <Grid item xs>
            <S.Text1>{`DROP-OFF BREAKDOWN`}</S.Text1>
            <DriverProfilePerformanceChart
              disabledBarChart={true}
              stats = {overviewData} />
          </Grid>
          <Grid item xs>
            <S.Text1>{`FEEDBACK`}</S.Text1>
            <Grid container>
              <Grid item xs>
                <IconButton style={{padding: 0}}>
                  <img src={`/assets/images/svg/feedback-thumbup-icon.svg`} width={22} height={22} />
                  <Box mx={1}><S.Text2>{_.get(this, 'state.engagedOverview.feedback_up')}</S.Text2></Box>
                </IconButton>
              </Grid>
              <Grid item xs>
                <IconButton style={{padding: 0}}>
                  <img src={`/assets/images/svg/feedback-thumbdown-icon.svg`} width={22} height={22} />
                  <Box mx={1}><S.Text2>{_.get(this, 'state.engagedOverview.feedback_down')}</S.Text2></Box>
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs>
            <S.Text1>{`AVERAGE POINT PER STOP`}</S.Text1>
            <S.Text2>{`${_.get(pointData, 'average_point_stop', 0)} pts`}</S.Text2>
          </Grid>
          <Grid item xs>
            <S.Text1>{`AVERAGE POINT PER DAY `}</S.Text1>
            <S.Text2>{`${_.get(pointData, 'average_point_day', 0)} pts`}</S.Text2>
          </Grid>
        </Grid>
        <Box my={2}>
          <Paper variant="outlined">
            <Box p={2}>
              <S.Text1>{`DRIVER CREWS`}</S.Text1>
              <S.Text4>{_.get(statistic, '[0].driver_pool', []).length ? _.get(statistic, '[0].driver_pool', []).join(', ') : 'No Crews'}</S.Text4>
            </Box>
          </Paper>
        </Box>
      </Box>}
    </ThemeProvider>
  }
}

export const DriverProfilePointingSystemHistoryList = (props) => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  const [open, setOpen] = React.useState({});
  const [assignmentPoints, setAssignmentPoints] = React.useState([]);
  const [assignmentPointDetail, setAssignmentPointDetail] = React.useState(null);

  const handleListItemClick = (item, id) => {
    setOpen({[id]: !open[id]});
    props.getPoint(item.assignment_id).then(res => {
      if(res.ok && res.status === 200) {
        setAssignmentPointDetail(res.data);
      }
    });
  };

  useEffect(() => {
    props.getPointAssignments().then(res => {
      if(res.ok && res.status === 200) {
        setAssignmentPoints(res.data);
      }
    })
  }, []);

  if(!assignmentPoints || !assignmentPoints.length) {
    return <Box display={"flex"} flex={1} justifyContent="center">{`No history`}</Box>
  }

  const totalBonus = _.sumBy(_.get(assignmentPointDetail, 'bonus', []), (o) => o.bonus);

  return <Box display={"flex"} flex={1}>
    <Grid container spacing={2} justifyContent="stretch">
      <Grid item>
        <Box width={200} height={1} bgcolor={'primary.grayEleventh'}>
          <List component="nav" aria-label="secondary mailbox folder">
            {assignmentPoints.map((item, idx) => <ListItem
              key={idx}
              button
              selected={open[idx]}
              onClick={() => handleListItemClick(item, idx)}
            >
              <S.Text3>{item.date} - {item.label}</S.Text3>
            </ListItem>)}
          </List>
        </Box>
      </Grid>
      {assignmentPointDetail ? <Grid item xs>
        <Box height={1} bgcolor={'primary.grayEleventh'} p={4} boxSizing={'border-box'} textAlign="left">
          <Grid container>
            <Grid item xs={4}>
              <S.Text1>{`ESTIMATED TIME`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'estimated_time', "")}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`HOURS WORKED`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'hours_worked', "")}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`TOTAL SHIPMENTS`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'total_shipments', 0)}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`TOTAL DROPOFFS`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'total_dropoffs', 0)}</S.Text2>
            </Grid>
          </Grid>
          <br />
          <Grid container>
            <Grid item xs={4}>
              <S.Text1>{`TOTAL FAILED`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'total_failed', 0)}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`TOTAL SUCCESSFUL`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'total_success', 0)}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`TOTAL RETURNED`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'total_return', 0)}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`FEEDBACK`}</S.Text1>
              <Grid container>
                <Grid item xs>
                  <IconButton style={{padding: 0}}>
                    <img src={`/assets/images/svg/feedback-thumbup-icon.svg`} width={22} height={22} />
                    <Box mx={1}><S.Text2>{_.get(assignmentPointDetail, 'feedback_up')}</S.Text2></Box>
                  </IconButton>
                </Grid>
                <Grid item xs>
                  <IconButton style={{padding: 0}}>
                    <img src={`/assets/images/svg/feedback-thumbdown-icon.svg`} width={22} height={22} />
                    <Box mx={1}><S.Text2>{_.get(assignmentPointDetail, 'feedback_down')}</S.Text2></Box>
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <br />
          <Grid container>
            <Grid item xs={4}>
              <S.Text1>{`DRIVING COST`}</S.Text1>
              <S.Text2>{_.get(assignmentPointDetail, 'driving_cost', '-')}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`TIPPING`}</S.Text1>
              <S.Text2>{`${_.get(assignmentPointDetail, 'tip_count', 0)} tips ($${_.get(assignmentPointDetail, 'tip_amount', 0)})`}</S.Text2>
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`DEDUCT`}</S.Text1>
              <S.Text2>{`$${_.get(assignmentPointDetail, 'deduct', 0)}, ${_.get(assignmentPointDetail, 'deduct_note', '')}`}</S.Text2>
            </Grid>
            <Grid item xs={4} />
          </Grid>
          <br />
          <Grid container>
            <Grid item xs={4}>
              <S.Text1>{`BONUS`}</S.Text1>
              <S.Text2>{`$${totalBonus}`}</S.Text2>
              <Notes data={_.get(assignmentPointDetail, 'bonus', [])} />
            </Grid>
            <Grid item xs={4}>
              <S.Text1>{`OAI`}</S.Text1>
              <S.Text2>{`$${_.get(assignmentPointDetail, 'oai', 0)}, ${_.get(assignmentPointDetail, 'oai_note', '')}`}</S.Text2>
            </Grid>
          </Grid>
        </Box>
      </Grid> : <Grid item xs>
        <Box height={1} bgcolor={'primary.grayEleventh'} p={4} boxSizing={'border-box'}>{`No content`}</Box>
      </Grid>}
    </Grid>
  </Box>
}

function Notes({data = []}) {
  const [toggle, setToggle] = useState(false);

  if(!data.length) return null;

  return <Box bgcolor={'primary.grayThirteenth'} py={1} px={2}>
    {data.map((item, idx) => <Box key={idx}>
      <Box my={1} hidden={!toggle && idx > 1}><S.Text2>{`$${item.bonus}, ${item.bonus_note}`}</S.Text2></Box>
    </Box>)}
    {(data.length > 2) && <Box my={1} textAlign={'center'}><S.Link onClick={() => setToggle(!toggle)}>{`Show ${toggle ? 'less' : 'more'}`}</S.Link></Box>}
  </Box>
}
