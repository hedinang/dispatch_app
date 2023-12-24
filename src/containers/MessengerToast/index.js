import React from 'react';
import {ToastContainerStyled} from "../../components/Toast";

export default class MessengerToast extends React.Component {
  render() {
    return <ToastContainerStyled title={this.props.title} onClick={this.props.onClick}>
      {this.props.children}
    </ToastContainerStyled>
  }
}