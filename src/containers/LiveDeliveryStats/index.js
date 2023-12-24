import React, { Component, Fragment } from 'react';
import { Styles, AxlButton, AxlTable, AxlSearchBox, AxlModal } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import styles, {Statuses} from './styles';
import c3 from 'c3';
import Moment from 'react-moment'
import _ from 'lodash'


class ClientProjection extends Component {
  render() {
    const { projection } = this.props
    return <div key={projection.client.id} style={{marginLeft: 3, marginTop: 3, margintRight: 3, display: 'inline-block'}}>
    <div style={{fontWeight: 'bold', fontSize: '13px', marginBottom: '3px'}}>{ projection.count}</div>
    <div style={{width:36, height: 50, borderRadius: 3, border: 'solid 1px #eee', backgroundColor: 'white', overflow: 'hidden'}}>
      <img src={projection.client.logo_url} style={{height: '32px'}} title={projection.client.company} />
      <div style={{height: 14, overflow: 'hidden', fontSize: '10px', color: '#444'}}>
        {projection.client.company}
      </div>
    </div>
  </div>
  }
}

class FutureProjection extends Component {
  render() {
    const { projections, date } = this.props
    const total = !projections || projections.length < 1 ? 0 : _.sum(projections.map(p => p.count))
    const count = projections ? projections.length : 0
    return <div style={{backgroundColor: '#f8f8f8', paddingTop: '1px', borderRadius: '4px', marginBottom: 4, marginTop: 8}}>
      <div style={{height: 90, position: 'relative'}}>
        <div style={{position: 'absolute', top: 4, left: 4, bottom: 4, width: 50, fontSize: 14, border: 'solid 1px #f0f0f0', padding: '6px 8px', borderRadius: 7, backgroundColor:'#fefefe'}}>
          <div style={{fontWeight: 'bold', fontSize: 12}}><Moment format={'ddd'}>{date}</Moment></div>
          <div style={{fontSize: 13, color: '#888'}}><Moment format={'MMM DD'}>{date}</Moment></div>
          <div style={{fontSize: 16, fontWeight: 'bold', display: 'inline-block', marginTop: 8}}>{total}</div>
        </div>
        <div style={{position: 'absolute', top: 0, left: 80, bottom: 0, right: 0, overflow: 'auto'}}>
          <div style={{height: 70, width: 42 * count}}>
            { projections && projections.map(projection => <ClientProjection key={`client-projection-${projection.client.id}`} projection={projection} />) }
          </div>
        </div>
      </div>
    </div>
  }
}

