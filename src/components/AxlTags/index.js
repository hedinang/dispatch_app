import React from 'react';
import message from '../../images/svg/message.svg';

import styles, * as E from './styles';

export default class AxlTags extends React.Component {
  render() {
    const {tags} = this.props;

    return <E.Container>
      <E.Inner>
        {(tags && tags.length > 0) && <E.LabelContainer><i className="fa fa-tag" /></E.LabelContainer>}
        <E.Inner>
          {tags && tags.map((tag, index) => {
            const isShow = tag.text || tag.icon;
            const style = (tag.icon && tag.icon.props && tag.icon.props.style) || {};

            if(!isShow) {
              return null;
            }

            return <E.Button key={index} style={{backgroundColor: tag.bgColor, color: tag.textColor}}>
              {tag.icon && React.cloneElement(tag.icon)}
              {tag.text && <E.Text>{tag.text}</E.Text>}
              {this.props.onClear && <i className="fa fa-times-circle" onClick={() => this.props.onClear(tag.value)} style={{cursor: 'pointer'}} />}
            </E.Button>
          })}
        </E.Inner>
        {(this.props.message && this.props.message.hasMsg) && <E.ButtonMessage>
          <E.ImageMessage src={message} />
          {!!this.props.message.unread && <E.TextMessage>{`new`}</E.TextMessage>}
        </E.ButtonMessage>}
      </E.Inner>
      {this.props.onClearAllTags && (tags && tags.length > 0) && <E.ClearText onClick={this.props.onClearAllTags}>{`clear all`}</E.ClearText>}
    </E.Container>
  }
}
