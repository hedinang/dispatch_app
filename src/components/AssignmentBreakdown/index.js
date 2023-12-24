import React,{Component} from 'react';
// import Moment from 'react-moment';
import moment from 'moment-timezone';
import AssignmentSpecificChart from '../AssignmentSpecificChart/index.js'
import styles from './styles';
import {Box, Grid, IconButton} from "@material-ui/core";
import _ from 'lodash';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import InfoIcon from '@material-ui/icons/Info';
import AxlButton from "../AxlMUIComponent/AxlButton";

class AssignmentBreakdown extends Component {
  constructor(props){
    super(props)
    this.state = {
      isEngaged: false,
      pickupTime: null,
      firstDropoffTime: null,
      lastDropoffTime: null,
      stats:{
        unassigned:0,
        pending:0,
        inprogress:0,
        failed:0,
        succeeded:0,
        early:0,
        late:0
      },
      reattemptStopLabels:[]
    }
  }

  componentWillReceiveProps(props){
    this.processAndUpdateData(props)
  }

  componentDidMount(){
    this.processAndUpdateData(this.props)
  }

  processAndUpdateData(props){
    if(props.selectedAssignment && props.selectedAssignment.extra){
      const { assignment, stops, shipments, extra } = props.selectedAssignment
      let stats = {unassigned:0, pending:0, inprogress:0, failed:0, succeeded:0, early:0, late:0}
      let pickupTime = null, firstDropoffTime = null, lastDropoffTime = null
      let reattemptStopLabels = []

      //get list of labels of reattempted shipments
      if(props.filteredStops != null && props.filteredStops.length !== 0){
        reattemptStopLabels = props.filteredStops.filter(s => s.shipment && s.shipment.attempt_count && s.shipment.attempt_count > 1)
          .map(s => s.label ? s.label.driver_label.split('-')[1] : '0');
      }

      if(assignment.driver_id === undefined){
        //not assigned
        stats.unassigned=1
        this.setState({stats, pickupTime, firstDropoffTime, lastDropoffTime, reattemptStopLabels})
      }
      else if(assignment.status === "" || !assignment.status){
        //assigned, but not active aka pending
        stats.pending=1
        this.setState({stats, pickupTime, firstDropoffTime, lastDropoffTime, reattemptStopLabels})
      }
      else{
        //assigned and active

        //get actual pickup time, we prioritize actual_arrival_ts over actual_start_ts
        if (assignment.actual_arrival_ts !== null || assignment.actual_start_ts !== null)
          pickupTime = assignment.actual_arrival_ts || assignment.actual_start_ts

        //get all drop-off stops
        const dropoffStops = stops.filter(s => s.type === 'DROP_OFF');

        // sort all drop-off stops by date (earliest to latest)
        const sortedStops = dropoffStops.filter(s => !!s.actual_departure_ts)
          .sort((s1, s2) => new Date(s1.actual_departure_ts) - new Date(s2.actual_departure_ts))

        if (sortedStops.length!==0 && extra.stats) {
          // stats available, dropped off at least 1 shipment
          firstDropoffTime = moment.tz(sortedStops[0].actual_departure_ts, moment.tz.guess()).format('LT z')

          if(assignment.status === 'COMPLETED'){
            //assignment completed
            lastDropoffTime = moment.tz(sortedStops[sortedStops.length-1].actual_departure_ts, moment.tz.guess()).format('LT z')
          }
          this.updateChartData(extra.stats, pickupTime, firstDropoffTime, lastDropoffTime, reattemptStopLabels)
        }
        else {
          // stats not available, have not dropped off yet
          stats.inprogress=1
          this.setState({stats, pickupTime, firstDropoffTime, lastDropoffTime, reattemptStopLabels})
        }
      }
    }
  }

  updateChartData(stats, pickupTime, firstDropoffTime, lastDropoffTime, reattemptStopLabels){
    let totalStats={
      unassigned:0,
      pending:0,
      inprogress:0,
      failed:0,
      succeeded:0,
      early:0,
      late:0
    }

    const values = Object.values(stats)

    values.forEach(element =>{
      const {DS=0, DP=0, DF=0,late=0,early=0,PF=0} = element
      totalStats.succeeded +=DS
      totalStats.failed +=DF+PF
      totalStats.early +=early
      totalStats.late +=late
      totalStats.inprogress += DP
    })

    this.setState({stats:totalStats, pickupTime, firstDropoffTime, lastDropoffTime, reattemptStopLabels})
  }