// Components
@inject('statsStore', 'clientStore')
@observer
class LiveDeliveryStats extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      stats: [],
    }
    this.refresh = this.refresh.bind(this)
    this.renderChart = this.renderChart.bind(this)
    this.gotoDispatch = this.gotoDispatch.bind(this)
    this.onClickFailed = this.onClickFailed.bind(this)
    this.gotoInboundStatus = this.gotoInboundStatus.bind(this)
    this.loadProjections = this.loadProjections.bind(this)
  }

  componentDidMount() {
    this.refresh()
    this.loadProjections()
    this.timer = setInterval(this.refresh, 60000)
    this.timerProjections = setInterval(this.loadProjections, 600000)
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.timerProjections) {
      clearInterval(this.timerProjections)
    }
  }

  gotoDispatch() {
    const { history,region, client } = this.props
    history.push(`/routes/today/${region}/${client}`)
  }

  onClickFailed(id, name, value) {
    // console.log(id, name, value)
    if (id === 'lost') {
      this.gotoLost()
    } else if (id === 'dropoff_failed') {
      this.gotoDropoffFailed()
    } else if (id === 'missing') {
      this.gotoInboundStatus('MISSING')
    } else if (id === 'damaged') {
      this.gotoInboundStatus('RECEIVED_DAMAGED')
    }
  }

  gotoLost() {
    const { history,region, client } = this.props
    const url = `search?q=inbound_status:RECEIVED_OK%20status:PICKUP_FAILED&time=today&regions=${region}&clients=${client}`
    history.push(url)
  }
  gotoDropoffFailed() {
    const { history,region,client } = this.props
    const url = `search?q=status:DROPOFF_FAILED&time=today&regions=${region}&clients=${client}`
    history.push(url)
  }
  gotoInboundStatus(s) {
    const { history,region,client } = this.props
    const url = `search?q=inbound_status:${s}&time=today&regions=${region}&clients=${client}`
    history.push(url)
  }


  refresh() {
    const { region, statsStore, client, clientIds } = this.props;
    // const params = client == 0 ? clientIds : [client];
    const params = {
      client_types: ["COMMINGLE"]
    };

    if (!params || params.length === 0) return;

    this.setState({ loading: true });
    statsStore.getStats(region, params).then((r) => {
      this.setState({stats: r.data})
      this.renderChart(r.data)
      if (r.data && r.data.length > 0) {
        this.setState({
          total: r.data[r.data.length - 1]['total'],
          failed: r.data[r.data.length - 1]['failed']
        })
      }
    })
  }

  loadProjections() {
    const { region, statsStore, client, clientIds } = this.props;
    // const params = client == 0 ? clientIds : [client];
    const params = {
      client_types: ["COMMINGLE"]
    };

    if (!params || params.length === 0) return;

    statsStore.getProjection(region, params, moment().add(1, 'days').format('YYYY-MM-DD')).then((r) => {
        this.setState({
          projections: r,
          date: moment().add(1, 'days')
        })
    })
    statsStore.getProjection(region, params, moment().add(2, 'days').format('YYYY-MM-DD')).then((r) => {
        this.setState({
          projections2: r,
          date2: moment().add(2, 'days')
        })
    })
  }

  renderChart(stats) {
    if (!stats || stats.length < 1) return
    const { region } = this.props
    const early_list = stats.map(s => s['early'] || 0)
    const late_list = stats.map(s => s['late'] || 0)
    const ontime_list = stats.map(s => s['on-time'] || 0)
    const failed_list = stats.map(s => s['failed'] || 0)
    const total_list = stats.map(s => s['total'])
    const ts = stats.map(s => 1000*s['ts'])
    const data = [
      ['ts', ...ts],
      ['early', ...early_list],
      ['ontime', ...ontime_list],
      ['late', ...late_list],
      ['failed', ...failed_list],
      ['total', ...total_list]
    ]

    if (!this.chart)
    this.chart = c3.generate({
      transition: {
        duration: 0
      },
      bindto: "#chart-region-" + region,
      size: {
        width: 400,
        height: 160
      },
      data: {
        labels: false,
        order: null,
        columns: data,
        x: 'ts',
        types: {
          early: 'area',
          ontime: 'area',
          late: 'area',
          failed: 'area',
            // 'line', 'spline', 'step', 'area', 'area-step' are also available to stack
        },
        groups: [['early', 'ontime', 'late', 'failed']],
        colors: {
          early: Statuses['early'],
          pending: Statuses['pending'],
          late: Statuses['late'],
          ontime: Statuses['succeeded'],
          failed: Statuses['failed'],
          total: '#888'
        },
        names: {
          early: 'Early',
          ontime: 'On Time',
          late: 'Late',
          failed: 'Failed',
          total: 'Total'
        }
      },
      point: {
        show: false
      },
      legend: {
        show: false
      },
      bar: {
        width: {
          ratio: 1
        }
      },
      axis: {
          x: {
              type: 'timeseries',
              tick: {
                  format: '%m-%d %H:%M',
                  count: 4,
                  fit: false
              }
          },
          y: {
            show: false
          }
      }
    });
    else {
      this.chart.load({columns:data})
    }

    const latest = stats[stats.length - 1]
    const { early = 0, late = 0, missing = 0, lost = 0, damaged = 0, outbound_failed = 0, failed = 0, total = 0, succeeded = 0 } = latest
    const ontime = latest['on-time']
    const in_progress = total - succeeded - failed

    // TOTAL PIE CHART
    const pie_data = [
      ['early', early],
      ['ontime', ontime],
      ['late', late],
      ['failed', failed],
      ['in_progress', in_progress],
    ]

    if (!this.piechart)
    this.piechart = c3.generate({
      bindto: "#pie-chart-" + region,
      size: {
        width: 220,
        height: 240
      },
      data: {
        labels: true,
        x: undefined,
        order: null,
        columns: pie_data,
        type: 'donut',
        colors: {
          early: Statuses['early'],
          pending: Statuses['pending'],
          late: Statuses['late'],
          ontime: Statuses['succeeded'],
          failed: Statuses['failed'],
          lost: Statuses['lost'],
          missing: Statuses['missing'],
          damaged: Statuses['damaged'],
          total: '#222',
          in_progress: '#ddd'
        },
        names: {
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
          },
      }
    });
    else {
      this.piechart.load({columns: pie_data})
    }

    // FAILED PIE chart
    const failed_data = [
      ['missing', missing],
      ['damaged', damaged],
      ['lost', lost],
      ['dropoff_failed', outbound_failed]
    ]

    if (!this.failedpiechart)
    this.failedpiechart = c3.generate({
      bindto: "#failed-pie-chart-" + region,
      size: {
        width: 160,
        height: 240
      },
      axis: {
        y: {
          show: false
        },
        x: {
          show: true,
          type: 'category',
          tick: {
            count: 0,
            format: (x) => ''
          }
        }
      },
      data: {
        labels: true,
        x: undefined,
        order: null,
        columns: failed_data,
        type: 'bar',
        colors: {
          missing: Statuses['missing'],
          damaged: Statuses['damaged'],
          lost: Statuses['lost'],
          dropoff_failed: Statuses['failed'],
        },
        names: {
        },
        onclick: ({id, name, value}) => this.onClickFailed(id, name, value),
      },
      donut: {
        label: {
          show: false
        }
      },
      bar: {
        width: {
          ratio: 0.8
        },
        space: 0.1
      },
      legend: {
          // amount of padding to put between each legend element
          padding: 5,
          item: {
              tile: {
                width: 10,
                height: 10
              }
          },
      }
    });
    else {
      this.failedpiechart.load({columns: failed_data})
    }
  }

  render() {
    const { region } = this.props

    return <div style={styles.container}>
      <div style={{minHeight: '460px'}}>
      <div style={styles.header} onClick={this.gotoDispatch}>{region}</div>
      <div style={{display: 'flex'}}>
        <div style={{flex: 1}}>
          <div>TOTAL: {this.state.total}</div>
          <div id={`pie-chart-${region}`} style={styles.chart} />
        </div>
        <div style={{flex: 1}}>
          <div>FAILED: {this.state.failed}</div>
          <div id={`failed-pie-chart-${region}`} style={styles.chart} />
        </div>
      </div>

      <div id={`chart-region-${region}`} style={styles.chart} />
      </div>

      <FutureProjection key={`future-projection-${region}`} date={this.state.date} projections={this.state.projections } />
      <FutureProjection key={`future-projection-2-${region}`} date={this.state.date2} projections={this.state.projections2 } />
    </div>
  }
}

export default LiveDeliveryStats
