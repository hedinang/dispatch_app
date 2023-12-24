import React, { Component } from 'react';
import moment from 'moment';
import { inject, Observer, observer } from 'mobx-react';
import { Route, Switch, Link } from 'react-router-dom';
import { AxlButton, AxlInput, AxlModal, AxlSearchBox } from 'axl-reactjs-ui';

import TooltipContainer from '../../components/TooltipContainer';
import { SolutionListComponent } from '../../components/SolutionList';
import { AssignmentListComponent } from '../../components/AssignmentList';

import styles from './styles';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';

@inject('solutionListStore', 'scheduleStore', 'assignmentListStore', 'permissionStore')
@observer
class SolutionList extends Component {
  componentDidMount() {
    const { solutionListStore, assignmentListStore } = this.props;
    solutionListStore.filters = {
      page: 1,
      size: 20,
      order_by: 'id',
      desc: true,
    };

    assignmentListStore.static_filters = {};
    assignmentListStore.selectedItems = [];
  }

  addAssignments = (e) => {
    const { scheduleStore, assignmentListStore } = this.props;
    const { params } = this.props.match;
    const ids = assignmentListStore.result.items ? assignmentListStore.result.items.map((item) => item.id) : [];
    if (ids.length > 0)
      scheduleStore.addAssignments(params.id, ids, (items) => {
        assignmentListStore.schedule.directAddItems(items);
        this.props.history.push(`/schedule/${params.id}`);
      });
  };

  addSelectedAssignments = (e) => {
    const { scheduleStore, assignmentListStore } = this.props;
    const { params } = this.props.match;
    const ids = assignmentListStore.selectedItems ? assignmentListStore.selectedItems : [];
    if (ids.length > 0)
      scheduleStore.addAssignments(params.id, ids, (items) => {
        assignmentListStore.schedule.directAddItems(items);
        this.props.history.push(`/schedule/${params.id}`);
      });
  };

  changeSolutionSearch = (e) => {
    const { solutionListStore } = this.props;
    const value = e;

    if (value !== undefined) {
      solutionListStore.setFilters({
        q: value,
        page: 1,
      });
    }
  };

  searchSolution = (e) => {
    const { solutionListStore } = this.props;
    solutionListStore.search();
  };

  render() {
    const { assignmentListStore, permissionStore } = this.props;

    const renderer = {
      number_of_assignments: (v, item) => <Link to={`/schedule/${this.props.match.params.id}/solutions/${item.id}/assignments`}>({v})</Link>,
      predicted_start_ts: (v) => <span>{v ? moment(v).format('YYYY-MM-DD') : ''}</span>,
      regions: (v) => <span>{v ? v.join(', ') : ''}</span>,
    };

    const isDenied = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.ASSIGN);

    return (
      <AxlModal style={styles.modalContainer}>
        <div style={styles.modalListStyle}>
          {!this.props.location.pathname.endsWith('assignments') && (
            <div style={styles.searchContainer}>
              <div style={styles.searchBar}>
                <AxlSearchBox style={styles.searchBox} onChange={this.changeSolutionSearch} onEnter={this.search} />
                <AxlButton onClick={this.searchSolution} compact bg={'periwinkle'} style={styles.searchButton}>
                  Search
                </AxlButton>
              </div>
              <SolutionListComponent pagination renderer={renderer} allowSelect />
            </div>
          )}
          <Switch>
            <Route
              path={`/schedule/:id/solutions/:solutionId/assignments`}
              render={(props) => {
                const assignmentRenderer = {
                  shipment_count: (v) => {
                    return <span>{v} shipments</span>;
                  },
                  tour_cost: (v) => <span>${v}</span>,
                };

                return (
                  <Observer>
                    {() => (
                      <div style={styles.solutionsListContainer}>
                        <div style={styles.solutionsList}>
                          <AxlButton tiny bg={`gray`} onClick={() => props.history.goBack()} ico={{ className: 'fa fa-angle-left' }}>{`BACK`}</AxlButton>
                          <div style={styles.title}>
                            <span>{`Solution `}</span>
                            <strong>{props.match.params.solutionId}</strong> - <span style={styles.assignmentHighlight}>{`${assignmentListStore.result.items.length} assignments`}</span>
                            <AxlButton disabled={assignmentListStore.result.items.length < 1} style={styles.buttonSelectAll} onClick={this.addAssignments} tiny>{`SELECT ALL`}</AxlButton>
                          </div>
                        </div>
                        <div style={styles.filterContainer}>
                          <div style={styles.filterContainer}>
                            <div style={styles.filterLabel}>{`Filter by label:`}</div>
                            <AxlInput onChange={assignmentListStore.setStaticFilter('prefix')} style={styles.filterInput} placeholder="Prefix" />
                            <AxlInput onChange={assignmentListStore.setStaticFilter('from')} style={styles.filterInput} placeholder="From" />
                            <AxlInput onChange={assignmentListStore.setStaticFilter('to')} style={styles.filterInput} placeholder="To" />
                          </div>
                        </div>
                        <br />
                        <AssignmentListComponent baseUrl={`solutions/${props.match.params.solutionId}/assignments`} renderer={assignmentRenderer} allowSelect multipleSelect />
                      </div>
                    )}
                  </Observer>
                );
              }}
            />
          </Switch>
        </div>
        <div style={styles.modalBottom}>
          <Link to={`/schedule/${this.props.match.params.id}`}>
            {assignmentListStore.selectedItems.length > 0 && <span>{assignmentListStore.selectedItems.length} selected</span>}
            <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
              <AxlButton compact={true} disabled={assignmentListStore.selectedItems.length < 1 || isDenied} style={{ margin: 0, minWidth: '180px' }} onClick={this.addSelectedAssignments}>
                ADD ASSIGNMENTS
              </AxlButton>
            </TooltipContainer>
            <AxlButton style={{ margin: 0, minWidth: '180px' }} bg={'none'} compact={true}>
              Cancel
            </AxlButton>
          </Link>
        </div>
      </AxlModal>
    );
  }
}

export default SolutionList;
