import React from 'react';
import { AxlPanel, AxlTooltip, AxlLoading, AxlPagination, AxlButton, AxlTabSimple } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import moment from 'moment-timezone';
import Moment from 'react-moment';
import _ from 'lodash';

// Utils
import TYPE_MAPPING from '../../constants/driverSuspensionType';
import {SHIPMENT_STOP_TYPE} from '../../constants/type';
import {STOP_STATUS} from '../../constants/status';

// Components
import DriverHistoryList from '../DriverHistoryList';
import ActivityDriver from '../DriverHistoryList/ActivityDriver';

// Styles
import styles, * as E from './styles';
import AssignmentMiniDetail from "../../containers/AssignmentMiniDetail";
import TicketMiniDetail from "../../containers/TicketMiniDetail";
import ShipmentDetailPanel from "../../containers/ShipmentMessenger/ShipmentDetailPanel";
import ChatBoxContainer from "../../containers/ShipmentMessenger/ShipmentSupportPanel/ChatBoxContainer";
import {mapPaymentStatusToColor, PAYMENT_TYPE} from "../../constants/payment";
import TimeWindowWithZone from "../TimeWindowWithZone";

@inject('driverStore')
class Active extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeRoutes: [],
      loadingActiveRoute: false
    }
  }

  componentDidMount() {
    const {driverStore, driver} = this.props;
    this.setState({loadingActiveRoute: true});
    driverStore.getActiveAssignment(driver.id).then(response => {
      this.setState({loadingActiveRoute: false});
      if (response.status === 200) {
        const activeRoutes = response.data.items;
        const historyMap = [];
        for (var i = 0; i < activeRoutes.length; i++) {
          const staticI = i;
          driverStore.getAssignmentHistory(activeRoutes[i].assignment.id).then(response => {
            historyMap.push(activeRoutes[staticI]);
            if (response.status === 200) {
              const histories = response.data.filter(item => 
                [STOP_STATUS.SUCCEEDED, STOP_STATUS.FAILED, STOP_STATUS.READY, STOP_STATUS.EN_ROUTE].includes(item.status)
              );
              activeRoutes[staticI]['histories'] = histories;
            }

            if (historyMap.length === activeRoutes.length) {
              this.setState({activeRoutes});
            }
          })
        }
      }
    });
  }

  render() {
    // const { history } = this.props;
    const { activeRoutes, loadingActiveRoute } = this.state;
    const { assignmentLabel, assignment } = activeRoutes[0] || {};

    return <E.Container>
      { loadingActiveRoute && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} /> }
      <AxlPanel>
        {activeRoutes.length > 0 ? <div>
          <AxlPanel.Row style={styles.Row_1}>
            <AxlPanel.Col>
              <E.AssignmentName>{`Assignment ${assignment ? assignment.label : 'undefined'}`}</E.AssignmentName>
              <E.Text_2>{`${assignment.shipment_count} ${assignment.shipment_count > 1 ? 'Shipments' : 'Shipment'}`}</E.Text_2>
            </AxlPanel.Col>
            <AxlPanel.Col>
              <E.Label>{`TIME WINDOWS`}</E.Label>
              <TimeWindowWithZone
                timezone={_.get(assignment, 'timezone')}
                startTs={_.get(assignment, 'predicted_start_ts')}
                endTs={_.get(assignment, 'predicted_end_ts')} />
            </AxlPanel.Col>
            <AxlPanel.Col>
              <E.Label>{`ZONES`}</E.Label>
              <E.Text_1 className={`break`}><ZoneMore>{assignment.zones}</ZoneMore></E.Text_1>
            </AxlPanel.Col>
            <AxlPanel.Col flex={0}>
              <E.ViewDispatchButton href={`/assignments/${assignment.id}`} target={`_blank`}>{`View in Dispatch`}</E.ViewDispatchButton>
            </AxlPanel.Col>
          </AxlPanel.Row>
          <DriverHistoryList history={activeRoutes[0].histories} />
        </div> : <E.NoActiveSuspension>
          <E.Text_6>{`No Row!`}</E.Text_6>
        </E.NoActiveSuspension>}
      </AxlPanel>
    </E.Container>
  }
}

