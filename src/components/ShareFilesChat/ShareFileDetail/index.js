import React, { Component } from 'react';
import {inject, observer} from "mobx-react";
import { AxlLoading, AxlButton, AxlPopConfirm } from 'axl-reactjs-ui';
import {Tooltip} from '@material-ui/core';
import propTypes from 'prop-types';
import downloadFile from "../../../Utils/downloadFile";

import styles, * as E from './styles';
@inject('userStore')
@observer
export default class ShareFileDetail extends Component {
  render() {
    return <E.Container>
      <E.ImageContainer>
        <E.Image src={this.props.imgUrl} />
      </E.ImageContainer>
      <E.DownloadContainer>
      {this.props.userStore.canRemovePhoto && <AxlPopConfirm
          trigger={<Tooltip title="Remove photo"><span><AxlButton bg={`gray`} compact ico={{className: 'fa fa-trash'}} /></span></Tooltip>}
          titleFormat={<div>Confirmation</div>}
          textFormat={<div><strong>Are you sure you want to delete selected photo?</strong></div>}
          okText={`Yes,delete photo`}
          onOk={() => this.props.handleRemoveMessage() }
          cancelText={`NO`}
          onCancel={() => console.log('onCancel')}
        />}
        <E.DownloadButton>
          <E.DownloadButtonImage
            src={`/assets/images/download.png`}
            onClick={() => downloadFile.download(this.props.imgUrl, 'download', 'image/jpeg')} />
        </E.DownloadButton>
      </E.DownloadContainer>
    </E.Container>;
  }
}

ShareFileDetail.PropTypes = {
  imgUrl: propTypes.string
};

ShareFileDetail.defaultProps = {
  imgUrl: null
};