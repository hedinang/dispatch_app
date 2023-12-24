import React, { Component, Fragment, useRef, createRef } from 'react';
import { AxlChatForm, AxlLoading, AxlModal, AxlPopConfirm, AxlButton } from 'axl-reactjs-ui';
import {withStyles, Tooltip} from '@material-ui/core';

import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import moment from "moment-timezone";
// Utils
import { MESSENGER_TYPE } from "../../constants/messenger";
// Styles
import styles, * as E from './styles';
//Components
import ShipmentMessengerTabGroups from "./ShipmentMessengerTabGroups";
import FlyChatPanel from "../../components/FlyChatPanel";
import ShareFilesChat from "../../components/ShareFilesChat";
import ActiveParticipantChat from "../../components/ActiveParticipantChat";
import MessengerListUser from "../../components/MessengerListUser";
import AssignmentMap from "../../components/AssignmentMap";
import {HistoryListComponent} from "../../components/HistoryList";
import AssignmentDetailPanel from "./AssignmentDetailPanel";
import ShipmentContainerPanel from "./ShipmentContainerPanel";
import MessengerSendLinkForm from "./MessengerSendLinkForm";
import AssignmentMiniChat from "./AssignmentMiniChat";
import {convertActivityLogToTitle, convertAssignmentConversationToTitle, filterEvents} from "../../Utils/events";
import AxlChatBox from "../../components/AxlChatBox";

