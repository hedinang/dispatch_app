import React,{Component} from 'react';
import c3 from 'c3';
import BarChart from '../AssignmentChart/BarChart';
import styles from './styles';

class AssignmentSpecificChart extends Component{
  constructor(props) {
    super(props)
    this.state = {
      otd_stats: [],
      totalCompleted:0
    }
  }

  componentDidMount(){
    this.renderChart(this.props)
  }

  componentWillReceiveProps(props){
    this.renderChart(props)
  }

  renderChart(props){
    const { stats = {} } = props
    const { unassigned = 0, pending = 0, inprogress = 0, early = 0, late = 0, failed = 0, succeeded = 0 } = stats


    if (!this.chart)
    this.chart = c3.generate({
      bindto: "#chart-2",
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
      ],
      totalCompleted: succeeded + failed
    })
  }

  render(){
    return(
      <div style={styles.container}>
        <div>
          <div style={styles.totalText}>TOTAL SHIPMENTS</div>
          <div style={styles.totalShipment}>{this.props.selected.assignment.shipment_count}</div>
          <div id="chart-2" style={styles.circleChart}/>
        </div>
        <div style={{width:'160px'}}>
          <div style={styles.totalText}>TOTAL COMPLETED</div>
          <div style={styles.totalCompleted}>{this.state.totalCompleted}</div>
          <BarChart height='160px' width={30} data = {this.state.otd_stats} />
        </div>
      </div>
    )
  }
}

export default AssignmentSpecificChart
