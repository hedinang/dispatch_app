import React, { Component } from 'react';
import {AxlDateInput, AxlButton, AxlSimpleDropDown} from 'axl-reactjs-ui';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button} from "@material-ui/core";
import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import moment from 'moment';
import {withRouter} from 'react-router-dom';

// Utils
import exportCSVFile from '../../Utils/exportCSVFile';

// Styles
import { Container, GroupField, Label } from './styles';
import AxlMultiSelect from '../../components/MultiSelect';

@inject('assignmentStore', 'shipmentStore', 'clientStore', 'userStore', 'dspStore', 'regionStore')
@observer
class DispatchSearchFilter extends Component {
  constructor(props) {
      super(props);
      const { day, region, client, assignmentId } = this.props.match.params;
      const { assignmentStore } = this.props;
      if (day) {
          if (day === 'today') {
              assignmentStore.date = moment().format('YYYY-MM-DD')
          } else {
              assignmentStore.date = moment(day).format('YYYY-MM-DD')
          }
      }
      if (region && region !== 'all') {
          assignmentStore.regions = region.toUpperCase().split(',')
      }
      if (client && client !== 'all') {
          assignmentStore.clients = client.split(',').map(c => parseInt(c))
      }
      if (assignmentId) {
          assignmentStore.loadAssignment(parseInt(assignmentId))
      }
      this.prioritized = [49, 105, 67, 78, 68, 44, 94, 84, 64, 76, 66, 30, 88, 99, 93, 72];
      this.dashboardReportUrl = `${process.env.REACT_APP_DASHBOARD_URL}/report`;
  }

  componentDidMount() {
      const { clientStore, dspStore, regionStore } = this.props;
      clientStore.init();
      regionStore.init();
      dspStore.listAll();
      this.refreshURL(false, true);
  }

  refreshURL = (isRefresh, isAcceptWarehouse) => {
    const { assignmentStore, history} = this.props;
    const { date, regions, clients, warehouseIds} = assignmentStore;
    const day = date
    const region = regions && regions.length > 0 ? regions.join(',') : 'all'
    const client = clients && clients.length > 0 ? clients.join(',') : 'all';
    const search = this.props.location.search;
    const params = new URLSearchParams(search);
    const warehouse = warehouseIds[0] || params.get('warehouse');
    if(!isRefresh) {
      if(!warehouse) {
        assignmentStore.setWarehouses([])
      } else {
        assignmentStore.setWarehouses([+warehouse])
      }
      
      history.push(`${history.location.pathname}${warehouse ? '?warehouse='+warehouse : ""}`)
      return;
    }
    
    if(warehouse && isAcceptWarehouse) {
      if(warehouse !== assignmentStore.warehouseIds[0]) {
        assignmentStore.setWarehouses([+warehouse])
      }
      history.push(`/routes/${day}/${region}/${client}/?warehouse=${warehouse}`);
    }
    else {
      history.push(`/routes/${day}/${region}/${client}`)
    }
  }

  setDate = (d) => {
      const { assignmentStore, history } = this.props
      if(d) {
        assignmentStore.setDate(d)
        this.refreshURL(true, false)
      } else {
        history.push(`/routes`)
        assignmentStore.setDate(null)
      }
  }

  setRegions(regions) {
      const { assignmentStore } = this.props
      assignmentStore.setRegions(regions.map(r => r.value))
      this.refreshURL(true, false)
  }

  setClients(clients) {
      const { assignmentStore } = this.props
      assignmentStore.setClients(clients.map(r => r.value))
      this.refreshURL(true, false)
  }

  setWarehouses(warehouses) {
    const { assignmentStore} = this.props;
    if(warehouses && warehouses.length === 0) {
      assignmentStore.setWarehouses([]);
      this.refreshURL(true, false);
    }
    else {
      assignmentStore.setWarehouses(warehouses.map(r => r.value))
      this.refreshURL(true, true);
    }
  }

  downloadDriverAssignmentStats = async () => {
    const { assignmentStore } = this.props;
    const { headers, data } = await assignmentStore.getDriverAssignmentStats();
    exportCSVFile.CSVdownload(headers, data, `driver-assignment-stats`);
  }

  downloadDriverIds = () => {
    const { assignmentStore } = this.props
    const data = assignmentStore.getDriverIds()
    this.download('driver-ids.txt', data);
  }

  download = (filename, text) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