@inject('messengerStore', 'assignmentStore', 'userStore', 'historyStore')
@observer
export default class ShipmentMessenger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      eventLog: [],
      messengers: [],
      markViewedAll: true,
      isMsgLoading: false,
      isActivityLoading: false,
      isUpdatedUser: true,
      isShowModalFile: false,
      isEventSearching: false,
      isBottomBoxChat: false,
      showModal: {
        sendLink: false
      },
      filesUploaded: [],
      fileUploading: false,
      modalFile: null,
      _isOpen: {
        flyChat: false,
        shareFiles: false,
        listUser: false,
        historyPanel: false,
        assignmentDetail: false,
        shipmentDetail: false,
        activeChatMini: false,
      }
    };
    this.events = [];
    this.refers = [];
    this.scrollingRef = {};
    this.innerScrolling = {};
    this.USERS_STORAGE_KEY = `${process.env.REACT_APP_SESSION_STORAGE_PREFIX}-USERS`;
    this.MAX_STORAGE_HOURS = 6;
  }

  componentDidMount() {
    const that = this;
    const { assignmentStore, messengerStore } = this.props;
    const cachedUsers = JSON.parse(sessionStorage.getItem(this.USERS_STORAGE_KEY));

    // Refresh user storage after some hours
    const areCachedUsersStillGood = cachedUsers && cachedUsers.timestamp && ((new Date().getTime() - cachedUsers.timestamp) < 60*60*this.MAX_STORAGE_HOURS);
    // Check driver into sessionStorage
    if(!cachedUsers || areCachedUsersStillGood || (cachedUsers && cachedUsers.value && cachedUsers.value.length)) {
      this._reloadDispatcher();
    }

    if(messengerStore.topicSelectedId) {
      messengerStore.loadMessageByTopicId(messengerStore.topicSelectedId, res => {
        if(res.ok || res.status === 200) {
          const messengers = this._sortMessagesByTimestamp(res.data.concat(this.state.eventLog));
          this.setState({messengers: messengers});
          // fetch and find user
          this._findUser(messengers, cachedUsers);
          // Scroll to last messages
          this._scrollToLastMessage();
          // mark viewed
          this._markViewedAll();
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { messengerStore, isUpdatedTab } = this.props;
    const { topicSelected, topicReloading } = messengerStore;
    const cachedUsers = JSON.parse(sessionStorage.getItem(`${process.env.REACT_APP_SESSION_STORAGE_PREFIX}-USERS`));

    // if(isUpdatedTab !== prevProps.isUpdatedTab) {
    //   this._isClearShowState();
    // }

    if(this.state.isMsgLoading) {
      this.refers = []; // clear referrence
    }

    if((this.state.isMsgLoading !== prevState.isMsgLoading && !this.state.isMsgLoading) &&
      messengerStore.messengers && messengerStore.messengers.length) {
      // fetch and find user
      this._findUser(messengerStore.messengers, cachedUsers);
      this._scrollToLastMessage();
    }

    // if(this.state.isActivityLoading !== prevState.isActivityLoading && !this.state.isActivityLoading) {
    //   this._scrollToUnviewMessage();
    // }
  }

  componentWillReceiveProps(nextProps, nexState) {
    const { messengerStore, assignmentStore, isAssignmentLoading } = this.props;
    const { assignmentInfoInTopicSelected, topicSelected } = messengerStore;
    const { selectedAssignment } = assignmentStore;
    const cachedUsers = JSON.parse(sessionStorage.getItem(`${process.env.REACT_APP_SESSION_STORAGE_PREFIX}-USERS`));
    const isMessengerRoute = window.location.href.match(/\/messenger/) && !!window.location.href.match(/\/messenger/).length;

    if(this.props.topicLoading !== nextProps.topicLoading && !this.props.topicLoading) {
      this._isClearShowState();
    } else if(this.props.topicLoading !== nextProps.topicLoading && this.props.topicLoading) {
      this._updateMessages(topicSelected);
    }

    // firebase signal
    if(this.props.triggerMsgLoading !== nextProps.triggerMsgLoading && !nextProps.triggerMsgLoading) {
      // Reload message don't change state
      messengerStore.loadMessageByTopicId(topicSelected.id, res => {
        if(res.ok || res.status === 200) {
          const messengers = this._sortMessagesByTimestamp(res.data.concat(this.state.eventLog));
          this.setState({messengers: messengers});
          // fetch and find user
          this._findUser(messengers, cachedUsers);
          // Scroll to last messages
          if(topicSelected) {
            this._scrollToLastMessage();
          }
          // mark viewed
          this._markViewedAll();
        }
      });
    }

    // Load and assign selected assignment
    if(this.props.assignmentLoading !== nextProps.assignmentLoading && !nextProps.assignmentLoading && isMessengerRoute) {
      this._onChangePanel('assignmentDetail');
      if(selectedAssignment) {
        this._triggerEvent(assignmentInfoInTopicSelected)
      } else if(Object.values(assignmentInfoInTopicSelected).length) {
        this._triggerEvent(assignmentInfoInTopicSelected)
      }
    }
  }

  componentWillUnmount() {
    const { messengerStore } = this.props;
    this.events = [];
    messengerStore.messengers = [];
    messengerStore.topicSelected = null;
    messengerStore.markedAllViewed = false;
    this._isClearShowState();
  }

  _findUser = (messageData, userCached) => {
    if(!messageData || !messageData.length) return;

    if(!userCached || !userCached.value || !userCached.value.length) {
      this._reloadDispatcher();
    } else {
      const composerIds = messageData.map(m => m.composer_id);
      const userIds = userCached.value.filter(u => u.id);
      const isAnonymousUser = _.union(composerIds).filter(id => (userIds.indexOf(id) === -1) && id);
      if(isAnonymousUser.length) {
        this._reloadDriver(isAnonymousUser);
      }
    }
  }

  _reloadDriver = (ids = []) => {
    const { messengerStore } = this.props;
    const cachedUsers = JSON.parse(sessionStorage.getItem(this.USERS_STORAGE_KEY));

    this.setState({isUpdatedUser: false});
    // Reload driver users
    messengerStore.getDriverByIds(ids, res => {
      if((res.ok || res.status === 200) && res.data.length) {
        res.data.map(driverUser => {
          const username = driverUser.driver && (driverUser.driver.first_name && driverUser.driver.last_name && [driverUser.driver.first_name ,driverUser.driver.last_name].join(" ")) || driverUser.username;

          cachedUsers.value.push({
            id: driverUser.id,
            photo: _.get(driverUser, 'driver.photo'),
            username: username || `User ${driverUser.id}`,
            role: 'driver'
          });
        })
        cachedUsers.timestamp = new Date().getTime();
        sessionStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(cachedUsers));
        this.setState({isUpdatedUser: true});
      }
    });
  }

  _reloadDispatcher = () => {
    const { messengerStore } = this.props;

    this.setState({isUpdatedUser: false});
    // Load users
    messengerStore.getAdminDispatcher(res => {
      if((res.ok || res.status === 200) && res.data.length) {
        let users =  _.sortBy(res.data, [function(m) { return m.id}]);
        //insert role property
        users = users.map(user => Object.assign({}, user, {role: 'dispatcher'}));
        sessionStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify({value: users, timestamp: new Date().getTime()}));
        this.setState({isUpdatedUser: true});
      }
    });
  }

  _isClearShowState = () => {
    this.refers = [];
    this.events = [];
    this.setState({
      modalFile: null,
      eventLog: [],
      messengers: [],
      _isOpen: {
        flyChat: false,
        shareFiles: false,
        listUser: false,
        historyPanel: false,
        assignmentDetail: false,
        shipmentDetail: false,
        activeChatMini: false,
      }
    })
  };

  _onChangePanel = (name) => {
    let _isOpen = Object.assign({}, this.state._isOpen);
    Object.keys(this.state._isOpen).map(key => {
      if(key !== name) {
        _isOpen = Object.assign(this.state._isOpen, {[key]: false});
      } else {
        _isOpen = Object.assign(this.state._isOpen, {[key]: !this.state._isOpen[name]});
      }
    })
    this.setState({_isOpen: _isOpen});
  }

  _handleFormSubmit = (text) => {
    const { messengerStore, userStore, assignmentStore } = this.props;
    const { user } = userStore;
    const { filesUploaded } = this.state;
    // check
    const isGeneralSupport          = messengerStore.topicSelected && messengerStore.topicSelected.ref_type === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT;
    const isAssignmentConverstation = !!(assignmentStore.selectedAssignment && assignmentStore.selectedAssignment.assignment);

    if(text === "" && filesUploaded.length < 1) return false;

    let data = {};

    if(!messengerStore.topicSelected || !messengerStore.topicSelected.id) {
      if(isAssignmentConverstation) {
        // open assignment converstation topic
        messengerStore.generateTopic(assignmentStore.selectedAssignment.assignment.id, (res) => {
          if((res.ok || res.status === 200) && res.data) {
            data = {
              "topic_id": res.data.id,
              "body": text
            };
            this._postMessageWithData(res.data, data, filesUploaded);
          }
        });
      } else if(isGeneralSupport) {
        if(messengerStore.topicSelected) {
          messengerStore.refType = messengerStore.topicSelected.ref_type;
          messengerStore.generateTopic(messengerStore.topicSelected.ref_id, res => {
            if(res.status === 200 || res.ok) {
              data = {
                "topic_id": res.data.id,
                "body": text
              };
              this._postMessageWithData({...res.data, age_in_milliseconds: 0}, data, filesUploaded);
            }
          });
        }
      } // open general support topic
    } else {
      data = {
        "topic_id": messengerStore.topicSelected.id,
        "body": text
      };
      this._postMessageWithData(messengerStore.topicSelected, data, filesUploaded);
    }
  };

  _handleSelfFollow = () => {
    const { messengerStore } = this.props;
    const { topicSelected } = messengerStore;

    return messengerStore.follow(res => {
      if(res.ok || res.status === 200) {
        this.props.viewedMessageCallback && this.props.viewedMessageCallback({
          ...res.data,
          age_in_milliseconds: topicSelected.age_in_milliseconds || 0
        });
      }
    });
  }

  _postMessageWithData = (topic, data, files) => {
    const { userStore } = this.props;
    const { user } = userStore;

    // insert files
    if(files.length) {
      Object.assign(data, {
        "files": files.map(file => {
          return {
            "url": file,
            "text": topic.id,
            "type": "JPG"
          }
        })
      });
    }
    // self follow and post
    if(topic.follower_ids && user.id &&
      topic.follower_ids.indexOf(user.id) === -1) {
      this._handleSelfFollow();
      this._handlePostMessage(data);
    } else {
      this._handlePostMessage(data);
    }
    // update section
    this.props.viewedMessageCallback && this.props.viewedMessageCallback(topic);
  }

  _handlePostMessage = (data) => {
    const { messengerStore } = this.props;
    const { messengers } = this.state;
    const { topicSelected } = messengerStore;
    // Post message
    messengerStore.postMessage(data, (res) => {
      if(res.status === 200 || res.ok) {
        const msgs = messengers.concat([res.data]);
        messengerStore.messengers = msgs;
        messengerStore.filesUploaded = [];
        this._handleRemoveUploadFile();
        // Reload box chat when file is uploaded
        if(data.files && data.files.length) {
          this._updateMessages(topicSelected, {showLoading: false});
        } else {
          this.setState({messengers: msgs});
        }
        this._scrollToLastMessage();
      }
    });
  }

  _handleUploadFile = (files) => {
    this.setState({fileUploading: true});
    const { messengerStore } = this.props;
    messengerStore.uploadFile(files, (res) => {
      this.setState({
        fileUploading: false,
        filesUploaded: [res.data.unsigned_url]
      });
    });
  };

  _handleRemoveUploadFile = () => {
    this.setState({filesUploaded: []});
  }

  _sortMessagesByTimestamp = (msgs) => {
    return _.sortBy(msgs, [function(m) {
      return Date.parse(m.ts) || m.ts
    }]);
  };

  _scrollToLastMessage = () => {
    if(this.innerScrolling) {
      this.scrollingRef.scrollTop = this.innerScrolling.offsetHeight;
    }
  }

  _markViewedAll = () => {
    const { messengerStore } = this.props;
    const { topicSelected } = messengerStore;

    if(!topicSelected) return;

     this.props.messengerStore.markAllViewed(topicSelected.id,res => {
       if(res.ok || res.status === 204 || res.status === 200) {
         const updatedTopic = {
           ...res.data,
           section: res.data.ref_type === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION ? topicSelected.section : topicSelected.situation, // insert section
           age_in_milliseconds: topicSelected.age_in_milliseconds || 0 // just now
         };
         this.props.viewedMessageCallback && this.props.viewedMessageCallback(updatedTopic);
       }
     });
  }

  _scrollToUnviewMessage = () => {
    const { messengerStore } = this.props;
    const { topicSelected, messengers } = messengerStore;
    if(!topicSelected || !this.refers.length || !this.scrollingRef) return false;

    const offset = topicSelected.unviewed_messages_count > 0 ? (topicSelected.messages_count - topicSelected.unviewed_messages_count) : this.refers.length;
    const offsetValue = this.refers[offset - 1] ? this.refers[offset - 1].offsetTop : 0;
    const topicUnviewed = (topicSelected.unviewed_messages_count && messengerStore.messengers) ? messengerStore.messengers[topicSelected.unviewed_messages_count - 1] : null;
    const offsetTopicUnviewed = topicUnviewed ? (document.getElementById(topicUnviewed.id) ? (document.getElementById(topicUnviewed.id).offsetTop - 120) : 0) : 0;

    this.scrollingRef.scrollTop = offsetTopicUnviewed || offsetValue || 0;

    // this.scrollingRef && this.scrollingRef.offsetHeight
    const heightOfItems = this.refers.map(r => r && r.offsetHeight).reduce((a, b) => a + b);
    const heightOfScroll = this.scrollingRef.offsetHeight;

    this._markViewedAll();
  }

  _handleScroll = (event) => {
    const { messengerStore } = this.props;
    const { topicSelected, markedAllViewed } = messengerStore;

    var node = event.target;
    const bottom = node.scrollHeight - node.scrollTop === node.clientHeight;

    this.setState({isBottomBoxChat: bottom})

    if (bottom && !markedAllViewed && (topicSelected && topicSelected.unviewed_messages_count > 0)) {
      this._markViewedAll();
    }
  }

  _reloadUserStorage = () => {
    const { messengerStore } = this.props;
    // Load users
    this.setState({
      isReloadedAdmin: true,
      isReloadedDispatcher: true,
      isNeedUpdateUser: false
    })
    messengerStore.getAdmins(res => {
      if(res.status === 200 || res.ok) {
        this.setState({
          isReloadedAdmin: false
        });
      }
    });
    // messengerStore.getDrivers();
    messengerStore.getDispatchers(res => {
      if(res.status === 200 || res.ok) {
        this.setState({
          isReloadedDispatcher: false
        });
      }
    });
  }

  _onShowModal = (file) => {
    this.setState({
      isShowModalFile: true,
      modalFile: file
    })
  }

  _onHideModal = () => this.setState({
    isShowModalFile: false,
    modalFile: null
  })

  _triggerEvent = (selectedAssignment) => {
    if(!selectedAssignment) return [];

    const { historyStore } = this.props;
    const that = this;
    let events = [];

    // Load assignment history
    if(selectedAssignment) {
      this.setState({isEventSearching: true});
      if(selectedAssignment.assignment) {
        historyStore.setBaseUrl(`/events/assignments/${selectedAssignment.assignment.id}`);
      }
      if(selectedAssignment.stops) {
        historyStore.search((res) => {
          const stopEvent = filterEvents('STOPS', selectedAssignment.stops)
          const assignmentEvent = filterEvents('ASSIGNMENT', res.data)
          const mergedEvent = assignmentEvent.concat(stopEvent);
          this.setState({
            isEventSearching: false,
            eventLog: this.state.eventLog.concat(mergedEvent)
          })
        });
      }
    }
  }

  _activityLogFilter(logs) {
    return  _.orderBy(logs, ['ts'], ['acs']);
  }

  _convertLogIntoMessage(msgs) {
    let messages = [];
    msgs.map((msg, i) => {
      // show timeline after 30 minutes by miliseconds
      const isInsertTime = !!msgs[i+1] && ((Date.parse(new Date(msgs[i+1].ts)) - Date.parse(new Date(msgs[i].ts))) >= 1800000);
      // const is same day
      const isSameDay = !!msgs[i+1] && moment().isSame(moment(msgs[i+1].ts), 'day');
      const objMerge = {
        body: isSameDay ? moment(msgs[i+1].ts).format('[TODAY], hh:mmA') : moment(msgs[i].ts).format('MM/DD/YYYY, hh:mmA'),
        ts: isSameDay ? msgs[i+1].ts : msg.ts,
        ref_type: 'TIMELINE'
      }
      if(isInsertTime) {
        messages = messages.concat(msg, [objMerge])
      } else {
        messages = messages.concat(msg);
      }
    })

    return messages;
  }

  _updateMessages = (topicSelected, opts = {}) => {
    if(!topicSelected) return false;

    const { messengerStore } = this.props;

    // Load messages
    this.setState({
      isMsgLoading: opts.showLoading !== undefined ? opts.showLoading : true,
      isActivityLoading: true
    });
    messengerStore.loadMessageByTopicId(topicSelected.id, res => {
      if(res.ok || res.status == 200) {
        this.setState({
          messengers: this._convertLogIntoMessage(this._sortMessagesByTimestamp(res.data)),
          // isMsgLoading: false
        });
        this._markViewedAll();
        // Load activity logs
        messengerStore.getActivityLogs(topicSelected.id, res => {
          if((res.ok || res.status === 200) && res.data.length) {
            const eventLog = this.state.eventLog.concat(this._activityLogFilter(res.data));
            const messengers = this._sortMessagesByTimestamp(this.state.messengers.concat(eventLog));
            this.setState({
              isActivityLoading: false,
              eventLog: eventLog,
              messengers: messengers,
              isMsgLoading: false
            });
          } else {
            this.setState({
              isActivityLoading: false,
              isMsgLoading: false
            });
          }
        });
      } else {
        this.setState({isMsgLoading: false});
      }
    });

    return true;
  }

  _updateDataIntoMessage = (topic) => {
    const messengers = this._sortMessagesByTimestamp(this.state.messengers.concat(topic));
    this.setState({
      messengers: messengers
    });
  }

  _showModal = (name) => {
    this.setState({
      showModal: {
        [name]: !this.state.showModal[name]
      }
    })
  }

  _initialTopic = (topic) => {
    if(!topic) return false;

    const {messengerStore} = this.props;
    messengerStore.refType = topic.ref_type;
    messengerStore.generateTopic(topic.ref_id, (res) => {
      messengerStore.topicSelected = res.data;
      messengerStore.topicSelectedId = res.data.id;
      this.props.triggerInitialTopic && this.props.triggerInitialTopic();
      this.props.history.push(`/messenger/${res.data.id}`);
    });
  }

  removeMessage = (message) => {
    const {messengerStore} = this.props;
    const { topicSelected } = messengerStore;
    messengerStore.removeMessage(message.id, () => this._updateMessages(topicSelected))
  }

  Panels = () => {
    const { messengerStore } = this.props;
    const { isShowModalFile, modalFile } = this.state;
    const { assignmentInfoInTopicSelected } = messengerStore;
    const assignmentIdOfTopicSelected = (assignmentInfoInTopicSelected && assignmentInfoInTopicSelected.assignment && assignmentInfoInTopicSelected.assignment.id) || null;
    // Router check
    const isDispatchRoute           = window.location.href.match(/\/routes/) && !!window.location.href.match(/\/routes/).length;
    const isMessengerRoute          = window.location.href.match(/\/messenger/) && !!window.location.href.match(/\/messenger/).length;

    return (
      <E.PanelFlyInner>
        {this.state._isOpen['assignmentDetail'] && <FlyChatPanel nofly={isMessengerRoute}>
          <AssignmentDetailPanel onChangePanel={this._onChangePanel}  />
        </FlyChatPanel>}
        {this.state._isOpen['shipmentDetail'] && <FlyChatPanel nofly={isMessengerRoute}>
          <ShipmentContainerPanel onRemoveShipment={this.props.onRemoveShipment} onChangePanel={this._onChangePanel} />
        </FlyChatPanel>}
        {this.state._isOpen['flyChat'] && <FlyChatPanel nofly={isMessengerRoute}>
          <ActiveParticipantChat />
        </FlyChatPanel>}
        {this.state._isOpen['shareFiles'] && <FlyChatPanel nofly={isMessengerRoute}>
          <ShareFilesChat reloadMessage={this._updateMessages}/>
        </FlyChatPanel>}
        {this.state._isOpen['listUser'] && <FlyChatPanel nofly={isMessengerRoute}>
          <MessengerListUser.MessengerListDispatcher />
        </FlyChatPanel>}
        {this.state._isOpen['historyPanel'] && <FlyChatPanel styleContainer={styles.historyPanelStyle} nofly={isMessengerRoute}>
          <E.MapContainer>
            <AssignmentMap assignment={assignmentInfoInTopicSelected} />
          </E.MapContainer>
          <E.HistoryPanelDetailContainer>
            <HistoryListComponent baseUrl={`/events/assignments/${assignmentIdOfTopicSelected}`} history={this.props.history} type='assignment' viewDispatch={false} />
          </E.HistoryPanelDetailContainer>
        </FlyChatPanel>}
        {this.state._isOpen['activeChatMini'] && <FlyChatPanel styleContainer={styles.activeChatboxPanelStyle} nofly={isMessengerRoute}>
          <AssignmentMiniChat/>
        </FlyChatPanel>}
        {(isShowModalFile && modalFile) && <AxlModal onClose={() => this._onHideModal()} style={styles.modalFile} >
          <E.ModalImageContainer>
            <E.ModalImage src={modalFile} />
          </E.ModalImageContainer>
        </AxlModal>}
      </E.PanelFlyInner>
    );
  }

  render() {
    const { _isOpenFlyChat, _isOpenShareFiles, _isOpenListUser , _isOpenHistoryPanel, isShowModalFile, modalFile, messengers } = this.state;
    const { messengerStore, assignmentStore, userStore } = this.props;
    const { selectedAssignment } = assignmentStore;
    const { loading, topicLoading, topicSelected, following, loadingDriver, assignmentLoading, assignmentInfoInTopicSelected } = messengerStore;
    const isAvailableFormChat = topicSelected &&
      ((topicSelected.ref_type === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT) ||
      (topicSelected.ref_type === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION && topicSelected.status !== "CLOSED")) ||
      (!topicSelected && assignmentStore.selectedAssignment);
    const isLoading = this.state.isMsgLoading && this.state.isUpdatedUser;
    const cachedUsers = JSON.parse(sessionStorage.getItem(`${process.env.REACT_APP_SESSION_STORAGE_PREFIX}-USERS`));

    return <E.Container>
      {_.get(messengerStore, 'topicSelected.id') && <ShipmentMessengerTabGroups
        assignmentLoading={this.state.assignmentLoading}
        actionCallback={this.props.actionCallback}
        history={this.props.history}
        onChangePanel={this._onChangePanel}
      />}
      <E.PanelContainer>
        {((messengerStore.topicSelected && messengerStore.topicSelected.id) || !messengerStore.topicSelected || !messengerStore.topicSelectedId) ? <E.PanelInner>
          <E.ListBoxChat>
            {!isLoading ? (!!messengers.length ?
              <div style={styles.scrollable} ref={(ref) => {
                this.scrollingRef = ref
                if(ref) {
                  ref.addEventListener('scroll', this._handleScroll)
                }
              }}>
                <div ref={(ref) => {this.innerScrolling = ref}}>{messengers.map((m, i) => {
                  const findUser = cachedUsers && cachedUsers.value && cachedUsers.value.filter(u => u.id === parseInt(m.composer_id) && u) || [];
                  let profile = {id: parseInt(m.composer_id), username: `User ${m.composer_id}`, role: m.role};

                  if(findUser.length) {
                    const photo       = findUser[0] && (findUser[0].photo || (findUser[0].info && findUser[0].info.avatar_url)) || null;
                    const nickname    = findUser[0].info && `${findUser[0].role} - ${findUser[0].info.nickname}` || null;
                    const fullname    = (findUser[0].info && findUser[0].info.first_name && findUser[0].info.last_name) && `${findUser[0].role} - ${[findUser[0].info.first_name, findUser[0].info.last_name].join(' ')}` || null;
                    const username    = fullname || nickname || `${findUser[0].role} - ${findUser[0].username}`;
                    const driverName  = (findUser[0].driver && findUser[0].driver.first_name && findUser[0].driver.last_name) && `${findUser[0].role} - ${[findUser[0].driver.first_name, findUser[0].driver.last_name].join(' ')}` || null;

                    profile = {
                      id: findUser[0].id,
                      photo: photo,
                      username: nickname || fullname || driverName || username || `User ${findUser[0].id}`,
                      role: findUser[0].role
                    };
                  }

                  const me = profile.id === this.props.userStore.user.id;

                  return (<div key={i} id={m.id} ref={(ref) => this.refers[i] = ref} style={{display:'flex'}}>
                      {
                        (['ASSIGNMENT_CONVERSATION', 'DRIVER_GENERAL_SUPPORT'].indexOf(m.ref_type) !== -1) ?
                          <AxlChatBox
                            onShowModal={this._onShowModal}
                            message={{'body': m.body, 'files': m.files, ts: m.ts}}
                            profile={profile} theme={`${me ? 'me' : 'quest'}`}
                            float={me} /> : (
                              <div>
                                <E.TimeLineChat dangerouslySetInnerHTML={{__html: convertActivityLogToTitle(m)}} />
                                <E.ChatInformation dangerouslySetInnerHTML={{__html: convertAssignmentConversationToTitle(m)}} />
                                {(['TIMELINE'].indexOf(m.ref_type) !== -1) && <E.ChatInformation dangerouslySetInnerHTML={{__html: m.body}} />}
                              </div>
                          )
                         
                      }
                      {
                        userStore.canRemovePhoto && m.files && m.files.length > 0 && <span style={{alignSelf:'center'}}><AxlPopConfirm
                        trigger={<Tooltip title="REMOVE MESSAGE"><span><AxlButton style={{margin: 0}} bg={`gray`} compact ico={{className: 'fa fa-trash'}} /></span></Tooltip>}
                        titleFormat={<div>{`Confirmation`}</div>}
                        textFormat={<div>Are you sure you want to delete selected photo?</div>}
                        okText={`Yes, delete photo`}
                        onOk={() => this.removeMessage(m)}
                        cancelText={`No`}
                        onCancel={() => console.log('onCancel')}
                      /></span>
                           
                      }
                  </div>)
                })}</div>
              </div> : <E.NoMessage>{`No Message`}</E.NoMessage>) : <E.LoadingContainer><AxlLoading color={`rgba(193, 193, 193, 0.9)`} size={80} thin={1} /></E.LoadingContainer>}
          </E.ListBoxChat>
          <E.ChatFormContainer>
            {this.state.showModal['sendLink'] && <AxlModal onClose={() => this._showModal('sendLink')} style={styles.modalSendFile}>
              <MessengerSendLinkForm onDo={this._updateDataIntoMessage} closeForm={() => this._showModal('sendLink')} />
            </AxlModal>}
          {isAvailableFormChat && <AxlChatForm
            handleSendLink={() => this._showModal('sendLink')}
            uploading={this.state.fileUploading}
            store={messengerStore}
            handleRemoveUploadFile={this._handleRemoveUploadFile}
            handleUploadFile={this._handleUploadFile}
            handleSubmit={this._handleFormSubmit} />}
          </E.ChatFormContainer>
        </E.PanelInner> : <E.CreatMessage>
          <E.CreateText onClick={() => this._initialTopic(topicSelected)}>{`Select a chat to start`}</E.CreateText>
        </E.CreatMessage>}
        {this.Panels()}
      </E.PanelContainer>
    </E.Container>
  }
}