import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import _ from 'lodash';
import {AxlTable, AxlPagination, AxlButton, AxlSimpleDropDown, AxlTextArea, AxlModal} from 'axl-reactjs-ui';
import styles from "./styles";
import * as S from './styles';
import moment from 'moment-timezone';
import zendeskIcon from '../../assets/images/svg/zendesk.svg';

@inject('abandonedListStore')
@observer
class AbandondedList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openTicket: null,
      openZendeskTickets: false,
    }
  }

  onSelectPage = (page) => {
    const {abandonedListStore} = this.props;
    abandonedListStore.filter.page_number = page;
    abandonedListStore.search();
  };

  openTicket = (id) => {
    if(!this.state.openTicket) {
      this.setState({openTicket: id});
    } else {
      this.setState({openTicket: null});
    }
  }

  closeModal = () => {
    this.setState({openTicket: null})
  }

  checkZendeskTicket = (id) => {
    if(this.state.openZendeskTickets) {
      this.setState({openZendeskTickets: null});
    } else {
      this.setState({openZendeskTickets: id});
    }
  }

  replacePrefixChar(value) {
    const newReg = new RegExp(/[AN_||AP_||AS_||BS_||CL_||CR_||DR_||DS_||EV_||SC_||SH_||ST_||US_||WO_||TB_||TK_||TP_||CS_||CC_||ZT_]/, 'ig');

    return value.replace(newReg, "");
  }

  reload = () => {
    const {abandonedListStore} = this.props;
    abandonedListStore.search();
    this.closeModal();
  }

  _renderer = (abandoneds = [], style = {}) => {
    const {openZendeskTickets, openTicket} = this.state;
    const {abandonedListStore} = this.props;
    const {ticketCreating, checkingZendeskTicket, tickets} = abandonedListStore;
    const initialEmptySizeTable = Math.round((window.innerHeight - 101)/ 50);

    return abandoneds.length ? abandoneds.map(item => <AxlTable.Row key={item.id}>
      <AxlTable.Cell style={{...styles.highlightCell, ...style}}>
        <div style={{width: 100,textAlign: 'left'}}>{item.id}</div>
      </AxlTable.Cell>
      <AxlTable.Cell style={{...styles.highlightCell, ...style}}>{item.external_id}</AxlTable.Cell>
      <AxlTable.Cell style={{...styles.highlightCell, ...style}}>{item.call_from}</AxlTable.Cell>
      <AxlTable.Cell style={{...styles.highlightCell, ...style}}>{item.call_to}</AxlTable.Cell>
      <AxlTable.Cell style={{...styles.highlightCell, ...style}}>{item.call_args}</AxlTable.Cell>
      <AxlTable.Cell style={style}>{item.call_agent_id}</AxlTable.Cell>
      <AxlTable.Cell style={style}>{moment(item.start_ts).format('MM/DD/YYYY hh:MMA')}</AxlTable.Cell>
      <AxlTable.Cell style={style}>{item.status}</AxlTable.Cell>
      <AxlTable.Cell style={style}>{item.notes}</AxlTable.Cell>
      <AxlTable.Cell style={style}>
        <S.ZButton>
          {!item.support_tickets.length ?
            <AxlButton tiny loading={false} style={{margin: 5}} onClick={() => this.openTicket(item.id)}>{`Create ticket`}</AxlButton> :
            <AxlButton tiny bg={`pink`} onClick={() => this.checkZendeskTicket(item.id)} style={{margin: 5}}>{`View tickets`}</AxlButton>}
        {(openZendeskTickets === item.id) && <S.Dropdown>
            {!!item.support_tickets.length && item.support_tickets.map((ticket, index) =>
              <S.Item key={index} href={`https://axlehire.zendesk.com/agent/tickets/${this.replacePrefixChar(ticket.external_ref.uid)}`} target={`_blank`}>{ticket.external_ref.uid}</S.Item>)}
          </S.Dropdown>}
          {(openTicket === item.id) && <AxlModal onClose={this.closeModal}>
            <TicketForm item={item} onDo={this.reload} onClose={this.closeModal}/>
          </AxlModal>}
        </S.ZButton>
      </AxlTable.Cell>
    </AxlTable.Row>) : Array.from(Array(initialEmptySizeTable), (rowItem, rowIndex) => <AxlTable.Row key={rowIndex}>
      {Array.from(Array(10), (colItem, colIndex) => <AxlTable.Cell key={colIndex} style={{...styles.highlightCell, ...style}}>{`-`}</AxlTable.Cell>)}
    </AxlTable.Row>)
  }

  componentDidMount() {
    const {abandonedListStore} = this.props;
    abandonedListStore.search();
  }

  render() {
    const {abandonedListStore} = this.props;
    const {abandoneds, filter} = abandonedListStore;
    const pageTotal = Math.round(abandoneds.count/filter.page_size);

    return(<div>
      <AxlTable>
        <AxlTable.Header>
          <AxlTable.Row>
            <AxlTable.HeaderCell style={{...styles.highlightCell, ...styles.cellHeader}}>{`ID`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={{...styles.highlightCell, ...styles.cellHeader}}>{`External Id`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={{...styles.highlightCell, ...styles.cellHeader}}>{`Call from`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={{...styles.highlightCell, ...styles.cellHeader}}>{`Call to`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={{...styles.highlightCell, ...styles.cellHeader}}>{`Call argument`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={styles.cellHeader}>{`Call agent Id`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={styles.cellHeader}>{`Start`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={styles.cellHeader}>{`Status`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={styles.cellHeader}>{`Notes`}</AxlTable.HeaderCell>
            <AxlTable.HeaderCell style={styles.cellHeader}>{`Actions`}</AxlTable.HeaderCell>
          </AxlTable.Row>
        </AxlTable.Header>
        <AxlTable.Body>
          {this._renderer(abandoneds.items, {})}
        </AxlTable.Body>
      </AxlTable>
      {abandoneds && pageTotal > 1 && <div style={{textAlign: 'center'}}>
        <AxlPagination onSelect = {this.onSelectPage} current={filter.page_number} total={pageTotal}></AxlPagination>
      </div>}
    </div>);
  }
}

export {AbandondedList}

@inject('abandonedListStore')
@observer
class TicketForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      creating: false
    }
  }

  onChange = (e) => {
    this.setState({value: e.target.value})
  }

  createTicket = ({id, name, phone, msg}) => {
    const that = this;
    const {abandonedListStore, onDo, onClose} = this.props;
    that.setState({creating: true});
    abandonedListStore.ticketParams.subject = `Abandoned call from ${name || 'anonymous'} - (${phone})`;
    abandonedListStore.ticketParams.internal_ref.uid = `CC_${id}`;
    abandonedListStore.ticketParams.requester.name = name || phone;
    abandonedListStore.ticketParams.comment = msg;
    abandonedListStore.createTicket(res => {
      if(res.status === 200 || res.ok) {
        onDo();
      }
      that.setState({creating: false});
    });
    this.setState({openTicket: id});
  }

  render() {
    const {item} = this.props;

    return(<div style={{width: 450, maxWidth: '100%', padding: 20}}>
      <div style={{fontSize: 20, marginBottom: 15}}>{`Create ticket`}</div>
      <div style={{marginBottom: 15}}>
        <AxlTextArea value={ this.state.value } style={{width: '100%', height: '200px'}} onChange={this.onChange} placeholder={`Comment here....`} />
      </div>
      <div>
        <AxlButton tiny loading={this.state.creating} style={{margin: 5}} disabled={!this.state.value}
         onClick={() => this.createTicket({
          id: item.id,
          name: (item.attr && (item.attr.driver_first_name || item.attr.driver_middle_name || item.attr.driver_last_name)) ? [item.attr.driver_first_name, item.attr.driver_middle_name, item.attr.driver_last_name].join(" ") : null,
          phone: item.call_from,
          msg: this.state.value
        })}>{`Create ticket`}</AxlButton>
      </div>
    </div>);
  }
}