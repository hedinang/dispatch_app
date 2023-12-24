import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';
import moment from 'moment-timezone';
import images from '../../styled-components/images';

import styles, * as E from './styles';

class AxlChatBox extends Component {
  render() {
    const { profile, message, theme } = this.props;
    const _isBorderRadius = this.props.float;
    const _borderRadiusStyleChat = {
      borderBottomLeftRadius: _isBorderRadius ? 7.5 : 0,
      borderBottomRightRadius: _isBorderRadius ? 0 : 7.5
    };
    const ignoreMessageContent = [`[image]`];
    const imageReplaced = !!(message && message.body) ? message.body.replace(/\[image\]/gi, '') : null;

    return <ThemeProvider theme={{name: this.props.theme}}>
      <E.Container float={this.props.float}>
        <div>{(message && message.files && message.files.length) ? message.files.filter(file => file.url).map(file => <E.ImageInlineContainer onClick={() => this.props.onShowModal(file.url)}><E.ImageInline src={file.url} width={50} /></E.ImageInlineContainer>) : null}</div>
        {imageReplaced && <E.Inner style={_borderRadiusStyleChat}>
          <E.Text dangerouslySetInnerHTML={{__html: imageReplaced}} />
        </E.Inner>}
        {this.props.profile && <E.Profile float={this.props.float}>
          <E.Name>{profile.username || (profile.first_name + ' ' + profile.last_name)}</E.Name>
          <E.WrapAvatar>
            <E.Avatar>
              <E.AvatarImage src={`${profile.photo ? (profile.photo) : (images.avatar)}`} />
            </E.Avatar>
            {message && message.ts && <E.TS>{moment(message.ts).format("hh:mm")}</E.TS>}
          </E.WrapAvatar>
        </E.Profile>}
      </E.Container>
    </ThemeProvider>
  }
}

AxlChatBox.propTypes = {
  theme: PropTypes.string,
  // profile: PropTypes.bool,
  float: PropTypes.bool
};

AxlChatBox.defaultProps = {
  theme: 'quest', // "quest" or "me"
  // profile: false,
  float: false
};

export default AxlChatBox;