@inject('driverStore', 'ticketStore')
class Pending extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingRoutes: [],
      pendingTickets: [],
      loadingPendingRoute: false,
      loadingPendingTicket: false,
      selectedRoute: null,
      selectedTicket: null,
    }

    this.deselect = this.deselect.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const {driverStore, ticketStore, driver} = this.props;
    this.setState({loadingPendingRoute: true, loadingPendingTicket:  true});
    driverStore.getPendingAssignments(driver.id).then(response => {
      this.setState({loadingPendingRoute: false});
      if (response.status === 200) {
        this.setState({pendingRoutes: response.data.items});
      }
    });
    ticketStore.getOpenTicketsByHolder(`DR_${driver.id}`).then(res => {
      this.setState({loadingPendingTicket: false});
      if (res.ok) {
        this.setState({pendingTickets: res.data.filter(t => t.type === 'assignment')});
      }
    })
  }

  deselect(callback) {
    this.setState({selectedRoute: null, selectedTicket: null}, () => {
      if (callback) callback();
    });
  }

  render() {
    const {
      pendingRoutes, loadingPendingRoute, selectedRoute,
      pendingTickets, loadingPendingTicket, selectedTicket
    } = this.state;
    const { driver } = this.props
    const assignmentInfo = Object.assign({}, selectedRoute, {driver})
    const pendingRoutesGroupByDate = _(pendingRoutes).groupBy(p => moment(p.assignment.predicted_start_ts).format('MM/DD/YYYY')).map(p => p).orderBy(d => d[0].assignment.predicted_start_ts, ['desc']).value();

    if (selectedRoute) {
      return <AssignmentMiniDetail assignmentInfo={assignmentInfo} reloadData={this.loadData} onBack={this.deselect} />
    }

    if (selectedTicket) {
      return <TicketMiniDetail ticket={selectedTicket} reloadData={this.loadData} onBack={this.deselect} />
    }

    return <E.Container>
      { loadingPendingRoute && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} /> }
      { pendingRoutesGroupByDate && pendingRoutesGroupByDate.length > 0 ? pendingRoutesGroupByDate.map((pendingRoute, index) => (
        <E.PendingItems key={index}>
          <E.PanelTitle>{moment(pendingRoute[0].assignment.predicted_start_ts).format('dddd - MM/DD/YYYY')}</E.PanelTitle>
          { pendingRoute.map((p, i) => (
            <E.PendingItem key={i}>
              <AxlPanel>
                <AxlPanel.Row style={styles.Row_1}>
                  <AxlPanel.Col>
                    <E.AssignmentName>{`Assignment ${p.assignment.label ? p.assignment.label : 'undefined'}`}</E.AssignmentName>
                    <E.Text_2>{`${_.defaultTo(p.assignment.shipment_count, 0)} ${p.assignment.shipment_count > 1 ? 'Shipments' : 'Shipment'} - ${moment(p.assignment.predicted_end_ts).format('MM/DD/YYYY')}`}</E.Text_2>
                  </AxlPanel.Col>
                  <AxlPanel.Col>
                    <E.Label>{`TIME WINDOWS`}</E.Label>
                    <TimeWindowWithZone
                      timezone={_.get(p, 'assignment.timezone')}
                      startTs={_.get(p, 'assignment.predicted_start_ts')}
                      endTs={_.get(p, 'assignment.predicted_end_ts')} />
                  </AxlPanel.Col>
                  <AxlPanel.Col>
                    <E.Label>{`ZONES`}</E.Label>
                    <E.Text_1 className={`break`}><ZoneMore>{p.assignment.zones}</ZoneMore></E.Text_1>
                  </AxlPanel.Col>
                  <AxlPanel.Col flex={0}>
                    <AxlButton
                      bg="none" compact
                      onClick={() => this.setState({selectedRoute: p, selectedTicket: null})}
                    >
                      View
                    </AxlButton>
                  </AxlPanel.Col>
                </AxlPanel.Row>
              </AxlPanel>
            </E.PendingItem>
          ))}
        </E.PendingItems>
      )) : (
        <E.NoActiveSuspension>
          <E.Text_6>{`No Routes!`}</E.Text_6>
        </E.NoActiveSuspension>
      )}
      <E.PanelTitle>Pending Route Tickets</E.PanelTitle>
      <div style={{position: 'relative'}}>
        {loadingPendingTicket && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} />}
        <E.PendingItems>
          { pendingTickets && pendingTickets.length > 0 ? pendingTickets.map((pendingTicket, index) => (
            <E.PendingItem key={index}>
              <AxlPanel>
                <AxlPanel.Row style={styles.Row_1}>
                  <AxlPanel.Col>
                    <E.AssignmentName>{pendingTicket.name}</E.AssignmentName>
                    <E.Text_2>
                      <span>{pendingTicket.attributes.shipment_count_min} - {pendingTicket.attributes.shipment_count_max} Parcels</span>
                      <E.TicketPrice>(${pendingTicket.attributes.tour_cost_min} - ${pendingTicket.attributes.tour_cost_max})</E.TicketPrice>
                    </E.Text_2>
                  </AxlPanel.Col>
                  <AxlPanel.Col>
                    <E.Label>{`TARGET DATE`}</E.Label>
                    <E.Text_1>{moment(pendingTicket.target_start_ts).format('MM/DD/YYYY HH:mm')}</E.Text_1>
                  </AxlPanel.Col>
                  <AxlPanel.Col>
                    <E.Label>{`ZONES`}</E.Label>
                    <E.Text_1 className={`break`}><ZoneMore>{pendingTicket.attributes.zones}</ZoneMore></E.Text_1>
                  </AxlPanel.Col>
                  <AxlPanel.Col flex={0}>
                    <AxlButton
                      bg="none" compact
                      onClick={() => this.setState({selectedRoute: null, selectedTicket: pendingTicket})}
                    >
                      View
                    </AxlButton>
                  </AxlPanel.Col>
                </AxlPanel.Row>
              </AxlPanel>
            </E.PendingItem>
          )) : (
            <E.NoActiveSuspension>
              <E.Text_6>{`No Tickets!`}</E.Text_6>
            </E.NoActiveSuspension>
          )}
        </E.PendingItems>
      </div>
    </E.Container>
  }
}

