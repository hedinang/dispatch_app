import React, {useEffect, useState, Fragment} from "react";
import {inject} from "mobx-react";
import { AxlPanel, AxlTooltip, AxlLoading, AxlPagination, AxlButton, AxlTabSimple } from 'axl-reactjs-ui';
import styles, * as E from "../styles";
import TYPE_MAPPING, {DRIVER_SUSPENSION_STATUS_MAP_TO_COLOR} from "../../../constants/driverSuspensionType";
import Moment from "react-moment";
import {Box, Tab, Tabs, ThemeProvider, Grid, Typography, Divider} from "@material-ui/core";
import {lightTheme} from "../../../themes";
import * as S from './styles';
import colors from "../../../themes/colors";
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import api from "../../../stores/api";
import _ from 'lodash';
import moment from "moment";
import {APPEAL_STATUS, APPEAL_STATUS_MAP_TO_COLORS} from "../../../constants/appeal";
import DriverProfileNote from "../DriverProfileNote";

function ProbationItem({probation, type}) {
  const TYPE_DESC_MAPPING = {
    black_out: 'No scheduling during suspension period',
    client_blacklist: 'Can not deliver route having orders from a specific client',
    limited_reservation: 'Maybe limit him to 1/2 routes only',
    reduced_route: 'He can only book *max_reservation - 1* routes',
    delayed: 'He can book normally, but booking time is delayed for some duration',
    limited_capacity: 'Limited Capacity'
  };
  const COLOR_MAP_TO_STATUS = {
    'active': colors.scarlet,
    'past': colors.blackMain,
  }

  return <Box px={4} py={2}>
    <Grid container>
      <Grid item>
        <AxlTooltip title={TYPE_DESC_MAPPING[probation.suspension_type]}>
          <S.Text_1 style={{color: COLOR_MAP_TO_STATUS[type]}}>{TYPE_MAPPING[probation.suspension_type] ? TYPE_MAPPING[probation.suspension_type]: probation.suspension_type}</S.Text_1>
        </AxlTooltip>
        <S.Text_2>{`Due to “${probation.reason}”`}</S.Text_2>
      </Grid>
      <Grid item xs />
      <Grid item>
        <S.Text_5>{`EFFECTIVE PERIOD`}</S.Text_5>
        <S.Text_4>
          <strong><Moment format="MM/DD/YYYY">{probation.start_time}</Moment></strong> @ <Moment format="HH:mmA">{probation.start_time}</Moment>
          <Box mx={1} component={'span'}>{`-`}</Box>
          {!!probation.end_time && <Fragment><strong><Moment format="MM/DD/YYYY">{probation.end_time}</Moment></strong> @ <Moment format="HH:mmA">{probation.end_time}</Moment></Fragment>}
          {!probation.end_time && <strong>Permanent</strong>}
        </S.Text_4>
      </Grid>
    </Grid>
    <Box my={1} px={3} py={2} bgcolor={'primary.grayFourth'}>
      <Grid container spacing={3}>
        <Grid item>
          <S.Text_5>{`SUBMITTED DATE`}</S.Text_5>
          <S.Text_6>{_.get(probation, 'appeal_created_ts') ? moment(_.get(probation, 'appeal_created_ts')).format('DD/MM/YYYY') : '-'}</S.Text_6>
        </Grid>
        <Grid item>
          <S.Text_5>{`APPEAL STATUS`}</S.Text_5>
          <S.Text_6>{_.get(probation, 'appeal_status', '-')}</S.Text_6>
        </Grid>
        <Grid item>
          <S.Text_5>{`RESOLVE DATE`}</S.Text_5>
          <S.Text_6>{_.get(probation, 'appeal_created_ts') ? moment(_.get(probation, 'appeal_updated_ts')).format('DD/MM/YYYY') : '-'}</S.Text_6>
        </Grid>
      </Grid>
    </Box>
    <Box mt={2}><Divider light /></Box>
  </Box>
}

@inject('driverStore')
class Probation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSuspensions: [],
      pastSuspensions: [],
      loadingSuspensions: false
    }
  }

  componentDidMount() {
    const {driverStore, driver} = this.props;
    this.setState({loadingSuspensions: true});
    driverStore.getSuspensions(driver.id).then(response => {
      this.setState({loadingSuspensions: false});
      if (response.status === 200) {
        // process active suspensions and past suspensions
        const currentTime = (new Date()).getTime();
        const activeSuspensions = response.data.filter(s =>
          !s.end_time || (s.start_time < currentTime && s.end_time >= currentTime)
        );

        const pastSuspensions = response.data.filter(s =>
          s.end_time < currentTime
        );

        this.setState({activeSuspensions, pastSuspensions});
        this.props.update(activeSuspensions && activeSuspensions.length > 0)
      }
    });
  }

  render() {
    const { activeSuspensions, pastSuspensions, loadingSuspensions } = this.state;

    return <E.Container>
      { loadingSuspensions && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} /> }
      <E.PendingItems>
        <E.PanelTitle>{`ACTIVE PROBATION`}</E.PanelTitle>
        {(activeSuspensions && activeSuspensions.length > 0) && activeSuspensions.map(probation => <E.PendingItem>
          <ProbationItem type={'active'} probation={probation} />
        </E.PendingItem>)}
        {(!activeSuspensions || activeSuspensions.length < 1) && <E.NoActiveSuspension>
          <E.Text_6>{`No Active Probation!`}</E.Text_6>
        </E.NoActiveSuspension>}
      </E.PendingItems>
      <E.PendingItems>
        <E.PanelTitle>{`PAST PROBATION`}</E.PanelTitle>
        {(!pastSuspensions || pastSuspensions.length < 1) && <E.NoActiveSuspension>
          <E.Text_6>{`No Past Probation!`}</E.Text_6>
        </E.NoActiveSuspension>}
        {(pastSuspensions && pastSuspensions.length > 0) && pastSuspensions.map(probation => <E.PendingItem>
          <ProbationItem type={'past'} probation={probation} />
        </E.PendingItem>)}
      </E.PendingItems>
    </E.Container>
  }
}

