import React, { Component, } from 'react';
import _ from 'lodash'

export default class BarChart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      total: 1,
      gap: 10
    }
  }

  componentWillReceiveProps(props) {
    let total = props.data ? _.reduce(props.data.map(d => d.value), (a,b) => a+b) : 1
    if (total < 1)
      total = 1
    let gap = props.data && props.data.length > 0 ? (100 / props.data.length) : 10
    this.setState({total, gap})
  }

  render() {
    return <div style={{height: this.props.height, position: 'relative'}}>
      <div style={{position: 'absolute', top: '20px', bottom: '20px', left: 0, right: 0, borderBottom: 'solid 1px #e4e4e4'}}>
      { this.props.data && this.props.data.map((d, i) => <div key={i} style={{ position: 'absolute', bottom: 0, top: 0, width: this.state.gap + '%', left: (this.state.gap * i) + '%'  }}>
        <div style={{ position: 'absolute', left: '50%', marginLeft: (-this.props.width / 2) + 'px', bottom: 0, width: this.props.width + 'px', height: (100 * d.value / this.state.total) + '%', backgroundColor: d.color }}></div>
        <div style={{ position: 'absolute', bottom: (100 * d.value / this.state.total) + '%', textAlign: 'center', left: '-10px', right: '-10px', fontSize: '12px' }}>{d.value}</div>
        <div style={{ position: 'absolute', bottom: '-20px', textAlign: 'center', left: '-10px', right: '-10px', fontSize: '10px' }}>{d.title}</div>
      </div>) }
      </div>
    </div>
  }
}
