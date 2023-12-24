import React, { useEffect, useRef, useCallback } from 'react';
import produce from 'immer';
import _ from 'lodash';
import {inject, observer} from "mobx-react";
import ChatBox from "../ChatBox";
import { ThemeProvider } from '@material-ui/core/styles';
import { lightTheme } from '../../../../themes';

@inject('messengerStore', 'userStore', 'supportDoashboard')
@observer
export default class ChatBoxContainer extends React.Component  {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      page: 0,
      total: 0,
    }
    this.scrollTopList = React.createRef();
  }

  checkToLoadMore = _.debounce((listRef) => {
    const that = this;
    const {supportDoashboard} = this.props;
    const { current } = listRef;
    console.log(current.scrollTop, this.state.total, this.state.messages.length)
    if ((current.scrollTop <= 70) && (this.state.total > this.state.messages.length)) {
      supportDoashboard.getMessages({ page: _.get(this, 'state.page') + 1 }, _.get(this, 'messengerStore.topicSelectedId')).then((resp) => {
        if (resp.ok) {
          this.scrollTopList.current = current.scrollHeight;
          const { data } = resp;
          this.setState({
            page: data.page,
            messages: _.merge(this.state.message, data.items),
          })
          _.debounce(() => {
            current.scrollTop = current.scrollHeight - this.scrollTopList.current - 35;
          }, 20)();
        }
      });
    }
  }, 100);

  componentDidMount() {
    const that = this;
    const {supportDoashboard} = this.props;
    const shipmentId = _.get(this, 'props.messengerStore.stopSelected.shipment_id');
    if(shipmentId) {
      supportDoashboard.getMessages({page: 0}, shipmentId).then(res => {
        if(res.ok && res.status === 200 && res.data) {
          that.setState({
            messages: _.get(res, 'data.items', []),
            total: _.get(res, 'data.total', 0)
          })
        }
      });
    }
  }

  render() {
    const {messages} = this.state;
    const {userStore} = this.props;
    const {user} = userStore;

    return <ThemeProvider theme={lightTheme}>
      <ChatBox
        id={_.get(this, 'props.messengerStore.stopSelected.shipment_id')}
        listMsg={messages}
        user={user}
        checkToLoadMore={this.checkToLoadMore}
      />
    </ThemeProvider>;
  }
};