@inject('driverStore')
class Past extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pastRoutes: [],
      currentPage: 1,
      totalResult: 0,
      loadingPastRoute: false
    }
  }

  componentDidMount() {
    const {currentPage} = this.state;
    const {driverStore, driver} = this.props;
    this.setState({loadingPastRoute: true});
    driverStore.getPastAssignments(driver.id, currentPage).then(response => {
      this.setState({loadingPastRoute: false});
      if (response.status === 200) {
        this.setState({pastRoutes: response.data.items, totalResult: Math.ceil(response.data.count / 10)});
      }
    });
  }

  onSelectPage = (page) => {
    const {driverStore, driver} = this.props;
    this.setState({loadingPastRoute: true});
    driverStore.getPastAssignments(driver.id, page).then(response => {
      this.setState({loadingPastRoute: false});
      if (response.status === 200) {
        this.setState({pastRoutes: response.data.items, currentPage: response.data.page});
      }
    });
  }

  render() {
    const { pastRoutes, loadingPastRoute, currentPage, totalResult } = this.state;

    return <E.Container>
      { loadingPastRoute && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} /> }
      <E.PendingItems>
        { (pastRoutes && pastRoutes.length > 0) ? pastRoutes.map((p, index) => {
          let successPercent = 0;
          if (p.stops && p.stops.length > 0) {
            const dropoffStops = p.stops.filter(st => st.type === "DROP_OFF");
            const succeededDropoff = dropoffStops.filter(st => st.status === "SUCCEEDED");
            successPercent = (succeededDropoff.length / dropoffStops.length) * 100;
            successPercent = successPercent > 0 && successPercent < 100 ? successPercent.toFixed(1) : successPercent;
          }

          return <E.PendingItem key={index}>
            <AxlPanel>
              <AxlPanel.Row style={styles.Row_1}>
                <AxlPanel.Col>
                  <E.Label>{`ASSIGNMENT`}</E.Label>
                  <E.AssignmentName>{`${_.get(p, 'assignment.label', '-')}`}</E.AssignmentName>
                  <E.Text_2>{`${_.defaultTo(p.shipments.length, 0)} ${p.shipments.length > 1 ? 'Shipments' : 'Shipment'} - ${moment(p.assignment.predicted_end_ts).format('MM/DD/YYYY')}`}</E.Text_2>
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.Label>{`TIME WINDOWS`}</E.Label>
                  <TimeWindowWithZone
                    timezone={_.get(p, 'assignment.timezone')}
                    startTs={_.get(p, 'assignment.predicted_start_ts')}
                    endTs={_.get(p, 'assignment.predicted_end_ts')} />
                </AxlPanel.Col>
                <AxlPanel.Col style={{padding: '0 15px'}}>
                  <E.Label>{`ZONES`}</E.Label>
                  <E.Text_1 className={`break`}><ZoneMore>{p.assignment.zones}</ZoneMore></E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col style={{padding: '0 15px'}}>
                  <E.Label>{`PRICE`}</E.Label>
                  <E.Text_1>${_.get(p, 'assignment.tour_cost')} {_.get(p, 'assignment.bonus') ? `(+$${_.get(p, 'assignment.bonus')})` : ''}</E.Text_1>
                </AxlPanel.Col>
                {<AxlPanel.Col center>
                  <E.Text_3>{`${successPercent}%`}</E.Text_3>
                  <E.Text_4>{`SUCCESSFUL`}</E.Text_4>
                </AxlPanel.Col>}
                <AxlPanel.Col flex={0}>
                  <E.ViewDispatchButton href={`/assignments/${p.assignment.id}`} target={`_blank`}>{`View in Dispatch`}</E.ViewDispatchButton>
                </AxlPanel.Col>
              </AxlPanel.Row>
            </AxlPanel>
          </E.PendingItem>}) : <E.NoActiveSuspension>
            <E.Text_6>{`No Row!`}</E.Text_6>
        </E.NoActiveSuspension>}
        {totalResult > 1 && <div style={{textAlign: 'center', padding: '10px 15px'}}>
          <AxlPagination onSelect={this.onSelectPage} current={currentPage} total={totalResult} />
        </div>}
      </E.PendingItems>
    </E.Container>
  }
}