function SuspensionItem({suspension = {}, type}) {
  const TYPE_DESC_MAPPING = {
    black_out: 'No scheduling during suspension period',
    client_blacklist: 'Can not deliver route having orders from a specific client',
    limited_reservation: 'Maybe limit him to 1/2 routes only',
    reduced_route: 'He can only book *max_reservation - 1* routes',
    delayed: 'He can book normally, but booking time is delayed for some duration',
    limited_capacity: 'Limited Capacity'
  };
  const COLOR_MAP_TO_STATUS = {
    'active': colors.scarlet,
    'past': colors.blackMain,
  };

  return <Box px={4} py={2}>
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <S.Text_5>{`SUSPENSION ID`}</S.Text_5>
        <S.Text_6>{_.get(suspension, 'id', '-')}</S.Text_6>
      </Grid>
      <Grid item xs={3}>
        <S.Text_5>{`STATUS`}</S.Text_5>
        <S.Text_6>{_.get(suspension, 'status')}</S.Text_6>
      </Grid>
      <Grid item xs={3}>
        <S.Text_5>{`EFFECTIVE DATE`}</S.Text_5>
        <S.Text_6>{_.get(suspension, 'effect_date') ? moment(_.get(suspension, 'effect_date')).format('DD/MM/YYYY @ hh:mmA') : '-'}</S.Text_6>
      </Grid>
      <Grid item xs={3}>
        <S.Text_5>{`CATEGORY`}</S.Text_5>
        <S.Text_6>{_.get(suspension, 'category')}</S.Text_6>
      </Grid>
    </Grid>
    {!!_.get(suspension, 'appeals', []).length && <Box bgcolor={'primary.grayFourth'}>
      <Timeline>
        {_.get(suspension, 'appeals', []).map((appeal, idx) => <TimelineItem key={idx}>
          <TimelineOppositeContent style={{flex: 0, padding: 0}} />
          <TimelineSeparator>
            <TimelineDot color={'primary'} style={{padding: 1, backgroundColor: APPEAL_STATUS_MAP_TO_COLORS[appeal.status || APPEAL_STATUS.CREATED]}} />
            {!_.isEqual(_.get(suspension, 'appeals', []).length, idx + 1) && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <S.Text_5_1>{`SUBMITTED DATE`}</S.Text_5_1>
                <S.Text_6>{_.get(appeal, 'created_ts') ? moment(_.get(appeal, 'created_ts')).format('MM/DD/YYYY') : 'N/A'}</S.Text_6>
              </Grid>
              <Grid item xs={3}>
                <S.Text_5_1>{`APPEAL STATUS`}</S.Text_5_1>
                <S.Text_6>{_.get(appeal, 'status', '-')}</S.Text_6>
              </Grid>
              <Grid item xs={3}>
                <S.Text_5_1>{`RESOLVE DATE`}</S.Text_5_1>
                <S.Text_6>{( _.get(appeal, 'updated_ts') && _.includes([APPEAL_STATUS.APPROVED, APPEAL_STATUS.REJECTED], _.get(appeal, 'status')) ) ? moment(_.get(appeal, 'updated_ts')).format('MM/DD/YYYY') : 'N/A'}</S.Text_6>
              </Grid>
              <Grid item xs={3}>
                <S.Text_5_1>{`APPEAL ID`}</S.Text_5_1>
                <S.Text_6>{_.get(appeal, 'id', '-')}</S.Text_6>
              </Grid>
            </Grid>
          </TimelineContent>
        </TimelineItem>)}
      </Timeline>
    </Box>}
    <Box mt={2}><Divider light /></Box>
  </Box>
}

function Suspension({driver, ...props}) {
  const [suspension, setSuspension] = useState(null);

  useEffect(() => {
    if(_.has(driver, 'id')) {
      api.get(`/drivers/${driver.id}/last-termination`).then(res => {
        if(res.status === 200 && res.ok) {
          setSuspension(res.data);
        }
      });
    }
  }, []);

  return <Box>
    <E.PendingItems>
      <E.PanelTitle>{`ACTIVE SUSPENSION`}</E.PanelTitle>
      <E.PendingItem>
        {suspension ? <SuspensionItem suspension={suspension} /> : <E.NoActiveSuspension>
          <E.Text_6>{`No Active Suspension!`}</E.Text_6>
        </E.NoActiveSuspension>}
      </E.PendingItem>
    </E.PendingItems>
  </Box>
}

export default function DriverProfileProbation(props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return <ThemeProvider theme={lightTheme}>
    <Box textAlign={'left'} display="flex" flex={1} flexDirection="column">
      <Box mb={1.5}>
        <Tabs value={value} onChange={handleChange} centered indicatorColor={'primary'}>
          <Tab label={`Suspension`} />
          <Tab label={`Probation`} />
          <Tab label={`Notes`} />
        </Tabs>
      </Box>
      <Box>
        {value === 0 && <Box>
          <Suspension {...props} />
        </Box>}
        {value === 1 && <Box>
          <Probation {...props} />
        </Box>}
        {value === 2 && <Box>
          <DriverProfileNote {...props} />
        </Box>}
      </Box>
    </Box>
  </ThemeProvider>
}