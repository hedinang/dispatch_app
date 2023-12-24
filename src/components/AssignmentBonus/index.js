import React from 'react';
import { inject, observer } from 'mobx-react';
import { AxlInput, AxlPanel, AxlButton, AxlTextArea, AxlSelect } from 'axl-reactjs-ui';
import { Box, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@material-ui/core';

import styles, * as E from './styles';
import TooltipContainer from '../TooltipContainer';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';

@inject('assignmentStore', 'permissionStore')
@observer
export default class AssignmentBonus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bonus: props.assignment.bonus ? props.assignment.bonus : '',
      reason: '',
      reasonCode: '',
    };
  }

  componentDidMount() {
    const { assignmentStore } = this.props;
    const { bonusConfig } = assignmentStore;

    assignmentStore.resetBonusError();
    if (!bonusConfig.tier) {
      assignmentStore.getBonusConfig();
    }
  }

  onUpdate = (name) => (e) => {
    if (e.target.value !== undefined) {
      this.setState({ [name]: e.target.value });
    }
  };

  updateBonus = (assignmentId) => () => {
    const { bonus, reason, reasonCode } = this.state;
    const { closeMe, assignmentStore } = this.props;
    assignmentStore.updateBonus(assignmentId, bonus, reason, reasonCode, (res) => {
      if (res.status === 200) {
        closeMe();
        assignmentStore.loadAssignment(assignmentId);
      }
    });
  };

  render() {
    const { bonus, reasonCode, reason } = this.state;
    const { assignment, assignmentStore, permissionStore } = this.props;
    const { updatingBonus, bonusError, bonusConfig, fetching } = assignmentStore;
    const options = !bonusConfig.reason_codes ? [] : bonusConfig.reason_codes.map((r) => ({ name: r, value: r }));

    const isDeniedBonus = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.BONUS_ROUTE);

    if (fetching) {
      return (
        <Box align="center" p={2}>
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (!!bonusConfig.error) {
      if (bonusConfig.error === 406) {
        return (
          <Box p={2} style={styles.errorMsg}>
            You do not have permission to update bonus
          </Box>
        );
      } else {
        return (
          <Box p={2} style={styles.errorMsg}>
            Error code {bonusConfig.error} while loading bonus config, pls try again later.
          </Box>
        );
      }
    }

    let disableSave = false;
    if (!bonus || !reasonCode) {
      disableSave = true;
    } else if (reasonCode === 'Other' && (!reason || !reason.trim())) {
      disableSave = true;
    }

    return (
      <E.Container style={styles.Container}>
        <div style={styles.HeaderTitle}>{`Update Bonus`}</div>
        <AxlPanel>
          <AxlPanel.Row>
            <AxlPanel.Col style={styles.GroupPanel}>
              <div style={styles.GroupField}>
                <div style={styles.GroupTitle}>
                  <span>Bonus (USD)</span>
                  <small style={{ color: 'red', marginLeft: 5 }}>
                    <em>
                      You can add bonus up to {!!bonusConfig.max_bonus ? `$${bonusConfig.max_bonus} or` : ''} ${bonusConfig.max_per_box} per box (which ever is {bonusConfig.bonus_type === 'MIN' ? 'less' : 'greater'})
                    </em>
                  </small>
                </div>
                <div style={styles.Field}>
                  <AxlInput value={bonus} onChange={this.onUpdate('bonus')} placeholder={`Bonus`} name={`bonus`} type={`number`} fluid />
                </div>
              </div>
            </AxlPanel.Col>
          </AxlPanel.Row>
          <AxlPanel.Row>
            <AxlPanel.Col style={styles.GroupPanel}>
              <div style={styles.GroupField}>
                <div style={styles.GroupTitle}>Reason Code</div>
                <div style={styles.Field}>
                  <FormControl fullWidth variant="outlined" margin="dense">
                    <InputLabel style={{ color: '#ccc' }}>Reason Code</InputLabel>
                    <Select value={reasonCode} onChange={this.onUpdate('reasonCode')} label="Reason Code" style={{ border: 'none' }}>
                      {options.map((opt) => (
                        <MenuItem value={opt.value}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            </AxlPanel.Col>
          </AxlPanel.Row>
          <AxlPanel.Row>
            <AxlPanel.Col style={styles.GroupPanel}>
              <div style={styles.GroupField}>
                <div style={styles.GroupTitle}>Reason</div>
                <div style={styles.Field}>
                  <AxlTextArea value={reason} onChange={this.onUpdate('reason')} name="reason" placeholder={`Reason...`} style={styles.TextField} fluid />
                </div>
              </div>
            </AxlPanel.Col>
          </AxlPanel.Row>
          <AxlPanel.Row>
            <AxlPanel.Col>
              <AxlPanel.Row align={`center`}>
                <div style={{ ...styles.Field, ...styles.FieldButton }}>
                  <AxlButton compact bg={`gray`} onClick={this.props.closeMe} style={styles.buttonControl}>
                    Cancel
                  </AxlButton>
                </div>
                <div style={{ ...styles.Field, ...styles.FieldButton }}>
                  <TooltipContainer title={isDeniedBonus ? PERMISSION_DENIED_TEXT : ''}>
                    <AxlButton compact bg={`pink`} disabled={isDeniedBonus || disableSave} loading={updatingBonus} onClick={this.updateBonus(assignment.id)} style={styles.buttonControl}>
                      Save
                    </AxlButton>
                  </TooltipContainer>
                </div>
              </AxlPanel.Row>
            </AxlPanel.Col>
          </AxlPanel.Row>
          {bonusError && (
            <Box p={1} style={styles.errorMsg}>
              {bonusError}
            </Box>
          )}
        </AxlPanel>
      </E.Container>
    );
  }
}
