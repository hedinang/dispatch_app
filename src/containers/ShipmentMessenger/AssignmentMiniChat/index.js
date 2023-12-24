import React, {useEffect} from 'react';
import {Box, Grid, ThemeProvider, CircularProgress} from "@material-ui/core";
import {AxlDateInput} from 'axl-reactjs-ui';
import AxlMUISelect from "../../../components/AxlMUIComponent/AxlMUISelect";
import * as S from './styles';
import {lightTheme} from "../../../themes";
import { compose } from 'recompose';
import {withRouter} from "react-router-dom";
import {withFirebase} from "../../../components/Firebase";
import {inject, observer} from "mobx-react";
import _ from 'lodash';
import ListBoxChat from "./ListBoxChat";
import moment from "moment-timezone";
import {MESSENGER_TYPE} from "../../../constants/messenger";
import {TimezoneDefault} from "../../../constants/timezone";
import {
  convertActivityLogToTitle,
  convertAssignmentConversationToTitle,
  filterEvents,
  mapShipmentLabelToStops
} from "../../../Utils/events";

class AssignmentMiniChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listMsg: [],
      loading: false,
      filterOptions: [],
      selectedTopicId: null,
      assignmentSummaries: [],
      dateSelected: new Date(),
      activityLogs: [],
      assignmentLogs: [],
      stopLogs: [],
      logsLoadingCounter: 0,
      activeAssignment: null,
    }
  }

  componentDidMount() {
    this.handleSelectDate(new Date());
  }

  handleSelectDate = (d) => {
    this.setState({
      dateSelected: d
    })
  }

  handleSelectAssignment = (values) => {
    const topicId       = _.get(values, '[0].messenger_topic_id');
    const assignmentId  = _.get(values, '[0].assignment.id');
    const selectedAssignment = _.get(this, 'props.messengerStore.selectedAssignment');
    // get messages
    if(this.props.messengerInStore.getMessages && topicId) {
      this.setState({
        loading: true,
        logsLoadingCounter: 0
      });

      // Load messages
      this.props.messengerInStore.getMessages(topicId).then(res => {
        if(res.ok && res.status === 200) {
          this.setState({
            listMsg: res.data.map(({ref_type, ...msg}) => ({ref_type: msg.files.length ? "NEW_MASSAGE_IMAGE" : ref_type, ...msg})),
            selectedTopicId: topicId,
          });
        } else {
          this.setState({listMsg: []});
        }
        this.setState({loading: false});
      });

      // Load assignment events
      if(assignmentId) {
        this.props.messengerInStore.getAssignmentEvent(assignmentId).then(res => {
          if(res.ok && res.status === 200 && res.data) {
            this.setState({
              assignmentLogs: filterEvents("ASSIGNMENT", res.data).map(a => ({body: convertAssignmentConversationToTitle(a), ...a})),
              logsLoadingCounter: this.state.logsLoadingCounter + 1,
            });
          }
        })
      }

      // Load activity logss
      this.props.messengerInStore.getActivityLogs(topicId).then(res => {
        if(res.ok && res.status === 200 && res.data) {
          this.setState({
            activityLogs: res.data.map((msg) => ({
              ...msg,
              ref_type: "TIMELINE",
              body: convertActivityLogToTitle(msg),
              description: convertActivityLogToTitle(msg),
            })),
            logsLoadingCounter: this.state.logsLoadingCounter + 1,
          })
        }
      });

      // Get stop event from assignment detail
      this.props.messengerInStore.getAssignmentDetail(assignmentId).then(res => {
        if(res.ok && res.status === 200 && res.data) {
          const stops = mapShipmentLabelToStops(res.data.shipmentLabels, res.data.stops).filter(a => a);
          console.log(filterEvents("STOPS", stops))
          this.setState({
            stopLogs: filterEvents("STOPS", stops).map(stop => ({body: convertAssignmentConversationToTitle(stop), ...stop})),
            logsLoadingCounter: this.state.logsLoadingCounter + 1,
          })
        }
      })
    } else {
      this.setState({
        listMsg: [],
        selectedTopicId: null,
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Load assignment convertation summary
    if(!_.isEqual(prevState.dateSelected, this.state.dateSelected)) {
      const driverId  = _.get(this, 'props.messengerStore.topicSelected.ref_attr.driver.id');
      const refType   = _.get(this, 'props.messengerStore.topicSelected.ref_type');
      const isDriver  = _.isEqual(MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT, refType);

      if(isDriver && driverId) {
        const query = {
          driver_id: parseInt(driverId),
          start_ts: moment(this.state.dateSelected).startOf('day').unix()*1000,
          end_ts: moment(this.state.dateSelected).endOf('day').unix()*1000,
        };
        this.props.messengerInStore.getAssignmentConversationSummary(query).then(res => {
          if(res.ok && res.status === 200 && res.data) {
            const assignmentSummeries = res.data;
            this.setState({
              assignmentSummaries: assignmentSummeries,
              filterOptions: assignmentSummeries.map(a => ({
                value: a,
                label: `<span style="font-size: 10px;">${a.assignment.label} / ${a.assignment.id} ${_.defaultTo(a.assignment.status && (' - ' + a.assignment.status), '')}</span>`
              })),
            });
            // if there is active assignment, then load this
            const isActiveAssignments = assignmentSummeries.filter(a => _.get(a, 'assignment.is_active'));
            if(isActiveAssignments) {
              this.handleSelectAssignment(isActiveAssignments);
              this.setState({activeAssignment: isActiveAssignments[0]});
            }
          }
        });
      }
    }
    // Merge logs
    if( (prevState.logsLoadingCounter !== this.state.logsLoadingCounter && this.state.logsLoadingCounter === 3) ) {
      let _listMsg = this.state.listMsg;
          _listMsg = _listMsg.concat(this.state.stopLogs, this.state.assignmentLogs, this.state.activityLogs);
      this.setState({listMsg: _listMsg});
    }
  }

  render() {
    const timeOptions = {
      dateFormat: 'MM/DD/YYYY',
      placeHolder: 'Start time',
      enableTime: false,
      altInput: true,
      clickOpens: true,
      defaultValue: this.state.dateSelected
    };
    const {activeAssignment} = this.state;

    return <ThemeProvider theme={lightTheme}>
      <Grid container direction={'column'} style={{height: '100%'}} wrap={'nowrap'}>
        <Box p={2} bgcolor={'primary.gray400'}>
          <Grid container alignItems={'center'}>
            <S.Text>{`Date`}</S.Text>
            <Box mx={1}>
              <AxlDateInput options={timeOptions} theme={`secondary`} onChange={this.handleSelectDate} />
            </Box>
            <S.Text mr={1}>{`Assignments (${this.state.filterOptions.length})`}</S.Text>
            {this.state.filterOptions && <AxlMUISelect
              showAll
              defaultChecked={activeAssignment}
              options={this.state.filterOptions}
              single={true}
              theme={'light'}
              onChange={this.handleSelectAssignment} />}
          </Grid>
        </Box>
        <Grid item xs style={{overflow: 'hidden'}}>
          {this.state.loading ? (<Box display="flex" height={1} alignItems={'center'} justifyContent={'center'}><CircularProgress size={75} thickness={1} /></Box>) :
            (!!this.state.listMsg.length ?
              <ListBoxChat listMsg={this.state.listMsg} user={_.get(this, 'props.userStore.user')} /> :
              <Box display="flex" height={1} alignItems={'center'} justifyContent={'center'}>{`No Prior`}</Box>)}
        </Grid>
        {this.state.selectedTopicId && <Box py={2}>
          {!_.isNumber(this.state.selectedTopicId) && <S.LinkToActive href={`/messenger/${this.state.selectedTopicId}`} target={"_blank"}>{`Switch to Active Chat`}</S.LinkToActive>}
        </Box>}
      </Grid>
    </ThemeProvider>
  }
}

export default compose(
  withRouter,
  withFirebase,
  inject('messengerInStore', 'userStore', 'messengerStore'),
  observer
)(AssignmentMiniChat);