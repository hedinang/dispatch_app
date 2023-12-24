import React from "react";
import { AxlSearchBox, AxlMessageTitleGroup, AxlButton } from 'axl-reactjs-ui';
import {Grid, Box} from '@material-ui/core';
import _ from 'lodash';
import {inject, observer} from "mobx-react";

import styles, * as E from './styles.js';
import AxlMUISelect from "../../../components/AxlMUIComponent/AxlMUISelect";

@inject("messengerStore", "regionStore")
@observer
export default class MessengerGeneralTab extends React.Component {
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
      isUpdatedSolving: false,
      isUpdatedSolved: false,
      isUpdatedUnsolved: false
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
    const {
      sectionSolved, sectionSolving,
      sectionUnsolved, isUpdatedSolving,
      isUpdatedSolved, isUpdatedUnsolved,
      isOrdered, sectionNoPrior,
      messengerStore, regionStore }                      = this.props;
    const solvedUnreadCounter               = sectionSolved.map(a => a.unviewed_messages_count > 0).filter(a => a).length;
    const solvingUnreadCounter              = sectionSolving.map(a => a.unviewed_messages_count > 0).filter(a => a).length;
    const unsolvedUnreadCounter             = sectionUnsolved.map(a => a.unviewed_messages_count > 0).filter(a => a).length;
    const isUpdated                         = (isUpdatedSolving && isUpdatedSolved && isUpdatedUnsolved) || isOrdered;
    const groupCounter                      = (sectionSolved.length ? 1 : 0) + (sectionSolving.length ? 1 : 0) + (sectionUnsolved.length ? 1 : 0);
    const groupData                         = {
      'SOLVING': {
        title: 'ATTENDING',
        unread: solvingUnreadCounter,
        topics: sectionSolving,
        option: {
          filter: {
            placeHolder: 'Alphabetical',
            options: [
              {name: 'A → Z', value: 'asc'},
              {name: 'Z → A', value: 'desc'},
            ]
          }
        }
      },
      'UNSOLVED': {
        title: 'UNATTENDED',
        unread: unsolvedUnreadCounter,
        topics: sectionUnsolved,
        option: {
          filter: {
            placeHolder: 'Latest',
            options: [
              {name: 'Latest → Oldest', value: 'last'},
              {name: 'Oldest → Latest', value: 'oldest'},
              {name: 'A → Z', value: 'asc'},
              {name: 'Z → A', value: 'desc'},
            ]
          }
        }
      },
      'SOLVED': {
        title: 'RESOLVED',
        unread: solvedUnreadCounter,
        topics: sectionSolved,
        option: {
          filter: {
            placeHolder: 'Latest',
            options: [
              {name: 'Latest → Oldest', value: 'last'},
              {name: 'Oldest → Latest', value: 'oldest'},
              {name: 'A → Z', value: 'asc'},
              {name: 'Z → A', value: 'desc'},
            ]
          }
        }
      },
      'NO_PRIOR': {
        title: 'NO PRIOR CHAT',
        topics: sectionNoPrior
      }
    }

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
                              onEnter={this._handleEnter}
                              placeholder='Search by driver name/id/user_id'
                              defaultValue={``} style={{width: '100%'}}
                              onChange={this._handleInputText} />
              </Box>
            </Grid>
          </Grid>
        </E.SearchContainer>
        <E.Scrollable>
          <AxlMessageTitleGroup
            style={{maxHeight: `calc(100%/${groupCounter})`}}
            topicSelected={messengerStore.topicSelected}
            orderBy={this.props.orderBy}
            isUpdated={isUpdated}
            group={groupData}
            isEndTopics={this.props.isEndTopics}
            handleSelectedTopic={this._handleSelectedTopic}
            loadMore={this.props.loadMore} />
        </E.Scrollable>
      </E.Inner>
    </E.Container>;
  }
}