  downloadCSV = () => {
      const {userStore} = this.props
      const withFinance = userStore.isAddmin || userStore.isLeadDispatcher || userStore.isSuperAdmin;
      const { assignmentStore } = this.props;
      if (assignmentStore.pendingAssignments.length < 1 && assignmentStore.completedAssignments.length < 1 &&
          assignmentStore.inProgressAssignments.length < 1 && assignmentStore.unassignedAssignments.length < 1 )
        return false;

      const headers = {
        'id': 'Assignment ID',
        'assignment_sequence': 'Assignment Sequence',
        'assignment_category': 'Assignment Category',
        'shipment_count': 'Shipment Count',
        'tour_cost': 'Tour Cost',
        'bonus': 'Bonus',
      };

      const data = [
        ...assignmentStore.pendingAssignments, 
        ...assignmentStore.completedAssignments, 
        ...assignmentStore.inProgressAssignments,
        ...assignmentStore.unassignedAssignments,
        ...assignmentStore.pickingUpAssignments,
        ...assignmentStore.inactiveAssignments,
      ].map(a => ({
          'id': _.defaultTo(a.id, 0),
          'assignment_sequence': _.defaultTo(a.label.prefix ? a.label.prefix : a.label, ''),
          'assignment_category': _.defaultTo(a.assignment_category, 'N/A'),
          'shipment_count': _.defaultTo(a.shipment_count, 0),
          'tour_cost': _.defaultTo(a.tour_cost, 0),
          'bonus': _.defaultTo(a.bonus, 0),
      }))
      .sort((t1, t2) => t1.assignment_sequence.localeCompare(t2.assignment_sequence));

      const filteredData = withFinance ? data : data.map(a => {
        return {
          'id': a.id,
          'assignment_sequence': a.assignment_sequence,
          'assignment_category': a.assignment_category,
          'shipment_count': a.shipment_count,
        }
      })

      exportCSVFile.CSVdownload(headers, filteredData, `${assignmentStore.regions.join('_') || 'all'}-${assignmentStore.clients.map(c => c === 0 ? 'COMMINGLE' : c === 1 ? 'ON-DEMAND': c === -1 ? 'SPECIALITY' : c.toString()).join('_')}-${assignmentStore.date}-assignments`);
  }

  render() {
    const { assignmentStore, clientStore, regionStore } = this.props;
    const { regions, clients, warehouses, warehouseIds } = assignmentStore;
    let clientMap = {}
    clientStore.clients.forEach(c => {
      clientMap[c.client_id] = { label: c.name, value: c.client_id }
    })
    const regionList = regionStore.regions;
    const prioritized = this.prioritized.map(p => clientMap[p]).filter(Boolean)
    const normal = clientStore.clients.filter(c => this.prioritized.indexOf(c.client_id) < 0).filter(c => c.client_id > 7).map(c => Object.assign({}, { label: c.name, value: c.client_id }))
    const clientOptions = [{value: 0, label: 'COMMINGLE'}, {value: -1, label: 'ON-DEMAND'}, {value: -2, label: 'SPECIALITY'}].concat(prioritized).concat(normal);

    const downloadActions = [
      {title: 'Assignment', action: () => this.downloadCSV()},
      {title: 'Driver Delivery Report', action: () => this.downloadDriverAssignmentStats()},
      {title: 'Driver IDs', action: () => this.downloadDriverIds()},
    ]

    const warehouseFilters = !warehouses ? [] : warehouses.map(w => {
      return {
        value: w.id,
        label: `${w.alias || ''} [${w.address.city}]`
      };
    })

    return (
      <Container>
        <GroupField>
          <Label>{`Overview for `}</Label>
          <AxlDateInput
            arrow
            clear="true"
            onChange={(d) => this.setDate(d)}
            options={{
              // maxDate: 'today',
              defaultValue: moment(assignmentStore.date).unix()*1000,
              defaultDate: 'today',
              dateFormat: 'MMM DD, Y',
              placeHolder: 'today',
              enableTime: false,
              altInput: true,
              clickOpens: false,
              disableMobile: true
            }}
          />
        </GroupField>
        <GroupField>
          <Label>{`at`}</Label>
          <AxlMultiSelect
            defaulValue={regionList.filter(option => regions.indexOf(option.value) >= 0)}
            placeholderButtonLabel="all regions"
            showValues={false}
            allowAll={true}
            onChange={(v) => this.setRegions(v)}
            placeholder="Search Regions…"
            options={regionList}
            style={{minWidth: '205px'}}
          />
        </GroupField>
        { clientStore.clients && clientStore.clients.length > 0 &&
        <GroupField>
          <Label>{`for`}</Label>
          <AxlMultiSelect
            defaulValue={clientOptions.filter(option => clients.indexOf(option.value) >= 0)}
            placeholderButtonLabel="all clients"
            placeholder="Search Clients..."
            singular={true}
            allowAll={true}
            options={clientOptions}
            onChange={(v) => this.setClients(v)}
            multiple
          />
        </GroupField> }
        { warehouseFilters && warehouseFilters.length > 0 &&
        <GroupField>
          <Label>{`from`}</Label>
          <AxlMultiSelect
            defaulValue={warehouseFilters.filter(option => warehouseIds && warehouseIds.indexOf(option.value) >= 0)}
            placeholderButtonLabel="all warehouses"
            placeholder="Search By warehouse..."
            singular={true}
            allowAll={true}
            options={warehouseFilters}
            onChange={(v) => this.setWarehouses(v)}
            multiple
          />
        </GroupField> }
        <GroupField>
          <AxlSimpleDropDown anchor={'right'} style={{zIndex: 10000, width: '260px'}} items={downloadActions}>
            <i style={{fontSize: 22, color: '#828282', cursor: 'pointer'}} className={'fa fa-download'} />
          </AxlSimpleDropDown>
        </GroupField>
      </Container>
    )
  }
}

export default withRouter(DispatchSearchFilter)