class ZoneMore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
    this.show = this.show.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.children !== nextProps.children) {
      this.setState({show: false});
    }
  }

  show() { this.setState({show: true })}

  render() {
    if(!this.props.children || this.props.children === '') return '-';

    const first = this.props.children.split(',');
    const last = first.filter((x, i) => i !== 0);

    return <span>{first[0]}{last.length > 0 && (!this.state.show ? <E.MoreLink onClick={this.show}>{`+${last.length} more`}</E.MoreLink> : <span>{', ' + last.join(', ')}</span>)}</span>;
  }
}

@inject('driverStore')
class Activity extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activities: [],
      loadingActivity: false
    }
  }

  componentDidMount() {
    const {driverStore, driver} = this.props;
    this.setState({loadingActivity: true});
    driverStore.getDriverActivity(driver.id).then(response => {
      this.setState({loadingActivity: false});
      if (response.status === 200) {
        const activities = response.data;
        this.setState({activities});
      }
    });
  }

  render() {
    const { activities, loadingActivity } = this.state;
    return <E.Container>
      { loadingActivity && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} /> }
      <AxlPanel>
        {activities.length > 0 ? <div>
          <ActivityDriver activities={activities} />
        </div> : <E.NoActiveSuspension>
          <E.Text_6>{`No Row!`}</E.Text_6>
        </E.NoActiveSuspension>}
      </AxlPanel>
    </E.Container>
  }
}

class Payment extends React.Component {
  render() {
    const {driver} = this.props;

    return <E.PaymentTabs>
      <AxlTabSimple disableRipple align={'center'} titleStyle={{textAlign: 'center', minWidth: 'inherit'}} items={[
        {title: 'History', component: <PaymentHistory driver={driver} />},
        {title: 'Due', component: <PaymentDue driver={driver} />},
      ]} />
    </E.PaymentTabs>
  }
}

