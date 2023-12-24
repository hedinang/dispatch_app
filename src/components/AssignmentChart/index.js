import React, { Component, } from 'react';
import c3 from 'c3';
import Moment from 'react-moment';
import BarChart from './BarChart';
import _ from 'lodash';
import { AxlButton } from 'axl-reactjs-ui';

// Styles
import styles, { Statuses } from './styles';

export default class AssignmentChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      otd_stats: [],
      isCloseCharts: false,
      isOpenAssignmentDetail: false
    }
    this.refChart = React.createRef();
  }
  renderChart(stats) {
    window.logger.debug('renderChart')
    const { unassigned = 0, pending = 0, inprogress = 0, failed = 0, succeeded = 0 } = stats
    if (!this.chart)
    this.chart = c3.generate({
      transition: {
        duration: 0
      },
      bindto: this.refChart,
      size: {
        width: 160,
        height: 200
      },
      data: {
        labels: true,
        x: undefined,
        order: null,
        columns: [
          ['unassigned', unassigned],
          ['pending', pending],
          ['in_progress', inprogress],
          ['failed', failed],
          ['succeeded', succeeded]
        ],
        type: 'donut',
        colors: {
          unassigned: '#bebfc0',
          pending: '#fa6725',
          in_progress: '#fbc04f',
          succeeded: '#66b752',
          failed: '#d63031',
        },
        names: {
          unassigned: 'Unassigned',
          pending: 'Pending',
          in_progress: 'In Progress',
          succeeded: 'Succeeded',
          failed: 'Failed',
        }
      },
      tooltip: {
        grouped: false,
        format: {
          value: (value, ratio, id, index) => `${(ratio * 100).toFixed(1)}% [${value}]`
        }
      },
      donut: {
        label: {
          show: false
        }
      },
      legend: {
          // amount of padding to put between each legend element
          padding: 5,
          item: {
              tile: {
                width: 10,
                height: 10
              }
          }
      }
    });
    else {
      this.chart.load({columns:[
        ['unassigned', unassigned],
        ['pending', pending],
        ['in_progress', inprogress],
        ['succeeded', succeeded],
        ['failed', failed],
      ]})
    }
  }

  componentWillReceiveProps(props) {
    if (_.isEqual(props.stats, this.props.stats)) {
      window.logger.debug('Ignore Identical Stats!')
      return
    }
    const { stats = {} } = props
    const { unassigned = 0, pending = 0, inprogress = 0, early = 0, late = 0, failed = 0, succeeded = 0 } = stats
    this.setState({
      otd_stats: [{
        value: early,
        title: 'Early',
        color: '#a5ccec'
      },{
        value: succeeded - early - late,
        title: 'On Time',
        color: '#66b752'
      },{
        value: late,
        title: 'Late',
        color: '#8447f6'
      },{
        value: failed,
        title: 'Failed',
        color: '#d63031'
      }
      ]
    })
    this.renderChart(stats)
  }

  componentDidMount () {
    const { stats = {} } = this.props
    this.renderChart(stats);
  }

  toggleAssignmentDetail = () => {
    const { stats = {} } = this.props
    this.setState({isOpenAssignmentDetail: !this.state.isOpenAssignmentDetail})
  }

  onToggleChart = () => {
    this.props.onCollapse && this.props.onCollapse();
    this.setState({isCloseCharts: !this.state.isCloseCharts})
  }

  render() {
    const { isOpenAssignmentDetail, isCloseCharts } = this.state;
    const dateTitleStyle = !isCloseCharts ? styles.dateTitleOpen : styles.dateTitleClose;

    return <div style={styles.container}>
      <div style={styles.title}>
        {!isCloseCharts && <AxlButton tiny bg={`${isOpenAssignmentDetail ? 'none' : 'gray'}`}
          style={styles.toggleButton}
          ico={{className: 'fa fa-info', style: {fontSize: '20px'}}}
          onClick={this.toggleAssignmentDetail} />}
        <div style={{...styles.innerTitle, ...{textAlign: !isCloseCharts ? 'center' : 'left'}}}>
          {`Shipment Breakdown`}
          {this.props.date && <span style={{...styles.dateTitle, ...{display: !isCloseCharts ? 'block' : 'inline-block'}}}>(<Moment format={'ddd MMMM DD'}>{this.props.date}</Moment>)</span>}
        </div>
        <div onClick={this.onToggleChart} style={styles.toggleChartLink}>{!isCloseCharts ? `Hide chart` : `Show chart`}</div>
      </div>
      <div style={{...{display: !isCloseCharts ? 'block' : 'none'}}}>
        <div style={{...styles.panelContainer, ...{display: isOpenAssignmentDetail ? 'flex' : 'none'}}}>
          <div style={styles.innerPanelContainer}>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['default']}}}>TOTAL SHIPMENTS:</label>{this.props.stats.total}</div>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['default']}}}>TOTAL COMPLETED:</label>{this.props.stats.succeeded + this.props.stats.failed}</div>
            <br />
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['early']}}}>{`EARLY:`}</label>{this.props.stats.early}</div>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['failed']}}}>{`FAILED:`}</label>{this.props.stats.failed}</div>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['in_progress']}}}>{`INPROGRESS:`}</label>{this.props.stats.inprogress}</div>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['late']}}}>{`LATE:`}</label>{this.props.stats.late}</div>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['pending']}}}>{`PENDING:`}</label>{this.props.stats.pending}</div>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['succeeded']}}}>{`SUCCESSED:`}</label>{this.props.stats.succeeded}</div>
            <div style={styles.rowTitle}><label style={{...styles.rowLabel, ...{color: Statuses['unassigned']}}}>{`UNASSIGNED:`}</label>{this.props.stats.unassigned}</div>
          </div>
        </div>
        <div style={{...styles.panelContainer, ...{display: isOpenAssignmentDetail ? 'none' : 'flex'}}}>
          <div style={styles.pane}>
            <div style={styles.info}>total shipments<br /><span style={styles.shipmentTotal}>{this.props.stats.total}</span></div>
            <div ref={element => this.refChart = element} style={styles.chart} />
          </div>
          <div style={styles.pane}>
            <div style={styles.info}>total completed<br /><span style={styles.shipmentTotal}>{this.props.stats.succeeded + this.props.stats.failed}</span></div>
            <BarChart height='160px' width={30} data = {this.state.otd_stats} />
          </div>
        </div>
      </div>
    </div>
  }
}
