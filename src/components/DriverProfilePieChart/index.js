import React from 'react';
import c3 from 'c3';
import * as d3 from "d3";
import _ from 'lodash';

import styles, * as E from './styles';

export default class DriverProfilePieChart extends React.Component {
  constructor(props) {
    super(props);
    this.renderChart = this.renderChart.bind(this);
  }

  componentDidMount() {
    this.renderChart(this.props.statistic);
  }

  componentWillReceiveProps(nextProps) {
    if(!_.isEqual(this.props.statistic, nextProps.statistic)) {
      this.renderChart(nextProps.statistic);
    }
  }

  renderChart(statistic) {
    const that = this;
    const successful = statistic.shipment_successful_count ? Math.round((statistic.shipment_successful_count / statistic.total_shipments) * 100) : 0;
    const early = statistic.shipment_early_count ? Math.round((statistic.shipment_early_count / statistic.total_shipments) * 100) : 0;
    const late = statistic.shipment_late_count ? Math.round((statistic.shipment_late_count / statistic.total_shipments) * 100) : 0;
    const fail = statistic.shipment_failed_count ? Math.round((statistic.shipment_failed_count / statistic.total_shipments) * 100) : 0;
    const data = (successful || early || late || fail) && [
      ['successful', successful],
      ['early', early],
      ['late', late],
      ['failed', fail]
    ] || [];

    if(!that.chart) {
      that.chart = c3.generate({
        bindto: '#chart',
        size: {
          width: 160,
          height: 160
        },
        data: {
          labels: true,
          x: undefined,
          order: null,
          type : 'pie',
          columns: data,
          colors: {
            successful: '#4abc4e',
            early: '#a1c5ef',
            late: '#9013fe',
            failed: '#d63031'
          },
          names: {
            successful: 'Successful',
            early: 'Early',
            late: 'Late',
            failed: 'Failed'
          },
          empty: {
            label: {
              text: "No Data"
            }
          }
        },
        pie: {
          label: {
            format: function (value, ratio, id) {
              return value + '%';
            }
          }
        },
        legend: {
          show: false
        }
      });

      const Legends = d3.select('.container')
        .insert('div', '.chart')
        .attr('class', 'legend')
        .style('flex', '1')
        .selectAll('span')
        .data(['successful', 'early', 'late', 'failed'])
        .enter()
        .append('div')
          .attr('data-id', function (id) { return id; })
          .style('display', 'flex')
          .style('margin-bottom', '5px')
          .style('justify-content', 'flex-end')
          .style('align-items', 'center')

      Legends.append('span')
        .html(function (id) {
          return that.chart.data.values(id) ? that.chart.data.values(id)[0] + `%` : '0%';
        })
        .each(function (id) {
          d3.select(this)
            .style('color', that.chart.color(id))
            .style('font-size', '22px')
            .style('font-family', 'AvenirNext-DemiBold')
            .style('text-align', 'right')
            .style('margin-right', '10px')
        })

      Legends.append('span')
      .attr('class', 'text')
      .style('display', 'inline-block')
      .style('width', '80px')
      .style('text-align', 'left')
      .style('color', '#848484')
      .style('font-size', '14px')
      .style('text-transform', 'capitalize')
      .html(function (id) {
        return id;
      })

      Legends.on('mouseover', function (id) {
        that.chart.focus(id);
      })
      .on('mouseout', function (id) {
        that.chart.revert();
      })
      .on('click', function (id) {
        that.chart.toggle(id);
      });
    } else {
      d3.select('.legend').remove();
      that.chart.load({
        columns: data
      })
      const Legends = d3.select('.container')
        .insert('div', '.chart')
        .attr('class', 'legend')
        .style('flex', '1')
        .selectAll('span')
        .data(['successful', 'early', 'late', 'failed'])
        .enter()
        .append('div')
          .attr('data-id', function (id) { return id; })
          .style('display', 'flex')
          .style('margin-bottom', '5px')
          .style('justify-content', 'flex-end')
          .style('align-items', 'center')

      Legends.append('span')
        .html(function (id) {
          return that.chart.data.values(id) ? that.chart.data.values(id)[0] + `%` : '0%';
        })
        .each(function (id) {
          d3.select(this)
            .style('color', that.chart.color(id))
            .style('font-size', '22px')
            .style('font-family', 'AvenirNext-DemiBold')
            .style('text-align', 'right')
            .style('margin-right', '10px')
        })

      Legends.append('span')
      .attr('class', 'text')
      .style('display', 'inline-block')
      .style('width', '80px')
      .style('text-align', 'left')
      .style('color', '#848484')
      .style('font-size', '14px')
      .style('text-transform', 'capitalize')
      .html(function (id) {
        return id;
      })

      Legends.on('mouseover', function (id) {
        that.chart.focus(id);
      })
      .on('mouseout', function (id) {
        that.chart.revert();
      })
      .on('click', function (id) {
        that.chart.toggle(id);
      });
    }
  }

  render() {
    return <E.Container className={`container`}>
      <E.PieChart id="chart" />
    </E.Container>
  }
}