@inject('driverStore', 'paymentStore', 'userStore')
@observer
class PaymentHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      totalResult: 0,
      loading: false,
      query: {
        driver_id: _.get(props, 'driver.id'),
        from_ts: 1202060954897,
        to_ts: 1902060954897,
        status: '',
        order_by: 'id',
        desc: true,
        page: 1,
        size: 10,
      },
      data: {
        "count": 0,
        "size": 0,
        "page": 0,
        "paymentDetails": []
      },
    }
  }

  componentDidMount() {
    // Initial load page
    this.loadPage();
  }

  onSelectPage = (page) => {
    this.loadPage(page);
  }

  loadPage = (currentPage = 1) => {
    const {query} = this.state;
    const params = Object.assign({}, query, {page: currentPage});
    const {driverStore, driver} = this.props;
    this.setState({
      loading: true,
      currentPage: currentPage,
    });
    // Load history
    driverStore.getPaymentHistory(params).then(res => {
      this.setState({loading: false});
      if (res.status === 200) {
        this.setState({
          data: res.data,
        });
      }
    });
  }

  convertStringToDate(string) {

  }

  convertPaymentHistorySummaryToDetail(objs = []) {
    const result = objs
      .filter(obj => [PAYMENT_TYPE.OUTVOICE_ROUTE_DRIVING, PAYMENT_TYPE.OUTVOICE_TIP].indexOf(obj.type) !== -1)
      .map(obj => {
        const mount = _.get(obj, 'mount', 'N/A');
        const count = _.get(obj, 'count', 'N/A');
        const type = _.get(obj, 'type', 'N/A');

        switch (type) {
          case PAYMENT_TYPE.OUTVOICE_ROUTE_DRIVING: return `${count} ${count > 1 ? 'Tasks' : 'Task'}`;break;
          case PAYMENT_TYPE.OUTVOICE_TIP: return `${count} ${count > 1 ? 'Tips': 'Tip'}`;break;
          default: return 'N/A';break;
        }
      })

    return result.join(' + ')
  }

  render() {
    const {
      data, loading,
      currentPage
    }                     = this.state;
    const items           = _.defaultTo(data.paymentDetails, []);
    const totalResult     = Math.ceil(data.count / 10);
    const isViewPaystub   = _.get(this, 'props.userStore.user.scopes', []).indexOf('finance-manager') !== -1;

    return <E.Container>
      { loading && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} /> }
      <E.PendingItems>
        { (items.length > 0) ? items.map((item, index) => {
          return <E.PendingItem key={index}>
            <AxlPanel>
              <AxlPanel.Row style={styles.Row_1}>
                <AxlPanel.Col>
                  <E.AssignmentName>{item.memo}</E.AssignmentName>
                  {/*{console.log(JSON.parse(item.summary)['details'])}*/}
                  {this.convertPaymentHistorySummaryToDetail(JSON.parse(item.summary)['details'])}
                </AxlPanel.Col>
                <AxlPanel.Col>
                  <E.Label>{`AMOUNT`}</E.Label>
                  <E.AmountText>{`$${item.amount}`}</E.AmountText>
                </AxlPanel.Col>
                <AxlPanel.Col style={{padding: '0 15px'}}>
                  <E.Label>{`STATUS`}</E.Label>
                  <E.Text_1 className={`break`} style={{color: mapPaymentStatusToColor(item.status)}}>{item.status}</E.Text_1>
                </AxlPanel.Col>
                <AxlPanel.Col flex={0}>
                  {isViewPaystub && <E.ViewDispatchButton href={`${process.env.REACT_APP_API_PAYMENT}/driver-payments/${item.id}/summary`} target={`_blank`}>{`View Paystub`}</E.ViewDispatchButton>}
                </AxlPanel.Col>
              </AxlPanel.Row>
            </AxlPanel>
          </E.PendingItem>}) : <E.NoActiveSuspension>
          <E.Text_6>{`No Row!`}</E.Text_6>
        </E.NoActiveSuspension>}
        {totalResult > 1 && <div style={{textAlign: 'center', padding: '10px 15px'}}>
          <AxlPagination onSelect={this.onSelectPage} current={currentPage} total={totalResult} />
        </div>}
      </E.PendingItems>
    </E.Container>
  }
}

