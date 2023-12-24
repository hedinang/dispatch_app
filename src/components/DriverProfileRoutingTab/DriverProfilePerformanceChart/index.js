import React, { Component, } from 'react';
import c3 from 'c3';
import Moment from 'react-moment';
import BarChart from './BarChart';
import _ from 'lodash';
import { AxlButton } from 'axl-reactjs-ui';
import PropTypes from 'prop-types';

// Styles
import styles, { Statuses } from './styles';

export default class DriverProfilePerformanceChart extends Component {

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
        value: early > 0 ? early : 0,
        title: 'Early',
        color: '#a5ccec'
      },{
        value: succeeded - early - late > 0 ? succeeded - early - late : 0,
        title: 'On Time',
        color: '#66b752'
      },{
        value: late > 0 ? late : 0,
        title: 'Late',
        color: '#8447f6'
      },{
        value: failed > 0 ? failed : 0,
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
      <div style={{...{display: !isCloseCharts ? 'block' : 'none'}}}>
        <div style={{...styles.panelContainer, ...{display: isOpenAssignmentDetail ? 'none' : 'flex'}}}>
          <div style={!this.props.disabledBarChart ? {...styles.pane} : {...styles.pane, width: 'auto'}}>
            <div style={styles.info}>total shipments<br /><span style={styles.shipmentTotal}>{this.props.stats.total}</span></div>
            <div ref={element => this.refChart = element} style={styles.chart} />
          </div>
          {!this.props.disabledBarChart && <div style={styles.pane}>
            <div style={styles.info}>total completed<br /><span style={styles.shipmentTotal}>{this.props.stats.succeeded + this.props.stats.failed}</span></div>
            <BarChart height='160px' width={30} data = {this.state.otd_stats} />
          </div>}
        </div>
      </div>
    </div>
  }
}

DriverProfilePerformanceChart.propsType = {
  disabledBarChart: PropTypes.bool,
}

DriverProfilePerformanceChart.defaultProps = {
  disabledBarChart: false,
}
