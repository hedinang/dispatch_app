import React, { Component, Fragment } from 'react';
import {inject, observer} from "mobx-react";
import { IconButton, Button, Typography } from '@material-ui/core';
import { MonetizationOn, Money, Refresh } from '@material-ui/icons';
import { AxlButton, AxlPanel, AxlModal, AxlPopConfirm } from 'axl-reactjs-ui';
import styles, * as E from './styles';
import Eta from './eta';
import moment from 'moment';
import Shift from './ww_shift'
import DeliveryPath from './lyft_path'
import CancelAssignmentPopup from '../CancelAssignmentPopup';
import LoadingDialog from '../LoadingDialog';

@inject('lyftStore')
@observer
export default class LyftInfo extends Component {
  constructor (props) {
    super(props)

    const { lyftStore, assignmentId, provider, scheduled } = this.props
    lyftStore.setAssignment(assignmentId, provider)
    this.quote = this.quote.bind(this)
    this.request = this.request.bind(this)
    this.cancel = this.cancel.bind(this)
    this.scheduledQuote = this.scheduledQuote.bind(this)
    this.showExternal = this.showExternal.bind(this)
    this.refreshExternal = this.refreshExternal.bind(this)
    this.setIsOpenCancelPopup = this.setIsOpenCancelPopup.bind(this)
    this.state = {
      provider,
      scheduling: false,
      showingExternal: false,
      isOpenCancelPopup: false
    }
  }
  componentDidMount(){
    const { lyftStore } = this.props    
    lyftStore.getCancellationReasons(this.state.provider);
  }

  quote() {
    const { lyftStore, scheduled } = this.props
    if (!scheduled){
      lyftStore.quote(this.state.provider)
    } else {
      this.setState({scheduling: true})
    }
  }

  showExternal() {
    const { lyftStore, scheduled } = this.props
    lyftStore.getExternalInfo()
    this.setState({showingExternal: true})
  }

  refreshExternal() {
    const { lyftStore, scheduled } = this.props
    lyftStore.refreshExternalInfo()
  }


  scheduledQuote(ts) {
    const { lyftStore, scheduled } = this.props
    this.setState({scheduling: false})
    lyftStore.quote(this.state.provider, ts * 1000)
  }

  request() {
    const { lyftStore, } = this.props
    lyftStore.request(this.state.provider)
  }

  setIsOpenCancelPopup(isOpen){    
     this.setState({isOpenCancelPopup: isOpen})    
  }

  cancel(reason,notes) {
    const { lyftStore,onRefreshAssignment } = this.props
    lyftStore.cancel(this.state.provider,reason,notes,onRefreshAssignment)
    this.setIsOpenCancelPopup(false)
  }

  setIsLoadingModalOpen( isOpen ){
    const { lyftStore } = this.props;
    lyftStore.setIsLoadingModalOpen(isOpen);
  }

  render() {
    const { lyftStore, status, assignment, labels,setDisableUnassignDsp } = this.props
    const { timezone, predicted_start_ts } = assignment || {}
    const { info, externalPath, refreshingPath, cancellationReasonList, error, pendingRequest, isLoadingModalOpen, requestType } = lyftStore
    const { intent, external_id, provider, quote, external_title, external_path_id, scheduled_at } = info || {}
    const { offer } = intent || {}
    const quoted = quote !== null && quote !== undefined
    const sealed = status === 'COMPLETED'
    setDisableUnassignDsp( external_id && !sealed);

    return <Fragment>
      <AxlPanel.Row>
          <AxlPanel.Col>
            <div>
              <span style={styles.label}>{`Quote:`}</span>
              <span style={styles.text}>
                { !external_id && quoted && <IconButton  size={'small'} onClick = {this.quote}><Refresh color="action" fontSize="small" /></IconButton> }
                { quoted && <span>$ {quote / 100} </span> }
                { !external_id && !quoted && <Button size={'small'} color="primary" onClick = {this.quote} >Quote</Button> }
                { quoted && !external_id && <Button size={'small'} color="primary" onClick = {this.request} >Request</Button> }
                { external_id && !sealed && <Button size={'small'}  color="warn" onClick = {() => this.setIsOpenCancelPopup(true)} >Cancel</Button> }
              </span>
            </div>
            { scheduled_at && <div>
              <span style={styles.label}>Scheduled</span> <span>{ moment(scheduled_at).tz(timezone).format('MM/DD HH:mm') }</span>
            </div> }
          </AxlPanel.Col>
          { external_path_id && 
          <AxlPanel.Col>
              <span style={styles.label}>{ external_title }:</span>
              <span style={styles.text} onClick={this.showExternal}>{ external_path_id }</span>
          </AxlPanel.Col>
          }
      </AxlPanel.Row>
      { this.state.scheduling && <AxlModal style={{width: '320px', height: '520px', textAlign: 'center', paddingBottom: '40px', paddingLeft: '16px', paddingRight: '16px', borderRadius: 16}} onClose={() => {
            this.setState({scheduling: false})
          }}>
            <Eta tz={timezone} start={predicted_start_ts} onUpdate={this.scheduledQuote } onCancel={() => this.setState({scheduling: false}) } />
      </AxlModal> }
      { this.state.showingExternal && <AxlModal style={{width: '480px', height: '700px', paddingBottom: '60px', paddingTop: '10px', paddingLeft: '16px', paddingRight: '16px', borderRadius: 16}} onClose={() => {
            this.setState({showingExternal: false})
          }}>
        { !externalPath && <h3>No information available for { provider } {external_title}</h3> }
        { externalPath && <h2>{ provider } {external_title} {external_path_id}</h2> }
        { provider === 'WORKWHILE' && externalPath && <Shift info={externalPath} /> }
        { provider === 'LYFT' && externalPath && <DeliveryPath info={externalPath} labels={labels} /> }
        <div style={{position: 'absolute', bottom: 10, left: 0, right: 0, height: 40, paddingLeft: 20, paddingTop: 5}}>
          <AxlButton compact disabled={refreshingPath} style={{width: 100}} onClick={this.refreshExternal}>Refresh</AxlButton>
        </div>
      </AxlModal> }

      <CancelAssignmentPopup 
          open={this.state.isOpenCancelPopup }
          title={`${provider} - Cancel assignment`} 
          reasonList={cancellationReasonList} 
          closePopup={() => this.setIsOpenCancelPopup(false)} 
          saveAction={this.cancel} 
          />

        <LoadingDialog
            handleCloseDialog = { ()=> this.setIsLoadingModalOpen(false) }
            provider = {provider}
            requestType = { requestType }
            showDialog = { isLoadingModalOpen }
            polling = { pendingRequest }
            error = { error }
            title = {`Sending ${requestType} request to ${provider}`}
             />
    </Fragment>
  }
}