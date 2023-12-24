import React from 'react';
import { inject, observer } from 'mobx-react';
import { AxlInput, AxlPanel, AxlButton, AxlTextArea } from 'axl-reactjs-ui';
import {Box, Checkbox, FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";

// Styles
import styles, * as E from './styles';
import {NEGATIVE_REASON_CODES, REASON_CODES} from "../../constants/ticket";
import FormControlLabel from "@material-ui/core/FormControlLabel";

@inject('assignmentStore')
@observer
export default class AssignmentAssign extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reason: '',
      reasonCode: '',
      benefit: true,
    }
  }

  componentDidUpdate(prevProps) {}

  onUpdate = (name) => (e) => {
    if (e.target.value !== undefined || e.target.checked !== undefined) {
      if (e.target.checked !== undefined) {
        this.setState({[name]: e.target.checked});
      } else {
        this.setState({[name]: e.target.value});
      }

      if (name === 'reason') {
        this.props.updateReason(e.target.value);
      } else if (name === 'reasonCode') {
        this.props.updateReasonCode(e.target.value);
        if (NEGATIVE_REASON_CODES.includes(e.target.value)) {
          this.setState({benefit: false});
          this.props.updateBenefit(false);
        } else {
          this.setState({benefit: true});
          this.props.updateBenefit(true);
        }
      } else if (name === 'benefit') {
        this.props.updateBenefit(e.target.checked);
      }
    }
  }

  render() {
    const {reason, reasonCode, benefit} = this.state;
    const { activeTicket, assignmentStore } = this.props;
    const { assigning, unAssigning } = assignmentStore;

    return <E.Container style={styles.Container}>
      <div style={styles.HeaderTitle}>{this.props.text}</div>
      <AxlPanel>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.GroupField}>
              {activeTicket && activeTicket.holder && (
                <Box px={2} py={1}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Select reason code</InputLabel>
                    <Select
                      native
                      value={reasonCode}
                      onChange={this.onUpdate('reasonCode')}
                      label="Select reason code"
                    >
                      <option value="" />
                      {REASON_CODES.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <div style={styles.Field}>
                <AxlTextArea  value={reason} onChange={this.onUpdate('reason')} name='reason' placeholder={`Reason...`} style={styles.TextField} fluid />
              </div>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        {activeTicket && activeTicket.holder && (
            <Box>
              <FormControlLabel
                  control={<Checkbox checked={benefit} tabIndex={-1} disableRipple />}
                  label="Add driver to high-priority pool"
                  onChange={this.onUpdate("benefit")}
                  labelPlacement="end"
              />
            </Box>
        )}
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row align={`center`}>
              <div style={{...styles.Field, ...styles.FieldButton}}>
                <AxlButton compact bg={`gray`} onClick={this.props.onClose} style={styles.buttonControl}>
                  {`Cancel`}
                </AxlButton>
              </div>
              <div style={{...styles.Field, ...styles.FieldButton}}>
                <AxlButton compact bg={`pink`}
                           disabled={!reason || (activeTicket && activeTicket.holder && !reasonCode)}
                           loading={assigning || unAssigning}
                           onClick={this.props.onClick} style={styles.buttonControl}
                >
                  {`Save`}
                </AxlButton>
              </div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </E.Container>
  }
}
