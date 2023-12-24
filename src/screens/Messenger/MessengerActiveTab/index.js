import React from "react";
import _ from 'lodash';
import { AxlSearchBox, AxlMessageTitle, AxlMessageTitleGroup, AxlButton } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
import {Box, Grid} from "@material-ui/core";

// Components
import * as E from './styles.js';
import AxlMUISelect from "../../../components/AxlMUIComponent/AxlMUISelect";

@inject("messengerStore", "assignmentStore", "userStore", "regionStore")
@observer
export default class MessengerActiveTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEndTopics: props.isEndTopics,
      defaultChecked: null,
    }
    this._handleInputText = _.debounce(this._handleInputText.bind(this),300)
  }

  componentDidMount() {
    this.props.regionStore.init();
  }

  componentWillUnmount() {
    const { messengerStore, handleTopicSelected } = this.props;
    this.setState({
      isUpdatedUnattended: false,
      isUpdatedAttended: false,
      isUpdatedFollowing: false
    });
    // messengerStore.topicSelectedId = null;
    // messengerStore.topicSelected = null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.isEndTopics !== this.props.isEndTopics)  {
      this.setState({isEndTopics: this.props.isEndTopics});
    }
  }

  _handleSelectedTopic = (topic) => {
    this.props.handleTopicSelected(topic);
  }

  _handleInputText = (e) => {
    // this.props.onSearch(e);
  }

  _handleEnter = ({target: {value}}) => {
    this.props.onSearch(value);
    if(!value)
      this.setState({defaultChecked: []});
  }

  render() {
    const { messengerStore, isUpdatedFollowing,
      isUpdatedAttended, isUpdatedUnattended,
      sectionFollowing, sectionAttended,
      sectionUnattended, userStore, regionStore,
    }                                             = this.props;
    // const groupFollowing                       = _.sortBy(sectionFollowing, ['assignment.label'], ['asc']);
    const groupAttended                           = _.sortBy(sectionAttended, ['assignment.label'], ['asc']);
    const groupUnattened                          = _.sortBy(sectionUnattended, ['assignment.label'], ['asc']);
    const followingUnreadCounter                  = sectionFollowing.map(a => a.unviewed_messages_count > 0).filter(a => a).length;
    const unattendedUnreadCounter                 = sectionUnattended.map(a => a.unviewed_messages_count > 0).filter(a => a).length;
    const attendedUnreadCounter                   = sectionAttended.map(a => a.unviewed_messages_count > 0).filter(a => a).length;
    const isUpdated                               = isUpdatedFollowing && isUpdatedAttended && isUpdatedUnattended;
    const groupCounter                            = (sectionFollowing.length ? 1 : 0) + (sectionUnattended.length ? 1 : 0) + (sectionAttended.length ? 1 : 0);
    const groupData                               = {
      'FOLLOWING': {
        title: 'FOLLOWING',
        unread: followingUnreadCounter,
        topics: sectionFollowing || []
      },
      'UNATTENDED': {
        title: 'UNATTENDED',
        unread: unattendedUnreadCounter,
        topics: groupUnattened || []
      },
      'ATTENDED': {
        title: 'ATTENDED',
        unread: attendedUnreadCounter,
        topics: groupAttended || []
      },
    };

    const REGIONS = regionStore.regions;

    return <E.Container>
      <E.Inner>
        <E.SearchContainer>
          <Grid container>
            <Box>
              <AxlMUISelect
                trigger={<AxlButton bg={`whiteBorderGray_1`} compact={true} source={`/assets/images/icon-3.png`} style={{lineHeight: 0}}/>}
                clear={false} defaultChecked={this.state.defaultChecked}
                theme={'main'} showAll={false} options={REGIONS} onChange={this.props.onFilter} />
            </Box>
            <Grid item xs>
              <Box py={0.5}>
                <AxlSearchBox theme={`default`}
                              placeholder='Search by assignment label'
                              defaultValue={``} style={{width: '100%'}}
                              onChange={this._handleInputText}
                              onEnter={this._handleEnter} />
              </Box>
            </Grid>
          </Grid>
        </E.SearchContainer>
        <E.Scrollable>
          <AxlMessageTitleGroup
            style={{maxHeight: `calc(100%/${groupCounter})`}}
            showHeadCounter={true}
            userStore={userStore}
            isUpdated={isUpdated}
            group={groupData}
            isEndTopics={this.props.isEndTopics}
            handleSelectedTopic={this._handleSelectedTopic}
            topicSelected={messengerStore.topicSelected}
            loadMore={this.props.loadMore} />
        </E.Scrollable>
      </E.Inner>
    </E.Container>;
  }
}
