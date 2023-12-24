import React from 'react';
import { inject, observer } from 'mobx-react';
import { AxlInput, AxlPanel, AxlButton, AxlTextArea, AxlPopConfirm } from 'axl-reactjs-ui';

import styles, * as E from './styles';

@inject('assignmentStore')
@observer
export default class AssignmentMessagePool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: 'This assignment is still available to book'
    }
    // this.send = this.send.bind(this);
  }

  onChange = (name) => (e) => {
    if (e.target.value !== undefined) {
      this.setState({[name]: e.target.value});
    }
  }

  send = () => {
    const { assignmentStore, assignment } = this.props;
    const { message } = this.state;

    assignmentStore.sendMessagePool(assignment, message, (res) => {
      if(res.status === 204) {
        this.props.onClose();
        assignmentStore.loadAssignment(assignment.id)
      } else {
        alert("Cannot send message!");
        this.props.onClose();
      }
    })
  }

  render() {
    const { assignmentStore } = this.props;
    const { sendingMessagePool } = assignmentStore;

    return <E.Container>
      <div style={styles.HeaderTitle}>{`Send Message to Pool`}</div>
      <AxlPanel>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.GroupField}>
              <div style={styles.Field}>
                <AxlTextArea  value={this.state.message} onChange={this.onChange('message')} name='message' placeholder={`This assignment is still available to book...`} style={styles.TextField} fluid />
              </div>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row align={`center`}>
              <div style={{...styles.Field, ...styles.FieldButton}}>
                <AxlPopConfirm
                  main
                  trigger={<AxlButton bg={`default`} loading={sendingMessagePool} disabled={this.state.message === ''} onClick={this.send} style={styles.buttonControl}>{`Send`}</AxlButton>}
                  titleFormat={<div>{`CONFIRMATION`}</div>}
                  textFormat={<div>{`Are you sure to send out the message to the pool?`}</div>}
                  okText={`Send`}
                  onOk={this.send}
                  cancelText={`Cancel`}
                  onCancel={() => console.log('onCancle')} />
              </div>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton bg={`red`} onClick={this.props.onClose} style={styles.buttonControl}>{`Cancel`}</AxlButton></div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </E.Container>
  }
}
