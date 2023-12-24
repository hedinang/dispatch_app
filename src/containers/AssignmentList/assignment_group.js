import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { AxlMiniGroupAssignments } from 'axl-reactjs-ui';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

// Utils

// Components

// Styles
import styles, * as E from './styles';
import LazyLoad from 'react-lazy-load';
import Assignment from './assignment';


@inject('assignmentStore', 'shipmentStore')
@observer
class SelectedIndicator extends Component {
    render() {
        const { assignmentStore, id } = this.props

        const {
            selectedAssignmentId,
            // assignmentSummeries,
        } = assignmentStore;

        if (!selectedAssignmentId || selectedAssignmentId === id) return <React.Fragment></React.Fragment>
        return <div style={{backgroundColor: 'white', opacity: .5, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 5, pointerEvents: 'none'}}></div>
    }
}


@inject('assignmentStore', 'shipmentStore')
// @observer
class AssignmentGroup extends Component {
    constructor(props) {
        super(props)
    }
    
    selectAssignment = (a) => {
        const { assignmentStore, shipmentStore, history } = this.props
        const { selectedAssignment = {} } = assignmentStore
        let assignment = selectedAssignment ? selectedAssignment.assignment : null
        let day = assignmentStore.date
        let region = assignmentStore.regions.length > 0 ? assignmentStore.regions.join(',') : 'all'
        let client = assignmentStore.clients.length > 0 ? assignmentStore.clients[0] : 'all'
        if (a && (!assignment || a.id !== assignment.id)) {
          history.push(`/routes/${day}/${region}/${client}/${a.id}${history.location && history.location.search ? history.location.search : ""}`)
          a.tour_cost = null;
          assignmentStore.selectAssignment(a)
        }
        else {
          history.push(`/routes/${day}/${region}/${client}${history.location && history.location.search ? history.location.search : ""}`)
          assignmentStore.selectAssignment(null)
        }
        shipmentStore.unselectStop();
        assignmentStore.setHidden('completed', false);
        assignmentStore.setHidden('in_progress', false);
    }
    
    render() {
        const VISIBLE_ITEM_NUMBER = 10; // Always show 10 first assignments
        const VISIBLE_ITEMS = [...Array(VISIBLE_ITEM_NUMBER).keys()]
        const LAZYLOAD_OFFSET_BOTTOM = 400
        const ASSIGNMENT_DEFAULT_HEIGHT = 81
        const ASSIGNMENT_ROW_HEIGHT = 23
        const MAXIMUM_TEXT_LENGTH = 40 // maximum characters number per a row

        const { assignments, color, title, status, eta } = this.props

        return <AxlMiniGroupAssignments
            length={assignments.length}
            color={color}
            text={title}
            style={{ width: '100%' }}>
            {assignments.map((a, index) => {
                const assignmentTags = a.aggregated_tags ? a.aggregated_tags.map((tag, i) => {
                    return {
                        text: tag.toLowerCase() === 'commercial' ? <span style={styles.text}><i className="fa fa-clock-o" style={{ marginRight: '5px' }} />{` Commercial`}</span> : <span style={styles.text}>{`${tag}`}</span>,
                        value: i,
                        plaint_text: tag.toLowerCase() === 'commercial' ? 'Commercial' : tag
                    };
                }) : [];

                // const mgs = {
                //   hasMsg: _.includes(_.get(_.filter(assignmentSummeries, (as) => _.isEqual(as.assignmentId, a.id)), '[0]follower_ids', 0), userStore.user.id),
                //   unread: _.get(_.filter(assignmentSummeries, (as) => _.isEqual(as.assignmentId, a.id)), '[0]unviewed_messages_count', 0) > 0
                // };

                if (!!a.courier_id) {
                    assignmentTags.push({
                        text: <span style={styles.text}>DSP</span>,
                        value: assignmentTags.length,
                        bgColor: '#4abc4e',
                        plaint_text: 'DSP'
                    })
                }

                if (VISIBLE_ITEMS.includes(index)) {
                    return <div style={{position: 'relative'}} key={a.id} data-testid={`${title}`}>
                        <Assignment
                          mgs={{}}
                          tags={assignmentTags}
                          onClick={this.selectAssignment}
                          assignment={a}
                          status={status}
                          eta={eta && a.eta && a.eta.eta ? a.eta : null}
                          // style={{ opacity: (!selectedAssignmentId || selectedAssignmentId === a.id) ? 1.0 : 0.5 }}
                        />
                        <SelectedIndicator id={a.id} />
                    </div>
                } else {
                    var height = ASSIGNMENT_DEFAULT_HEIGHT;
                    if (assignmentTags.length) {
                        var tagPlaintText = assignmentTags.map(function (assignmentTag) {
                            return assignmentTag.plaint_text
                        }).join("");
                        height += tagPlaintText.length <= MAXIMUM_TEXT_LENGTH ? ASSIGNMENT_ROW_HEIGHT : ASSIGNMENT_ROW_HEIGHT * 2
                    }
                    return <LazyLoad height={height} offsetBottom={LAZYLOAD_OFFSET_BOTTOM} key={a.id}>
                        <div style={{position: 'relative'}}>
                            <Assignment
                              mgs={{}}
                              tags={assignmentTags}
                              onClick={this.selectAssignment}
                              assignment={a}
                              status={status}
                              eta={eta && a.eta && a.eta.eta ? a.eta : null}
                            //   style={{opacity: !selectedAssignmentId || selectedAssignmentId === a.id ? 1.0 : 0.5}}
                            />
                            <SelectedIndicator id={a.id} />
                        </div></LazyLoad>
                }
            })}

        </AxlMiniGroupAssignments>
    }
}

export default AssignmentGroup
