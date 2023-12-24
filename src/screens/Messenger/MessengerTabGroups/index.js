import React, { Component } from 'react';
import { AxlButton, AxlPopConfirm } from 'axl-reactjs-ui';

import styles, * as E from './styles';

export default class MessengerTabGroups extends Component {
  render() {
    return <MessengerActiveTabGroups {...this.props} />;
  }

  static MessengerGeneralTabGroups = class extends Component {
    render() {
      return <MessengerGeneralTabGroups {...this.props} />;
    }
  }
}

class MessengerGeneralTabGroups extends Component {
  render() {
    return <E.Container>
      <E.InnerScrollable>
        <AxlButton
          source={`/assets/images/svg/member.svg`} compact bg={`greyOne`}
          style={[...styles.buttonWrap, ...styles.buttonCounter]} onClick={this.props.onChangeFlyChat}>
          <E.MemberCount>{`2`}</E.MemberCount>
        </AxlButton>
        <AxlButton
          source={`/assets/images/copy.png`} compact bg={`greyOne`} style={styles.buttonWrap}
          onClick={this.props.onChangeShareFiles} />
      </E.InnerScrollable>
      {this.props.children}
    </E.Container>;
  }
}

class MessengerActiveTabGroups extends Component {
  render() {
    return <E.Container>
      <E.InnerScrollable>
        <AxlPopConfirm
          main
          trigger={<AxlButton compact bg={`greyOne`} style={styles.buttonWrap}>{`Unfollow`}</AxlButton>}
          titleFormat={<div>{`CONFIRMATION`}</div>}
          textFormat={<div>{`Are you sure to unfollow this chat?`}</div>}
          okText={`YES, unfollow this chat`}
          onOk={() => console.log('onOk')}
          cancelText={`No`}
          onCancel={() => console.log('onCancel')} />
        <AxlButton
          source={`/assets/images/svg/member.svg`} compact bg={`greyOne`}
          style={[...styles.buttonWrap, ...styles.buttonCounter]} onClick={this.props.onChangeFlyChat}>
          <E.MemberCount>{`2`}</E.MemberCount>
        </AxlButton>
        <AxlButton
          source={`/assets/images/copy.png`} compact bg={`greyOne`} style={styles.buttonWrap}
          onClick={this.props.onChangeShareFiles} />
        <AxlButton
          ico={{className: 'fa fa-history'}} compact bg={`greyOne`} style={styles.buttonWrap}
          onClick={this.props.onChangeHistoryPanel} />
        <AxlPopConfirm
          main
          trigger={<AxlButton source={`/assets/images/close-chat.png`} compact bg={`greyOne`} style={styles.buttonWrap}/>}
          titleFormat={<div>{`CONFIRMATION`}</div>}
          textFormat={<div>{`Are you sure to close this chat?`}</div>}
          okText={`YES, close this chat`}
          onOk={() => console.log('onOk')}
          cancelText={`No`}
          onCancel={() => console.log('onCancel')} />
      </E.InnerScrollable>
    </E.Container>;
  }
}