  render(){
    const { selectedAssignment, engagedTime } = this.props
    if(!selectedAssignment)
      return <div/>
    const { firstDropoffTime, lastDropoffTime, isEngaged } = this.state;
    const { prefix } = selectedAssignment && selectedAssignment.assignment ? selectedAssignment.assignment.label : ''

    return(
      <div style={styles.container}>
        <div style={styles.titleWrap}>
          <div style={styles.titleText}>
              {!isEngaged ?
                <div>Assignment {prefix} - Breakdown <AxlButton icon tooltip={{title: 'Engagement time'}} padding={0} spacing={0} onClick={() => this.setState({isEngaged: !isEngaged})}><AccessTimeIcon fontSize={'small'} /></AxlButton></div> :
                <div>{`Engagement Time`}<AxlButton icon tooltip={{title: 'Assignment breakdown'}} padding={0} spacing={0} onClick={() => this.setState({isEngaged: !isEngaged})}><InfoIcon fontSize={'small'} /></AxlButton></div>}
          </div>
        </div>
        {!this.state.isEngaged ? <Box>
          <div style={styles.timeWrap}>
            <div style={styles.timeColumnWrap}>
              <div style={styles.timeTitleText}>{`Actual pickup time`}</div>
              <div style={styles.timeText}>{this.state.pickupTime ===null ? <div>{`Not available`}</div> : <span>{moment.tz(this.state.pickupTime, moment.tz.guess()).format('LT z')}</span>}</div>
            </div>
            <div style={styles.timeColumnWrap}>
              <div style={styles.timeTitleText}>{`First drop-off time`}</div>
              <div style={styles.timeText}>{firstDropoffTime===null?'Not available':firstDropoffTime}</div>
            </div>
            <div style={styles.timeColumnWrap}>
              <div style={styles.timeTitleText}>{`Last drop-off time`}</div>
              <div style={styles.timeText}>{lastDropoffTime===null?'Not available':lastDropoffTime}</div>
            </div>
          </div>
          <div style={styles.grayLine1}/>
          <AssignmentSpecificChart selected={selectedAssignment} stats={this.state.stats}/>
          <div style={styles.grayLine2}/>
          <div style={styles.reattemptWrap}>
            <div style={styles.reattemptText}>No. of Re-attempts:</div>
            <div style={styles.reattemptNumber}>{this.state.reattemptStopLabels.length}</div>
            {this.state.reattemptStopLabels.length!==0 ?
              <div style={styles.reattemptText}>( {prefix} - {this.state.reattemptStopLabels.join(", ")} )</div>
              :
              null
            }
          </div>
        </Box> : <Box textAlign={'left'}>
          <br/>
          <Grid container>
            <Grid item xs>
              <div style={styles.timeTitleText}>{`Pickup time`}</div>
              <div style={styles.timeText}>{_.get(engagedTime, 'pickup_time').toTime()}</div>
            </Grid>
            <Grid item xs>
              <div style={styles.timeTitleText}>{`Dropoff time`}</div>
              <div style={styles.timeText}>{_.get(engagedTime, 'dropoff_time').toTime()}</div>
            </Grid>
            <Grid item xs>
              <div style={styles.timeTitleText}>{`Return time`}</div>
              <div style={styles.timeText}>{_.get(engagedTime, 'return_time').toTime()}</div>
            </Grid>
          </Grid>
          <br/>
          <Grid container>
            <Grid item xs>
              <div style={styles.timeTitleText}>{`Wait time`}</div>
              <div style={styles.timeText}>{_.get(engagedTime, 'wait_time').toTime()}</div>
            </Grid>
            <Grid item xs>
              <div style={styles.timeTitleText}>{`Complete wait time`}</div>
              <div style={styles.timeText}>{_.get(engagedTime, 'complete_wait_time').toTime()}</div>
            </Grid>
            <Grid item xs />
          </Grid>
        </Box>}
      </div>
    )
  }
}

export default AssignmentBreakdown;
