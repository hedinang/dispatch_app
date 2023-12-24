import React from 'react'
import _ from 'lodash';
import moment from "moment";
import DonutChart from '../../components/DonutChart';
import { Box } from '@material-ui/core';
import AxlPaperSection from '../../components/Paper/Section';
import AxlPaperRowMetrics from '../../components/AxlPaperRowMetrics';
import AxlPaperMetrics from '../../components/AxlPaperMetrics';

function DriverCycle({data}) {
    if(_.isEmpty(data)) return null;

    const {hours_worked_wtd, stats } = data;
    const fromDate = _.get(hours_worked_wtd, 'from') ? moment.utc(_.get(hours_worked_wtd, 'from')).format('MM/DD/YYYY') : '-';
    const toDate =  _.get(hours_worked_wtd, 'to') ? moment.utc(_.get(hours_worked_wtd, 'to')).format('MM/DD/YYYY') : '-';

    const _returned = _.get(stats, 'shipment_return_count', 0);
    const _pending = _.get(stats, 'shipment_pending_count', 0);
    const _inprogress = _.get(stats, 'shipment_inprogress_count', 0);
    const _total = _.get(stats, 'total_shipments', 0);
    const _failed = _.get(stats, 'shipment_failed_count', 0);
    const _succeeded = _.get(stats, 'shipment_successful_count', 0);
    const overviewData = {
      returned: _returned,
      pending: _pending,
      inprogress: _inprogress,
      failed: _failed,
      succeeded: _succeeded,
      total: _total,
    };

    const dataHoursWorked = [
        {
            title: 'Hours Worked', 
            value: _.get(hours_worked_wtd, 'formatted', 0)
        },
    ];

    const dataRoutes = [
        {
            title: 'Total Routes', 
            value: _.get(stats, 'total_routes', 0)
        }, 
        {
            title: 'Total Dropoffs', 
            value: _.get(stats, 'total_dropoffs', 0)
        }, 
        {
            title: 'Total Shipments', 
            value: _.get(stats, 'total_shipments', 0)
        }, 
        {
            title: <Box display={'flex'} flexDirection={'column'}><DonutChart stats={overviewData}/></Box>,
        }, 
    ]

    const dataTipping = [{
        title: 'Tipping', 
        value: `${_.get(stats, 'tip_count', 0)} Tips (${_.get(stats, 'tip_amount.formatted', '$0.00')})`
    }];

    const datas = [{data: dataHoursWorked, isDivider: true}, {data: dataRoutes, isDivider: true}, {data: dataTipping}];
    return (
        <AxlPaperMetrics title={'Cycle'} subTitle={`(${fromDate} - ${toDate})`}>
            {datas.map((item, idx) => (
                <AxlPaperSection divider={item.isDivider} key={idx}>
                    {item.data.map((item, idx2) => (
                        <AxlPaperRowMetrics title={item.title} value={item.value} key={idx2}/>
                    ))}
                </AxlPaperSection>
            ))}
        </AxlPaperMetrics>
    )
}

export default DriverCycle