import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import { AxlLoading, AxlButton } from 'axl-reactjs-ui';
import {Tooltip} from '@material-ui/core';
// Styles
import styles, * as E from './styles';
// Components
import ShareFileDetail from './ShareFileDetail';

@inject('messengerStore')
@observer
export default class ShareFilesChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _isShowFileDetail: false,
      imageDetail: null
    }
  }

  _isShowFileDetail = (image) => {
    this.setState({
      _isShowFileDetail: !this.state._isShowFileDetail,
      imageDetail: image
    })
  }

  _isResetImgUrl = () => {
    this.setState({imageDetail: null})
  }

  handleRemoveMessage = (messageId) => {
    const { messengerStore, reloadMessage } = this.props;
    const { messengers, topicSelected } = messengerStore;
    messengerStore.removeMessage(messageId, () =>{
      this.setState({imageDetail: null});
      reloadMessage(topicSelected);
    })
  }

  render() {
    const fakeImageUrl = '/assets/images/bg.png';
    const { imageDetail } = this.state;
    const { messengerStore } = this.props;
    const { messengers, removeMessage } = messengerStore;
    let images = [];
    if(messengers) messengers.map(m => m.files.map(file => images.push({id: m.id, ...file})));
    return <E.Container>
      <E.Title>
        {imageDetail && <E.BackButton onClick={this._isResetImgUrl}>
          <i className="fa fa-angle-left" />
        </E.BackButton>}
        {`Shared Files`}
      </E.Title>
      {messengers.length ? <E.Inner>
        {!imageDetail ? <E.Scrollable>
          <E.GridFlex>
            {images.map((image, index) => <E.Flex key={index} onClick={() => this._isShowFileDetail(image)}>
              <E.ImageContainer>
                <E.Image src={image.url} />
              </E.ImageContainer>
            </E.Flex>)}
          </E.GridFlex>
        </E.Scrollable> : <ShareFileDetail imgUrl={imageDetail.url} imageID={imageDetail.id} handleRemoveMessage={() => this.handleRemoveMessage(imageDetail.id)} />}
      </E.Inner> : <E.LoadingContainer><AxlLoading thin={1} size={75} color={`#000`} /></E.LoadingContainer>}
    </E.Container>;
  }
}