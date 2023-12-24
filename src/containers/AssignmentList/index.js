import React, { Component, memo, useCallback } from 'react';
import { inject, observer } from 'mobx-react';
import { AxlMiniAssignmentBox, AxlMiniGroupAssignments, AxlLoading } from 'axl-reactjs-ui';
import moment from 'moment'
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { toJS } from 'mobx';
import SyncIcon from '@material-ui/icons/Sync';
import { Box, Button, Tooltip } from '@material-ui/core';
import { DRIVER_TAGS } from '../../constants/assignment';
// Utils

// Components

// Styles
import styles, * as E from './styles';
import AssignmentListFilter from './filter';
import LazyLoad from 'react-lazy-load';
import Assignment from './assignment';
import WebSocket from './websocket';

import AssignmentGroup from './assignment_group';
import AxlSearchBox from '../../components/AxlSearchBox';

@inject('assignmentStore')
@observer
class UnassignedList extends Component {

  render() {
    const { assignmentStore, history } = this.props
    const { unassignedAssignments, hidden } = assignmentStore;

    if (hidden['unassigned']) return <div></div>

    return <AssignmentGroup
      assignments={ unassignedAssignments }
      color={'#bebfc0'}
      title={'UNASSIGNED'}
      eta={false}
      history={history}
      status={'UNASSIGNED'}
    />
  }
}

@inject('assignmentStore')
@observer
class PendingList extends Component {

  render() {
    const { assignmentStore, history } = this.props
    const { pendingAssignments, hidden } = assignmentStore;

    if (hidden['pending']) return <div></div>
    return <AssignmentGroup
      assignments={ pendingAssignments }
      color={'#fa6725'}
      title={'PENDING'}
      eta={true}
      status={'PENDING'}
      history={history}
    />
  }
}

@inject('assignmentStore')
@observer
class PickingUpList extends Component {

  render() {
    const { assignmentStore, history } = this.props
    const { pickingUpAssignments, hidden } = assignmentStore;

    if (hidden['picking_up']) return <div></div>
    return <AssignmentGroup
      assignments={ pickingUpAssignments }
      color={'#fa6725'}
      title={'PICKING UP'}
      eta={true}
      status={'PICKING UP'}
      history = {history} />
  }
}

@inject('assignmentStore')
@observer
class InActiveList extends Component {

  render() {
    const { assignmentStore, history } = this.props
    const { inactiveAssignments, hidden } = assignmentStore;

    if (hidden['inactive']) return <div></div>
    return <AssignmentGroup
      assignments={ inactiveAssignments }
      color={'#fbc04f'}
      title={'INACTIVE'}
      eta={false}
      status={'INACTIVE'}
      history = {history}
    />
  }
}

@inject('assignmentStore')
@observer
class InProgressList extends Component {

  render() {
    const { assignmentStore, history } = this.props
    const { inProgressAssignments, hidden } = assignmentStore;

    if (hidden['in_progress']) return <div></div>
    return <AssignmentGroup
      assignments={ inProgressAssignments }
      color={'#fbc04f'}
      title={'IN PROGRESS'}
      eta={false}
      status={'IN PROGRESS'}
      history = {history}
    />
  }
}

@inject('assignmentStore')
@observer
class CompletedList extends Component {
  render() {
    const { assignmentStore, history } = this.props
    const { completedAssignments, hidden } = assignmentStore;

    if (hidden['completed']) return <div></div>
    return <AssignmentGroup
      assignments={ completedAssignments }
      color={'#4abc4e'}
      title={'COMPLETED'}
      eta={false}
      status={'COMPLETED'}
      history = {history}
    />
  }
}

@inject('assignmentStore')
@observer
class AtRiskList extends Component {

  render() {
    const { assignmentStore, history } = this.props
    const { riskyAssignments, riskObj, hidden } = assignmentStore;
    const atRiskAt = riskObj.createdTs ? moment.tz(riskObj.createdTs, moment.tz.guess()).format('LT z') : 'not check yet'

    const riskyInactiveAssignments = riskyAssignments.filter(a => riskObj['inactiveIds'].includes(a.id))
    const riskyReturnAssignments = riskyAssignments.filter(a => riskObj['returnIds'].includes(a.id))
    const riskyNOTDAssignments = riskyAssignments.filter(a => riskObj['lateIds'].includes(a.id))

    if (hidden['at_risk']) return <div></div>

    return (
      <React.Fragment>
        <AssignmentGroup
          assignments={ riskyInactiveAssignments }
          color={'#0f068e'}
          title={`AT RISK - STALLED ${atRiskAt}`}
          eta={false}
          status={'AT RISK'}
          history = {history}
        />
        <AssignmentGroup
          assignments={ riskyReturnAssignments }
          color={'#1100f6'}
          title={`AT RISK - RETURN ${atRiskAt}`}
          eta={false}
          status={'AT RISK'}
          history = {history}
        />
        <AssignmentGroup
          assignments={ riskyNOTDAssignments }
          color={'#887fff'}
          title={`AT RISK - NOTD ${atRiskAt}`}
          eta={false}
          status={'AT RISK'}
          history = {history}
        />
      </React.Fragment>
    )
  }
}


