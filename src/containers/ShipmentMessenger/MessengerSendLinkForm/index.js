import React, { Component } from 'react';
import _ from 'lodash';
import { AxlInput, AxlPanel, AxlReselect, AxlDateInput, AxlCheckbox, AxlButton } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
// Styles
import styles, * as E from './styles';

@inject('messengerStore')
@observer
export default class MessengerSendLinkForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: {},
      sending: false,
    }
  }

  send = (e) => {
    const {messengerStore, closeForm} = this.props;
    this.setState({sending: true});
    messengerStore.sendLink(this.state.text, (res) => {
      if(res.ok && res.status === 200) {
        this.setState({sending: false});
        this.props.onDo(res.data);
        closeForm();
      } else {
        this.setState({sending: false});
      }
    });
  };

  onChange = (e) => {
    const obj = Object.assign({}, this.state.text, {[e.target.name]: e.target.value});
    this.setState({text: obj});
  }

  render() {
    const {closeForm} = this.props;
    const {text, sending} = this.state;
    const isAvailable = Object.values(text).filter(t => t).length > 1;

    return <E.Container>
      <E.Title>{`Edit Customer`}</E.Title>
      <E.Inner>
        <E.GroupInput>
          <E.Label>{`Title`}</E.Label>
          <E.Input><AxlInput value={_.get(text, 'title', '')} onChange={this.onChange} name={`title`} type={`text`} fluid
          placeholder={`Title of the link`}/></E.Input>
        </E.GroupInput>
        <E.GroupInput>
          <E.Label>{`URL`}</E.Label>
          <E.Input><AxlInput value={_.get(text, 'url', '')} onChange={this.onChange} name={`url`} type={`text`} fluid
          placeholder={`/messengers or https://axlehire.com`}/></E.Input>
        </E.GroupInput>
        <E.Controls>
          <AxlButton compact bg={`whiteBorLightGrey`} onClick={closeForm} style={styles.buttonStyle}>{`CANCEL`}</AxlButton>
          <AxlButton compact onClick={this.send} style={styles.buttonStyle} loading={sending} disabled={sending || !isAvailable}>{`SEND`}</AxlButton>
        </E.Controls>
      </E.Inner>
    </E.Container>
  }
}
