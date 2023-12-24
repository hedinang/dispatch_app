import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { AxlButton, AxlTable, AxlSearchBox, AxlModal } from 'axl-reactjs-ui';

import styles from './styles';
import AssignmentAssign from '../../components/AssignmentAssign';
import TooltipContainer from '../../components/TooltipContainer';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT, ROUTE_ASSIGN_DSP_BTN_TEXT } from '../../constants/common';

@inject('dspStore', 'permissionStore')
@observer
class DspSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      q: '',
      reason: '',
      selectedDsp: null,
      showUnassignDriver: false,
    }
  }

  componentDidMount() {
    this.props.dspStore.listAll(true);
  }

  showUnassignDriver = () => {
    this.setState({showUnassignDriver: true});
  };

  hideUnassignDriver = () => {
    this.setState({showUnassignDriver: false});
  };

  onChange = (q) => {
    this.setState({q});
  };

  onSearch = () => {
    if (!this.state.q) return;

    const { dspStore } = this.props;
    this.setState({selectedDsp: null});
    dspStore.search(this.state.q)
  };

  onSelectDsp = (dsp) => {
    if(dsp.id !== this.props.dspIdSelected) {
      this.setState({ selectedDsp: dsp })
    }
  };

  updateReason = (e) => {
    this.setState({reason: e});
  };

  onSelect = () => {
    const { selectedDsp, reason } = this.state;
    selectedDsp && this.props.onSelect && this.props.onSelect(selectedDsp, reason)
  };

  _renderDsp = (dsp) => {
    const { selectedDsp } = this.state;
    const isSelected = selectedDsp && selectedDsp.id === dsp.id;
    let style = isSelected ? styles.selected: {};
    const unassignable = ['SUSPENDED', 'QUIT'].includes(dsp.status);
    // const unassignableYet = !driver.background_status || driver.background_status.indexOf("APPROVED") < 0;
    const preselected =  dsp.id === this.props.dspIdSelected;
    if (unassignable) {
      style = styles.suspended;
    }
    // if (unassignableYet) {
    //   style = styles.warning;
    // }
    if (preselected) {
      style = styles.preselected;
    }

    return (
      <AxlTable.Row
        style={{ cursor: (unassignable) ? 'not-allowed' : 'pointer'}}
        onClick={() =>  (unassignable) ? null : this.onSelectDsp(dsp)}
        key={dsp.id}
      >
        <AxlTable.Cell style={{...styles.highlightCell, ...style}}>{dsp.id}</AxlTable.Cell>
        <AxlTable.Cell style={{...styles.highlightCell, ...style}}>{dsp.code}</AxlTable.Cell>
        <AxlTable.Cell style={{...styles.highlightCell, ...style}}>{dsp.company}</AxlTable.Cell>
        <AxlTable.Cell style={style}>{dsp.phone_number}</AxlTable.Cell>
        <AxlTable.Cell style={style}>{dsp.email}</AxlTable.Cell>
        <AxlTable.Cell style={style}>{dsp.status}</AxlTable.Cell>
      </AxlTable.Row>
    )
  };

  render() {
    const {selectedDsp, showUnassignDriver} = this.state;
    const { dspStore, permissionStore } = this.props;
    const { dspSearchResult } = dspStore;
    const dspName = selectedDsp ? `${selectedDsp.company} [${selectedDsp.id}]` : '-';
    const isDenied = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.ASSIGN_DSP);

    return (
      <div style={styles.container}>
        <div style={styles.title}>Assign to DSP</div>
        <AxlSearchBox onChange={this.onChange}
                      onEnter={this.onSearch}
                      placeholder='Search DSP by name or code...'
                      style={{ width: '100%' }}
        />
        <div style={styles.listContainer}>
          {dspSearchResult.length ?
            <AxlTable>
              <AxlTable.Header>
                <AxlTable.Row>
                  <AxlTable.HeaderCell style={styles.highlightCell}>DSP ID</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell style={styles.highlightCell}>DSP CODE</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell style={styles.highlightCell}>DSP NAME</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell>Phone No.</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell>Email</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell>Status</AxlTable.HeaderCell>
                </AxlTable.Row>
              </AxlTable.Header>
              <AxlTable.Body>
                {dspSearchResult && dspSearchResult.map(this._renderDsp)}
              </AxlTable.Body>
            </AxlTable>
            : <div style={styles.notFound}>NO DSP MATCHED</div>
          }
          {showUnassignDriver && (
            <AxlModal onClose={this.hideUnassignDriver} style={styles.modalStyle} containerStyle={styles.modalContainer}>
              <AssignmentAssign text={<span>Assign DSP <em>{dspName}</em></span>} updateReason={this.updateReason} onClose={this.hideUnassignDriver} onClick={this.onSelect} />
            </AxlModal>
          )}
        </div>
        <div style={styles.buttons}>
          <AxlButton compact={true}
                     style={styles.button}
                     bg={'red'}
                     onClick={() => this.props.onCancel && this.props.onCancel()}
          >
            {`CANCEL`}
          </AxlButton>
          <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
            <AxlButton
              disabled={!selectedDsp || isDenied}
              compact={true}
              style={styles.button}
              onClick={this.showUnassignDriver}
            >
              {ROUTE_ASSIGN_DSP_BTN_TEXT}
            </AxlButton>
          </TooltipContainer>
        </div>
      </div>
    );
  }
}

export default DspSearch;