@inject('assignmentStore', )
@observer
class AssignmentListHeader extends Component {
  constructor(props) {
    super(props)
    this.onTagFilter = this.onTagFilter.bind(this);
    this.onInlineFilter = this.onInlineFilter.bind(this);
  }

  onInlineFilter(value) {
    const { assignmentStore } = this.props
    assignmentStore.setInlineFilter(value)
  }

  onTagFilter(values) {
    const { assignmentStore } = this.props

    const lowerDriverTags = DRIVER_TAGS.map(t => t.toLowerCase())
    const selectedDriverTags = values.filter(t => lowerDriverTags.includes(t.toLowerCase()))
    const selectedTags = values.filter(t => !selectedDriverTags.map(t => t.toLowerCase()).includes(t.toLowerCase()))
    
    assignmentStore.setTagsFilter(selectedTags, selectedDriverTags);
  }

  handleRefresh = () => {
    const { assignmentStore } = this.props;
    assignmentStore.loadAssignments();
  }

  render() {
    const { assignmentStore } = this.props

    const {
      loadingAssignments,
      // assignmentSummeries,
      inlineFilter,
      assignmentAggregatedTags,
    } = assignmentStore;
    
    const tags = [
        ...DRIVER_TAGS.map(t => Object.assign({}, {
          text: <span>{t}</span>,
          value: t
        })),
        {
          text: <span style={styles.text}>{` DSP`}</span>,
          value: 'DSP'
        },
        ...assignmentAggregatedTags.map(t => Object.assign({}, {
          text: <span>{t}</span>,
          value: t
        }))
    ];
    
    const date = this.props.assignmentStore && this.props.assignmentStore.hasOwnProperty('date') ? this.props.assignmentStore.date: null

    return <div>
      { loadingAssignments && <E.LoadingContainer><AxlLoading color="#FFF" size={75} thin={1} /></E.LoadingContainer> }
      <WebSocket date={date} />
      <div style={{display: 'flex', position: 'relative'}}>
        <div style={{width: 28, height: 32, paddingTop: 4}}>
          <AssignmentListFilter />
        </div>
        <div style={{flex: 1}}>
        <AxlSearchBox theme={`dropdown`} placeholder='Search Assignment' defaultValue={assignmentStore.inlineFilter} style={{width: '100%'}} onChange={(e) => this.onInlineFilter(e)} tags={tags} onTagSelect={this.onTagFilter} />
        </div>
        <Box style={{marginLeft: '5px'}} data-testid="route-list-refresh-button">
          <Tooltip title="Refresh Assignments Info" aria-label="refresh">
            <Button aria-label="refresh" size='small' color='primary' onClick={this.handleRefresh} variant="outlined" disableElevation style={{padding: '6.5px', minWidth: '25px'}}>
              <SyncIcon fontSize='small'/>
            </Button>
          </Tooltip>
        </Box>
      </div>
    </div>
  }
}

// @inject('assignmentStore' )
class AssignmentList extends Component {
  constructor(props) {
    super(props)
  }

  // componentDidMount(){
  //   const { assignmentStore } = this.props
  //   assignmentStore.loadAssignments();
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if(this.props.match.params.assignmentId && !_.isEqual(prevProps.match.params, this.props.match.params)) {
  //     this.props.assignmentStore.loadAssignments();
  //   }
  // }

  render() {
    const { history } = this.props
    // Demo Data

    return <div style={styles.container}>
      <AssignmentListHeader />

      {/* <AxlSearchBox theme={`dropdown`} placeholder='Search Assignment' defaultValue={assignmentStore.inlineFilter} style={{width: '100%'}} onChange={this.onInlineFilter} tags={tags} onTagSelect={this.onTagFilter} /> */}
      <div style={styles.list} className={'momentumScroll'}>
        {/* { loadingAssignments && <E.LoadingContainer><AxlLoading color="#FFF" size={75} thin={1} /></E.LoadingContainer> } */}
        <UnassignedList history={history} />
        <PendingList history={history} /> 
        <PickingUpList history={history} />
        <InActiveList history={history} />
        <AtRiskList history={history} />
        <InProgressList history={history} />
        <CompletedList history={history} />
      </div>
    </div>
  }
}

export default AssignmentList