@inject('driverStore')
class PaymentDue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      totalResult: 0,
      loading: false,
      items: [],
      query: {
        driver_id: _.get(props, 'driver.id'),
      },
    }
    this.loadPage = this.loadPage.bind(this);
  }

  componentDidMount() {
    // Initial load page
    this.loadPage();
  }

  loadPage(currentPage = 1) {
    const that  = this;
    const {query} = this.state;
    const params = Object.assign({}, query);
    const {driverStore, driver} = this.props;
    this.setState({
      loading: true,
      currentPage: currentPage,
    });
    // Load history
    driverStore.getDueHistory(params).then(res => {
      that.setState({loading: false});
      if (res.status === 200) {
        this.setState({items: res.data});
      }
    });
  }

  renderTransactionType(type, label, createdTS, assignmentId, amount) {
    let text              = '';
    const labelText       = assignmentId ? `<b>${label}</b>` : '';
    const assignmentText  = assignmentId ? `<span>${assignmentId}</span>` : '';

    switch (type) {
      case PAYMENT_TYPE.OUTVOICE_TIP:
        text = 'Tip of Assignment';
        break;
      case PAYMENT_TYPE.PAYMENT_DEDUCT:
        text = 'Deduct of Assignment';
        break;
      default:
        text = `<u>${type}</u> ${assignmentId ? 'of Assignment' : ''}`;
        break;
    }

    return `${text} ${labelText}  ${assignmentText} ${createdTS ? moment(createdTS).format('MM/DD/YYYY') : 'N/A'} - <b>$${amount}</b>`;
  }

  renderTransactionDetail(item) {
    const label         = _.get(item, 'assignment.label', 'N/A');
    const createdTS     = _.get(item, 'transaction._created');
    const amount        = _.get(item, 'transaction.amount', 0);
    const assignmentId  = _.get(item, 'assignment.id') ||
                          _.get(item, 'transaction.assignment_id');
    const type          = _.get(item, 'transaction.type');
    const renderText    = this.renderTransactionType(type, label, createdTS, assignmentId, amount);

    return <E.PaymentDueDetail dangerouslySetInnerHTML={{__html: renderText}} />;
  }

  renderTransactions(items) {
    const itemsGrouped = _.groupBy(items, (item) => {
      const ts = _.get(item, 'transaction._created');
      return moment(item.transaction._created).startOf('day')
    })
    const taskCounter = _.filter(items, item => _.isEqual(_.get(item, 'transaction.type'), PAYMENT_TYPE.OUTVOICE_ROUTE_DRIVING)).length;
    const tipCounter  = _.filter(items, item => _.isEqual(_.get(item, 'transaction.type'), PAYMENT_TYPE.OUTVOICE_TIP)).length;
    const textTask = `${taskCounter} ${taskCounter > 1 ? 'Tasks' : 'Task'}`;
    const tipTask = `${tipCounter} ${tipCounter > 1 ? 'Tips' : 'Tip'}`;
    const total = _.sumBy(items, function(item) {
      if(_.get(item, 'transaction.outgoing')) {
        return ((-1) * _.get(item, 'transaction.amount', 0));
      } else {
        return _.get(item, 'transaction.amount', 0);
      }
    }).toFixed(2);

    return <AxlPanel.Row style={{...styles.Row_1, ...styles.Row_2}}>
      <AxlPanel.Col>
        <E.Label>{`DETAIL`}</E.Label>
        <E.Text_2>{`${textTask} + ${tipTask}`}</E.Text_2>
      </AxlPanel.Col>
      <AxlPanel.Col>
        <E.Label>{`AMOUNT`}</E.Label>
        <E.AmountText>{`$${total}`}</E.AmountText>
      </AxlPanel.Col>
      {/*<AxlPanel.Col style={{padding: '0 15px'}}>*/}
      {/*  <E.Label>{`STATUS`}</E.Label>*/}
      {/*  <E.Text_1 className={`break`}>N/A</E.Text_1>*/}
      {/*</AxlPanel.Col>*/}
      <AxlPanel.Col flex={0}></AxlPanel.Col>
    </AxlPanel.Row>
  }

  render() {
    const { items, loading } = this.state;

    return <E.Container>
      { loading && <AxlLoading color={`#CCC`} thin={1} size={80} style={styles.loadingStyle} /> }
      <E.DueItems>
        <E.DueItem>
          <AxlPanel>
            {this.renderTransactions(items)}
            <E.PaymentDueDetailContainer>
              <E.Text_7>{`Detailed List:`}</E.Text_7>
              {items.length > 0 ? items.map((item, index) => <div key={index}>
                {this.renderTransactionDetail(item)}
              </div>) : <div>No one</div>}
            </E.PaymentDueDetailContainer>
          </AxlPanel>
        </E.DueItem>
      </E.DueItems>
    </E.Container>
  }
}

export default { Active, Pending, Past, Activity, Payment }
