import React from 'react';
import { compose } from 'recompose';
import {inject, observer} from "mobx-react";
import _ from "lodash";
import {withRouter} from "react-router-dom";
// Utils
import { MESSENGER_TYPE, FIREBASE_NOFIFICATION_ACTION_EVENT_MAP_TOPIC_SECTION } from '../../constants/messenger';
// Styles
import styles, * as E from './styles';
// Components
import {withFirebase} from "../../components/Firebase";
import MessengerGeneralTab from "./MessengerGeneralTab";
import MessengerActiveTab from "./MessengerActiveTab";
import ShipmentMessenger from "../../containers/ShipmentMessenger";
import Toast from "../../components/Toast";
import {toast} from "react-toastify";
import MessengerToast from "../MessengerToast";

@inject("messengerStore", "userStore", "assignmentStore")
@observer
class MessengerScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: [],
      topicLoading: false,
      driverLoading: false,
      assignmentLoading: false,
      events: [],
      arrayTopics: [],
      activeAssignmentSummaries: {
        'FOLLOWING': [],
        'ATTENDED': [],
        'UNATTENDED': []
      },
      generalSupportSummaries: {
        'SOLVING': [],
        'UNSOLVED': [],
        'SOLVED': [],
        'NO_PRIOR': []
      },
      AA_Following: [],
      isEndTopics: false,
      pageSizeGeneralTab: 100,
      pageNumberGeneralTab: 1,
      pageSizeActiveTab: 100,
      pageNumberActiveTab: 1,
      activeTab: 1,
      AA_FollowingPageNumber: 1,
      AA_FollowingPageSize: 20,
      AA_AttendedPageNumber: 1,
      AA_AttendedPageSize: 20,
      AA_UnattendedPageNumber: 1,
      AA_UnattendedPageSize: 20,
      GS_SolvingPageNumber: 1,
      GS_SolvingPageSize: 20,
      GS_UnsolvedPageNumber: 1,
      GS_UnsolvedPageSize: 20,
      GS_SolvedPageNumber: 1,
      GS_SolvedPageSize: 20,
      isSelecting: false,
      isUpdatingDriver: false,
      isTimeFetchMessage: false,
      isUpdatedTab: false,
      isUpdatedAttended: false,
      isUpdatedFollowing: false,
      isUpdatedUnattended: false,
      isUpdatedSolved: true,
      isUpdatedSolving: true,
      isUpdatedUnsolved: true,
      isUpdateGeneralTab: true,
      isEndAttended: false,
      isEndFollowing: false,
      isEndUnattended: false,
      isEndSolving: false,
      isEndSolved: false,
      isEndUnsolved: false,
      filterSection: {},
      sectionOrderChanged: null,
      sectionOrdering: false,
      searchMode: false,
      filterMode: false,
      generalSearching: false,
      activeAssignmentSearching: false,
      triggerMsgLoading: false
    };
    this.isTabActive = 1;
    this.timeCounter = null;
    this.limitTimeCounter = 15000; // milliseconds
  }

  componentDidMount() {
    const that = this;
    const { messengerStore, match } = this.props;
    const { activeAssignmentSummaries, generalSupportSummaries } = this.state;
    // Initital load topic and reload
    this.initialLoadTopics();
    // request permission
    // foreground listen firebase
    this.props.firebase.requestPermissionPushNotifications().then(token => messengerStore.upsertToken(token, () => {
      // Subscribe
      messengerStore.subscribe();
      this._handleNavigatorWorker();
    }));
    // Auto Reload
    this.initialAutoReload();
    // Topic selected
    const topicSelectedId = match.params && (match.params.id || null);
    if(topicSelectedId) {
      messengerStore.topicSelectedId = topicSelectedId;
      messengerStore.loadSingleTopicById(res => {
        if(res.data) {
          this._handleTopicSelected(_.get(res, 'data'));
          // Change tab depend on topic type
          if(res.data.ref_type === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION) {
            that.setState({activeTab: 2});
          } else if(res.data.type === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT) {
            that.setState({activeTab: 1});
          } else {
            that.setState({activeTab: 1});
          }
        }
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { messengerStore } = this.props;
    const { activeTab, sectionOrdering, searchMode, sectionOrderChanged } = this.state;

    // Tab changes
    if(activeTab !== prevState.activeTab) {
      // Clear messages after change tab
      messengerStore.messengers = [];
      // Clear search context after change tab
      if(activeTab === 1) {
        this.initialLoadingGeneralSupport();
      } else if(activeTab === 2) {
        this.initialLoadingActiveAssignment();
      }
    }

    // Ordering
    if(sectionOrdering !== prevState.sectionOrdering) {
      const sectionOrded = this._handleOrder(this.state.filterSection[sectionOrderChanged], this.state.generalSupportSummaries[sectionOrderChanged]);
      this.setState({
        generalSupportSummaries: Object.assign(this.state.generalSupportSummaries, {[sectionOrderChanged]: sectionOrded})
      })
    }

    //Search mode
    if(prevState.searchMode !== this.state.searchMode && !this.state.searchMode) {
      // Reload
      this.initialLoadTopics();
      // Auto Reload
      this.initialAutoReload();
    }
  }

  componentWillUnmount() {
    const {messengerStore} = this.props;
    this.setState({
      pageSize: 100,
      pageNumber: 1,
      activeTab: 1
    });
    messengerStore.topicSelectedId = null;
    messengerStore.topicSelected = null;
    this.clearAutoReload();
  }

  initialLoadTopics = () => {
    this.initialLoadingGeneralSupport();
    this.initialLoadingActiveAssignment();
  }

  initialLoadingGeneralSupport = () => {
    const {messengerStore, GS_Query} = this.props;
    this.setState({
      isEndSolving: false,
      isEndSolved: false,
      isEndUnsolved: false
    });
    const query = _.assign({}, GS_Query, {region_codes: ''});
    messengerStore.setGeneralSupportQuery(query);
    // General Tab load topics
    this._reloadGeneralSolving();
    this._reloadGeneralSolved();
    this._reloadGeneralUnsolved();
  }

  initialLoadingActiveAssignment = () => {
    const {messengerStore, AA_Query} = this.props;
    this.setState({
      isEndAttended: false,
      isEndFollowing: false,
      isEndUnattended: false
    });
    const query = _.assign({}, AA_Query, {region_codes: ''});
    messengerStore.setActiveAssignmentQuery(query);
    // Active Tab
    this._reloadFollowingSection();
    this._reloadAttendedSection();
    this._reloadUnattendedSection();
  }

  initialAutoReload () {
    console.warn('Auto reload: ON')
    // Reload topics
    this.timeCounter = setInterval(() => {
      // Reload only some speacial section
      this._reloadUnattendedSection();
      this._reloadGeneralSolving();
      this._reloadGeneralUnsolved();
    }, this.limitTimeCounter);
  }

  clearAutoReload () {
    if(this.timeCounter) {
      console.warn('Auto reload: OFF')
      clearInterval(this.timeCounter);
    }
  }

  _handleNavigatorWorker = () => {
    const that = this;
    const { history } = this.props;
    navigator.serviceWorker.onmessage = function(event) {
      console.log('Messenger screen - onmessage: ', event);
      const firebaseLiveTimeAttribute     = 'data.firebaseMessaging.payload.data';
      const firebaseForcegroundAttribute  = 'data.firebase-messaging-msg-data.data';
      const firebaseBackgroundAttribute   = 'data';
      const fibaseDataAttributes          = _.get(event, firebaseLiveTimeAttribute, null) ||
                                            _.get(event, firebaseForcegroundAttribute, null) ||
                                            _.get(event, firebaseBackgroundAttribute, null);
      const refType                       = _.get(fibaseDataAttributes, 'messenger_ref_type', null);
      const actionEvent                   = _.get(fibaseDataAttributes, 'action', null);
      const topicId                       = _.get(fibaseDataAttributes, 'messenger_topic_id', null);
      const msgRefId                      = _.get(fibaseDataAttributes, 'messenger_ref_id');
      const topic_ids                     = _.get(fibaseDataAttributes, 'messenger_topic_ids', "").split(',').map(a => a.trim()) || [];
      const isTopicSelected               = _.isEqual(topicId, _.get(that, 'props.messengerStore.topicSelectedId'));

      // Reload topic to show message
      if(isTopicSelected) {
        that._updateTopicFromFirebaseSignal({ refType, topicId });
      }
      // Reload sections
      if(refType === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT) {
        that.initialLoadingGeneralSupport();
      } else if(refType === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION) {
        that.initialLoadingActiveAssignment();
      }
      // Toast
      if(!isTopicSelected && (refType || msgRefId || topicId)) {
        toast(<MessengerToast
          payload={event} history={history}
          handleTopicSelected={that._handleTopicSelected}
          onChangeTab={that._onChangeTab} />);
      }
    };
  };

  _updateTopicFromFirebaseSignal = (data) => {
    const { messengerStore } = this.props;
    const { topicId } = data;

    if(!topicId) return;

    // Received a new message, load topic and insert to list
    messengerStore.markedAllViewed = false;
    // if topic is selected
    if(messengerStore.topicSelectedId === topicId) {
      this.setState({triggerMsgLoading: true});
      messengerStore.loadTopic(topicId, res => {
        if(res.ok && res.status === 200) {
          messengerStore.topicSelected = res.data;
          // Update topic in topics
          this._updateSection(res.data);
          this.setState({triggerMsgLoading: false})
        }
      })
    } else {
      messengerStore.loadTopic(topicId, res => {
        if(res.ok || res.status === 200) {
          // Update topic in topics
          this._updateSection(res.data);
        }
      })
    }
  }

  _updateTopicInList = (topic) => {
    if(!topic || !topic.ref_type) return null;

    const { generalSupportSummaries, activeAssignmentSummaries } = this.state;
    const { messengerStore } = this.props;
    const refType = topic.ref_type;
    const summaries = (refType === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT) ? generalSupportSummaries : (refType === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION) ? activeAssignmentSummaries : null;
    const prevSection = this._findSectionInTopic(summaries, topic);
    const currentSection = (refType === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT) && topic.situation || (refType === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION) && topic.section;

    if(!summaries || !prevSection || !currentSection) return null;

    let summariesUpdated = Object.assign({}, summaries);

    if(prevSection === currentSection) {
      // replace item if same section
      summariesUpdated = Object.assign(summaries, {[currentSection]: summaries[currentSection].map(t => ((t.id && t.id === topic.id) || (t.ref_id && t.ref_id === topic.ref_id)) ? topic : t)});
    } else {
      // insert item if it's different from the section
      // Remove topic
      summariesUpdated = Object.assign(summaries, {[prevSection]: summaries[prevSection].filter(t => ((t.id && t.id !== topic.id) || (t.ref_id && t.ref_id !== topic.ref_id)))});
      // Re-ordered
      // const reordered = _.orderBy(summariesUpdated[currentSection].concat(topic), ['age_in_milliseconds'], ['asc']);
      let sectionUpdated = summariesUpdated[currentSection];
          sectionUpdated.unshift(topic);
          // insert
      summariesUpdated = Object.assign(summariesUpdated, {[currentSection]: sectionUpdated})
    }

    return summariesUpdated;
  }

  _updateTopicsIntoList = (refType, actionEvent, topicIds) => {
    if(!topicIds.length || !refType) return null;

    const { generalSupportSummaries, activeAssignmentSummaries } = this.state;
    const { messengerStore } = this.props;
    const summaries = (refType === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT) ? generalSupportSummaries : (refType === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION) ? activeAssignmentSummaries : null;

    let summariesUpdated = Object.assign({}, summaries);

    const topicsMoving = Object.values(summariesUpdated).map(section => {
      return _.flattenDeep(section.filter(topic => topicIds.indexOf(topic.id) !== -1))
    }) || [];

    // Remove
    Object.keys(summariesUpdated).map(key => Object.assign(summariesUpdated,{[key]: summariesUpdated[key].filter(topic => topicIds.indexOf(topic.id) === -1)}))
    // Insert
    Object.assign(summariesUpdated,{
      [actionEvent]: (summariesUpdated[actionEvent] ? summariesUpdated[actionEvent].concat(_.flattenDeep(topicsMoving)) : [])
    });

    return summariesUpdated;
  }

  _findSectionInTopic(section, topic) {
    return _.findKey(section, function(arr) {
      const aa = arr.map(a => (a.id === topic.id || a.ref_id === topic.ref_id) && a).filter(a => a);
      if(aa.length) return aa;
    });
  }

  _updateSection = (topic) => {
    if(!topic) return;

    const listTopicsUpdated = this._updateTopicInList(topic);

    switch (topic.ref_type) {
      case MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT: this.initialLoadingGeneralSupport();break;
      case MESSENGER_TYPE.ASSIGNMENT_CONVERSATION: this.initialLoadingActiveAssignment();break;
      default: break;
    }
  }

  _onChangeTab = (e) => {
    this.isTabActive = e;
    this.setState({
      activeTab: e,
      searchMode: false
    });
  }

  _handleTopicSelected = (topic) => {
    const that = this;
    const { activeTab, topics, arrayTopics } = this.state;
    const { messengerStore } = this.props;

    // Push adress
    this.setState({topicLoading: true});

    if(topic && topic.id) {
      this.props.history.push(`/messenger/${topic.id}`);
      messengerStore.topicSelectedId = topic.id;
      messengerStore.loadSingleTopicById(res => {
        if(res.status === 200 && res.ok && res.data) {
          this._handleGetInfo();
          if(res.data.situation === 'NO_PRIOR' || res.data.situation === 'NO_PRIOR') {
            messengerStore.messengers = [];
            messengerStore.topicSelected = res.data;
          }
        } else {
          messengerStore.topicSelectedId = null;
          messengerStore.topicSelected = topic;
        }
        this.setState({topicLoading: false});
      });
    } else {
      messengerStore.topicSelectedId = topic.ref_id;
      messengerStore.topicSelected = topic;
    }
  };

  _onRemoveShipment = (topic) => {
    this._handleTopicSelected(topic);
  }

  _handleGetInfo = () => {
    const { messengerStore, assignmentStore } = this.props;
    const { topicSelected } = messengerStore;

    if(!topicSelected && !topicSelected.ref_type) return;

    if(topicSelected.ref_type === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT ||
    (topicSelected.section && ['SOLVED', 'UNSOLVED', 'SOLVING', 'NO_PRIOR'].indexOf(topicSelected.section) !== -1)) {
      this.setState({driverLoading: true});
      messengerStore.getDriverByIds([parseInt(topicSelected.ref_id)], res => {
        if(res.ok || res.status === 200) {
          messengerStore.assignmentInfoInTopicSelected = Object.assign({}, messengerStore.assignmentInfoInTopicSelected, {['driver']: _.get(res, 'data[0].driver')})
          this.setState({driverLoading: false});
        }
      });
    } else if(topicSelected.ref_type === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION ||
      (topicSelected.section && ['FOLLOWING', 'UNATTENDED', 'ATTENDED'].indexOf(topicSelected.section) !== -1)) {
      if(topicSelected.ref_id) {
        this.setState({assignmentLoading: true});
        messengerStore.getAssignmentInfo(parseInt(topicSelected.ref_id), (res) => {
          if(res.ok && res.status === 200) {
            assignmentStore.selectedAssignment = res.data;
          } else {
            assignmentStore.selectedAssignment = null;
          }
          this.setState({assignmentLoading: false});
        });
      }
    }
  };

  _generalSupportLoadMore = (name) => {
    const { messengerStore } = this.props;
    const {
      generalSupportSummaries,
      GS_SolvingPageNumber, GS_SolvingPageSize,
      GS_SolvedPageNumber, GS_SolvedPageSize,
      GS_UnsolvedPageNumber, GS_UnsolvedPageSize
    } = this.state;

    if(name === 'SOLVING') {
      this.setState({isUpdatedSolving: false});
      const query = Object.assign(messengerStore.getGeneralSupportQuery(), {
        start_ts: '', end_ts: '',
        page_number: GS_SolvingPageNumber + 1,
        page_size: GS_SolvingPageSize,
        region_codes: _.get(messengerStore, 'GS_Query.region_codes', ''),
      });
      messengerStore.setGeneralSupportQuery(query);
      messengerStore.getGeneralSolving(res => {
        if(res.ok || res.data === 200) {
          if(res.data.length) {
            let _generalSupportSummaries = Object.assign({}, generalSupportSummaries);
            _generalSupportSummaries['SOLVING'] = generalSupportSummaries['SOLVING'].concat(res.data)
            this.setState({
              isEndSolving: res.data.length < GS_SolvingPageSize,
              isUpdatedSolving: true,
              generalSupportSummaries: _generalSupportSummaries,
              GS_SolvingPageNumber: this.state.GS_SolvingPageNumber + 1
            });
          } else {
            this.setState({isEndSolving: true});
          }
          this.setState({isUpdatedSolving: true});
        }
      })
    } else if(name === 'SOLVED') {
      this.setState({isUpdatedSolved: false});
      const query = Object.assign(messengerStore.getGeneralSupportQuery(), {
        start_ts: '', end_ts: '',
        page_number: GS_SolvedPageNumber + 1,
        page_size: GS_SolvedPageSize,
        region_codes: _.get(messengerStore, 'GS_Query.region_codes', ''),
      });
      messengerStore.setGeneralSupportQuery(query);
      messengerStore.getGeneralSolved(res => {
        if(res.ok || res.data === 200) {
          if(res.data.length) {
            let _generalSupportSummaries = Object.assign({}, generalSupportSummaries);
            _generalSupportSummaries['SOLVED'] = generalSupportSummaries['SOLVED'].concat(res.data)
            this.setState({
              isEndSolved: res.data.length < GS_SolvedPageSize,
              isUpdatedSolved: true,
              generalSupportSummaries: _generalSupportSummaries,
              GS_SolvedPageNumber: this.state.GS_SolvedPageNumber + 1
            });
          } else {
            this.setState({isEndSolved: true});
          }
          this.setState({isUpdatedSolved: true});
        }
      })
    } else if (name === 'UNSOLVED') {
      this.setState({isUpdatedUnsolved: false});
      const query = Object.assign(messengerStore.getGeneralSupportQuery(), {
        start_ts: '', end_ts: '',
        page_number: GS_UnsolvedPageNumber + 1,
        page_size: GS_UnsolvedPageSize,
        region_codes: _.get(messengerStore, 'GS_Query.region_codes', ''),
      });
      messengerStore.setGeneralSupportQuery(query);
      messengerStore.getGeneralUnsolved(res => {
        if(res.ok || res.data === 200) {
          if(res.data.length) {
            let _generalSupportSummaries = Object.assign({}, generalSupportSummaries);
            _generalSupportSummaries['UNSOLVED'] = generalSupportSummaries['UNSOLVED'].concat(res.data)
            this.setState({
              isEndUnsolved: res.data.length < GS_UnsolvedPageSize,
              isUpdatedUnsolved: true,
              generalSupportSummaries: _generalSupportSummaries,
              GS_UnsolvedPageNumber: this.state.GS_UnsolvedPageNumber + 1
            });
          } else {
            this.setState({isEndUnsolved: true});
          }
          this.setState({isUpdatedUnsolved: true});
        }
      })
    } else {
      return false;
    }
  }

  _activeAssignmentTabLoadMore = (name) => {
    const { messengerStore } = this.props;
    const {
      activeAssignmentSummaries,
      AA_UnattendedPageNumber,
      AA_AttendedPageSize,
      AA_AttendedPageNumber,
      AA_UnattendedPageSize
    } = this.state;

    if(name === 'ATTENDED') {
      this.setState({isUpdatedAttended: false});
      // Load
      messengerStore.setActiveAssignmentQuery({
        order_by: 'age_in_milliseconds',
        order_desc: false,
        start_ts: '', end_ts: '',
        page_number: AA_AttendedPageNumber + 1,
        page_size: AA_AttendedPageSize,
        region_codes: _.get(messengerStore, 'AA_Query.region_codes', ''),
      });
      messengerStore.getAttendedActiveAssignment(res => {
        if(res.status === 200 || res.ok) {
          if(res.data.length) {
            let _activeAssignmentSummaries = Object.assign({}, activeAssignmentSummaries);
            _activeAssignmentSummaries['ATTENDED'] = this.state.activeAssignmentSummaries['ATTENDED'].concat(res.data);
            this.setState({
              activeAssignmentSummaries: _activeAssignmentSummaries,
              AA_AttendedPageNumber: AA_AttendedPageNumber + 1
            });
          } else {
            this.setState({isEndAttended: true});
          }
          this.setState({isUpdatedAttended: true});
        }
      });
    } else if(name === 'UNATTENDED') {
      this.setState({isUpdatedUnattended: false});
      // Load
      messengerStore.setActiveAssignmentQuery({
        start_ts: '', end_ts: '',
        page_number: AA_UnattendedPageNumber + 1,
        page_size: AA_UnattendedPageSize,
        region_codes: _.get(messengerStore, 'AA_Query.region_codes', ''),
        order_by: 'age_in_milliseconds',
        order_desc: false,
      });
      messengerStore.getAllUnattendedActiveAssignment(res => {
        if(res.status === 200 || res.ok) {
          if(res.data.length) {
            let _activeAssignmentSummaries = Object.assign({}, activeAssignmentSummaries);
            _activeAssignmentSummaries['UNATTENDED'] = this.state.activeAssignmentSummaries['UNATTENDED'].concat(res.data);
            this.setState({
              activeAssignmentSummaries: _activeAssignmentSummaries,
              AA_UnattendedPageNumber: AA_UnattendedPageNumber + 1
            });
          } else {
            this.setState({isEndUnattended: true});
          }
          this.setState({isUpdatedUnattended: true});
        }
      });
    }
  };

  _reloadFollowingSection = () => {
    const { messengerStore } = this.props;
    const { AA_FollowingPageSize } = this.state;
    let following = [];

    this.setState({isUpdatedFollowing: false});

    const query = {region_codes: _.get(messengerStore, 'AA_Query.region_codes', '')};
    messengerStore.setActiveAssignmentQuery(query);
    messengerStore.getFollowActiveAssignment(res => {
      if(res.status === 200 || res.ok) {
        following = res.data.map(t => ({...t, 'section': 'FOLLOWING'}));
        if(res.data.length) {
          this.setState({
            // isEndFollowing: res.data.length < AA_FollowingPageSize,
            isUpdatedFollowing: true,
            activeAssignmentSummaries: Object.assign(this.state.activeAssignmentSummaries, {['FOLLOWING']: following})
          });
        } else {
          this.setState({
            // isEndFollowing: true,
            isUpdatedFollowing: true,
            activeAssignmentSummaries: Object.assign(this.state.activeAssignmentSummaries, {['FOLLOWING']: following})
          });
        }
      }
    });
  }

  _reloadAttendedSection = () => {
    const { messengerStore } = this.props;
    const { activeAssignmentSummaries, AA_AttendedPageNumber, AA_AttendedPageSize } = this.state;
    let attendeds = [];

    this.setState({isUpdatedAttended: false});

    Array.from(new Array(this.state.AA_AttendedPageNumber), (x, i) => {
      const query = _.assign({}, messengerStore.AA_Query, {
        order_by: 'age_in_milliseconds',
        order_desc: false,
        start_ts: '',
        end_ts: '',
        page_number: i+1,
        page_size: this.state.AA_AttendedPageSize
      });
      messengerStore.setActiveAssignmentQuery(query);
      messengerStore.getAttendedActiveAssignment(res => {
        if(res.status === 200 || res.ok) {
          attendeds = attendeds.concat(res.data.map(t => ({...t, 'section': 'ATTENDED'})));
          if(res.data.length) {
            this.setState({
              // isEndAttended: res.data.length < AA_AttendedPageSize,
              isUpdatedAttended: true,
              activeAssignmentSummaries: Object.assign(activeAssignmentSummaries, {['ATTENDED']: attendeds})
            });
          } else {
            this.setState({
              // isEndAttended: true,
              isUpdatedAttended: true,
              activeAssignmentSummaries: Object.assign(activeAssignmentSummaries, {['ATTENDED']: attendeds})
            });
          }
        }
      });
    });
  }

  _reloadUnattendedSection = () => {
    const { messengerStore, userStore } = this.props;
    const { activeAssignmentSummaries, AA_UnattendedPageSize } = this.state;
    let unattendeds = [];

    this.setState({isUpdatedAttended: false});

    Array.from(new Array(this.state.AA_UnattendedPageNumber), (x, i) => {
      const query = _.assign({}, messengerStore.AA_Query, {
        order_by: 'age_in_milliseconds',
        order_desc: false,
        start_ts: '', end_ts: '',
        page_number: i+1,
        page_size: this.state.AA_UnattendedPageSize
      });
      messengerStore.setActiveAssignmentQuery(query);
      messengerStore.getAllUnattendedActiveAssignment(res => {
        if(res.status === 200 || res.ok) {
          unattendeds = unattendeds.concat(res.data.map(t => ({...t, 'section': 'UNATTENDED'})));
          unattendeds = this._unattendedReorder(unattendeds, userStore);
          if(res.data.length) {
            this.setState({
              // isEndUnattended: res.data.length < AA_UnattendedPageSize,
              isUpdatedUnattended: true,
              activeAssignmentSummaries: Object.assign(activeAssignmentSummaries, {['UNATTENDED']: unattendeds})
            });
          } else {
            this.setState({
              // isEndUnattended: true,
              isUpdatedUnattended: true,
              activeAssignmentSummaries: Object.assign(activeAssignmentSummaries, {['UNATTENDED']: unattendeds})
            });
          }
        }
      });
    });
  }

  _reloadGeneralSolving = () => {
    const { messengerStore } = this.props;
    const { generalSupportSummaries, GS_SolvingPageSize, GS_SolvingPageNumber } = this.state;
    let solving = [];

    this.setState({isUpdatedSolving: false});

    Array.from(new Array(GS_SolvingPageNumber), (x, i) => {
      const query = _.assign({}, messengerStore.GS_Query, {
        start_ts: '', end_ts: '',
        page_number: i+1,
        page_size: this.state.GS_SolvingPageSize
      })
      messengerStore.setGeneralSupportQuery(query);
      messengerStore.getGeneralSolving(res => {
        if(res.status === 200 || res.ok) {
          solving = solving.concat(res.data.map(t => ({...t, 'section': 'SOLVING'})));
          solving = this._handleOrder("last", solving);
          if(res.data.length) {
            this.setState({
              isEndSolving: res.data.length < GS_SolvingPageSize,
              isUpdatedSolving: true,
              generalSupportSummaries: Object.assign(generalSupportSummaries, {['SOLVING']: solving})
            });
          } else {
            this.setState({
              isEndSolving: true,
              isUpdatedSolving: true,
              generalSupportSummaries: Object.assign(generalSupportSummaries, {['SOLVING']: solving})
            });
          }
        }
      });
    });
  }

  _reloadGeneralSolved = () => {
    const { messengerStore } = this.props;
    const { generalSupportSummaries, GS_SolvedPageSize, GS_SolvedPageNumber } = this.state;
    let solved = [];

    this.setState({isUpdatedSolved: false});

    Array.from(new Array(GS_SolvedPageNumber), (x, i) => {
      const query = Object.assign({
        order_by: 'age_in_milliseconds',
        order_desc: false,
        start_ts: '', end_ts: '',
        page_number: i+1,
        page_size: this.state.GS_SolvedPageSize
      }, messengerStore.getGeneralSupportQuery());
      messengerStore.setGeneralSupportQuery(query);
      messengerStore.getGeneralSolved(res => {
        if(res.status === 200 || res.ok) {
          solved = solved.concat(res.data.map(t => ({...t, 'section': 'SOLVED'})));
          if(res.data.length) {
            this.setState({
              // isEndSolved: res.data.length < GS_SolvedPageSize,
              isUpdatedSolved: true,
              generalSupportSummaries: Object.assign(generalSupportSummaries, {['SOLVED']: solved})
            });
          } else {
            this.setState({
              // isEndSolved: true,
              isUpdatedSolved: true,
              generalSupportSummaries: Object.assign(generalSupportSummaries, {['SOLVED']: solved})
            });
          }
        }
      });
    });
  }

  _reloadGeneralUnsolved = () => {
    const { messengerStore } = this.props;
    const { generalSupportSummaries, GS_UnsolvedPageSize, GS_UnsolvedPageNumber } = this.state;
    let unsolved = [];

    this.setState({isUpdatedUnsolved: false});

    Array.from(new Array(GS_UnsolvedPageNumber), (x, i) => {
      const query = Object.assign({
        order_by: 'age_in_milliseconds',
        order_desc: false,
      }, messengerStore.getGeneralSupportQuery(), {
        page_number: i+1,
        page_size: this.state.GS_UnsolvedPageSize
      });
      messengerStore.setGeneralSupportQuery(query);
      messengerStore.getGeneralUnsolved(res => {
        if(res.status === 200 || res.ok) {
          unsolved = unsolved.concat(res.data.map(t => ({...t, 'section': 'UNSOLVED'})));
          if(res.data.length) {
            this.setState({
              // isEndUnsolved: res.data.length < GS_UnsolvedPageSize,
              isUpdatedUnsolved: true,
              generalSupportSummaries: Object.assign(generalSupportSummaries, {['UNSOLVED']: unsolved})
            });
          } else {
            this.setState({
              // isEndUnsolved: true,
              isUpdatedUnsolved: true,
              generalSupportSummaries: Object.assign(generalSupportSummaries, {['UNSOLVED']: unsolved})
            });
          }
        }
      });
    });
  }

  _mergeWith(objValue, srcValue) {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }

  _viewedMessageCallback = (topic) => {
    if(!(this.state.searchMode || this.state.filterMode)) {
      this._updateSection(topic);
    }
  }

  _actionCallback = (name, topic) => {
    if(topic) this._handleTopicSelected(topic);

    if(this.state.searchMode) {
      this._updateSection(topic);
    } else {
      if(['SELF_FOLLOW', 'SELF_UNFOLLOW'].indexOf(name) !== -1) {
        this.initialLoadingActiveAssignment();
      } else if(['SOLVED', 'UNSOLVED'].indexOf(name) !== -1) {
        this.initialLoadingGeneralSupport();
      } else {
        return false;
      }
    }
  }

  _orderBy = (sectionName, value) => {
    const { messengerStore } = this.props;
    const mapOrderBy = {
      'asc': {
        order_by: 'name',
        order_desc: false
      },
      'desc': {
        order_by: 'name',
        order_desc: true
      },
      'last': {
        order_by: 'age_in_milliseconds',
        order_desc: false
      },
      'oldest': {
        order_by: 'age_in_milliseconds',
        order_desc: true
      },
    };
    messengerStore.setGeneralSupportQuery(mapOrderBy[value]);
    switch (sectionName) {
      case 'SOLVING':
        this.setState({
          sectionOrdering: true,
          sectionOrderChanged: sectionName,
          filterSection: Object.assign(this.state.filterSection, {[sectionName]: value})
        });
        break;
      case 'UNSOLVED':
        this._reloadGeneralUnsolved();
        break;
      case 'SOLVED':
        this._reloadGeneralSolved();
        break;
      default:
        break;
    }
  }

  _handleOrder = (filterName, data) => {
    let result = [];

    switch (filterName) {
      case 'last': result = _.orderBy(data, ['age_in_milliseconds'], ['asc']);break;
      case 'oldest': result = _.orderBy(data, ['age_in_milliseconds'], ['desc']);break;
      case 'asc': result = _.orderBy(data, ['name'], ['asc']);break;
      case 'desc': result = _.orderBy(data, ['name'], ['desc']);break;
      default: result = data;break;
    }

    this.setState({sectionOrdering: false})

    return result;
  }

  _generalSearch = (q) => {
    const { messengerStore } = this.props;

    if(q.length > 0 && q.length < 2) {
      this.setState({searchMode: false});
      return;
    }

    if(!q.length) {
      this.setState({searchMode: false}, () => {
        this._onFilterByRegion([]);
      });
      return;
    }

    this.clearAutoReload();
    this.setState({
      searchMode: true,
      filterMode: false,
      generalSearching: true
    });

    // Query
    messengerStore.setGeneralSearchQuery({
      q: q,
      status: 'OPEN',
      ref_type: 'DRIVER_GENERAL_SUPPORT',
      region_codes: _.get(messengerStore, 'GS_Query.region_codes', '')
    });
    // Searching
    messengerStore.generalSearch(res => {
      if(res.ok || res.status === 200) {
        let generalSupportSummaries = {
          'SOLVING': [],
          'UNSOLVED': [],
          'SOLVED': [],
          'NO_PRIOR': []
        };
        generalSupportSummaries = Object.assign(generalSupportSummaries, _.groupBy(res.data, 'situation'));
        this.setState({
          isEndSolving: true,
          isEndSolved: true,
          isEndUnsolved: true,
          generalSearching: false,
          generalSupportSummaries: generalSupportSummaries
        });
      } else {
        if(res.data.message) {
          alert(res.data.message);
        }
        this.setState({
          generalSearching: false
        });
      }
    })
  }

  _activeAssignmentSearch = (q) => {
    const { messengerStore } = this.props;

    if(q.length > 0 && q.length < 2) {
      this.setState({searchMode: false});
      return;
    }

    if(!q.length) {
      this.setState({searchMode: false}, () => {
        this._onFilterByRegion([]);
      });
      return;
    }

    this.clearAutoReload();
    this.setState({
      searchMode: true,
      filterMode: false,
      activeAssignmentSearching: true
    });

    // Query
    messengerStore.setActiveSearchQuery({
      q: q,
      status: 'OPEN',
      ref_type: 'ASSIGNMENT_CONVERSATION',
      region_codes: _.get(messengerStore, 'GS_Query.region_codes', '')
    });
    // Searching
    messengerStore.activeSearch(res => {
      if(res.ok || res.status === 200) {
        let activeAssignmentSummaries = {
          'FOLLOWING': [],
          'ATTENDED': [],
          'UNATTENDED': []
        };
        activeAssignmentSummaries = Object.assign(activeAssignmentSummaries, _.groupBy(res.data, 'section'));
        this.setState({
          isEndAttended: true,
          isEndFollowing: true,
          isEndUnattended: true,
          activeAssignmentSearching: false,
          activeAssignmentSummaries: activeAssignmentSummaries
        });
      } else {
        if(res.data.message) {
          alert(res.data.message);
        }
        this.setState({
          activeAssignmentSearching: false
        });
      }
    })
  }

  _unattendedReorder(unattendeds, me) {
    let sections = _.partition(unattendeds, function(t) {
      return t.unviewed_messages_count > 0
    });
    // order by unfollowerIds
    sections = sections.map(section => _.orderBy(section, [function(s){
      const index = s.unfollower_ids.indexOf(me.user.id);
      return (index !== -1 ? 0 : 1);
    }, 'name'], ['asc', 'desc']));

    return _.flatten(sections);
  }

  _onFilterByRegion = (regions) => {
    console.log(regions)
    const { messengerStore } = this.props;
    const { GS_Query, AA_Query } = messengerStore;
    const GS_Params = _.assign({}, GS_Query, {region_codes: regions.join(",")});
    const AA_Params = _.assign({}, AA_Query, {region_codes: regions.join(",")});
    messengerStore.setGeneralSupportQuery(GS_Params);
    messengerStore.setActiveAssignmentQuery(AA_Params);

    if(regions) {
      this.setState({filterMode: true});
    } else {
      this.setState({filterMode: false});
    }

    if(this.state.searchMode) {
      if(this.state.activeTab === 1) {
        this._generalSearch(_.get(messengerStore, 'generalSearchQuery.q'), '');
      } else if(this.state.activeTab === 2) {
        this._activeAssignmentSearch(_.get(messengerStore, 'activeSearchQuery.q'), '');
      }
    } else {
      if(this.state.activeTab === 1) {
        this._reloadGeneralSolving();
        this._reloadGeneralSolved();
        this._reloadGeneralUnsolved();
      } else if(this.state.activeTab === 2) {
        this._reloadFollowingSection();
        this._reloadAttendedSection();
        this._reloadUnattendedSection();
      }
    }
  }

  _initialTopic = () => {
    this._handleGetInfo();
    this.setState({searchMode: false}, () => {
      this._onFilterByRegion([]);
    })

  }

  render() {
    const { topics, activeTab,
      isUpdateGeneralTab, isEndTopics,
      isEndAttended, isEndFollowing,
      isEndUnattended, activeAssignmentSummaries,
      generalSupportSummaries, arrayTopics,
      isUpdatedAttended, isUpdatedFollowing,
      isUpdatedUnattended, AA_Following,
      isEndSolving, isEndSolved,
      isEndUnsolved, isUpdatedSolving,
      isUpdatedSolved, isUpdatedUnsolved
    } = this.state;
    const { messengerStore } = this.props;
    const { topicSelected } = messengerStore;
    // is new message, show dot
    let mergedArrayTopic = [];
    Object.values(generalSupportSummaries).map(arr => {
      mergedArrayTopic = mergedArrayTopic.concat(arr);
    });
    const isNewMsg = mergedArrayTopic.filter(t => t && t.unviewed_messages_count > 0 && t.situation !== 'SOLVED').length;
    // Counter following + unattended unread
    const followingUnread = activeAssignmentSummaries &&
      activeAssignmentSummaries['FOLLOWING'] &&
      activeAssignmentSummaries['FOLLOWING'].map(a => a.unviewed_messages_count > 0).filter(a => a).length || 0;
    const unattendedUnread = activeAssignmentSummaries &&
      activeAssignmentSummaries['UNATTENDED'] &&
      activeAssignmentSummaries['UNATTENDED'].map(a => a.unviewed_messages_count > 0).filter(a => a).length || 0;
    const isEndAssignmentSection = {
        ATTENDED: isEndAttended,
        FOLLOWING: true, // Disable load more
        UNATTENDED: true // Disable load more
    };
    const isEndGeneralSection = {
      SOLVING: true, // Disable load more
      SOLVED: isEndSolved,
      UNSOLVED: isEndUnsolved,
      NO_PRIOR: true
    };
    const sectionNoPrior = this.state.searchMode ? generalSupportSummaries['NO_PRIOR'] : []; // Don't show this section when search mode is OFF

    return (
      <E.Container>
        <Toast
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnVisibilityChange
          draggable
          pauseOnHover
        />
        <E.BoxFlex>
          <E.LeftPanel>
            <E.TabList>
              <E.TabItem className={`${activeTab === 1 ? 'active' : ''}`} onClick={() => this._onChangeTab(1)}>
                {`General`}{!!isNewMsg && <E.Dotted />}
              </E.TabItem>
              <E.TabItem
                className={`${activeTab === 2 ? 'active' : ''}`}
                onClick={() => this._onChangeTab(2)}>
                <span>{`Active`}</span>
                {!!(followingUnread + unattendedUnread) && <E.Counter>{followingUnread + unattendedUnread}</E.Counter>}
              </E.TabItem>
            </E.TabList>
            <E.TabContent>
              {activeTab === 1 && Object.keys(generalSupportSummaries).length && <MessengerGeneralTab
                orderBy={this._orderBy}
                isEndTopics={isEndGeneralSection}
                isOrdered={!this.state.sectionOrdering}
                isUpdateGeneralTab={isUpdateGeneralTab}
                isUpdatedSolving={isUpdatedSolving}
                isUpdatedSolved={isUpdatedSolved}
                isUpdatedUnsolved={isUpdatedUnsolved}
                sectionSolving={generalSupportSummaries['SOLVING']}
                sectionSolved={generalSupportSummaries['SOLVED']}
                sectionUnsolved={generalSupportSummaries['UNSOLVED']}
                sectionNoPrior={sectionNoPrior}
                topics={mergedArrayTopic}
                loadMore={this._generalSupportLoadMore}
                handleTopicSelected={this._handleTopicSelected}
                delay={800}
                onSearch={this._generalSearch}
                onFilter={this._onFilterByRegion}/>}
              {activeTab === 2 && Object.keys(activeAssignmentSummaries).length && <MessengerActiveTab
                isEndTopics={isEndAssignmentSection}
                isUpdatedFollowing={isUpdatedFollowing}
                isUpdatedAttended={isUpdatedAttended}
                isUpdatedUnattended={isUpdatedUnattended}
                sectionFollowing={activeAssignmentSummaries['FOLLOWING']}
                sectionAttended={activeAssignmentSummaries['ATTENDED']}
                sectionUnattended={activeAssignmentSummaries['UNATTENDED']}
                loadMore={this._activeAssignmentTabLoadMore}
                handleTopicSelected={this._handleTopicSelected}
                onSearch={this._activeAssignmentSearch}
                onFilter={this._onFilterByRegion}/>}
            </E.TabContent>
          </E.LeftPanel>
          <E.MainPanel>
            <ShipmentMessenger
              onRemoveShipment={this._onRemoveShipment}
              triggerMsgLoading={this.state.triggerMsgLoading}
              triggerInitialTopic={this._initialTopic}
              topicLoading={this.state.topicLoading}
              assignmentLoading={this.state.assignmentLoading}
              driverLoading={this.state.driverLoading}
              isUpdatedTab={this.isTabActive}
              actionCallback={this._actionCallback}
              viewedMessageCallback={this._viewedMessageCallback}
              history={this.props.history}/>
          </E.MainPanel>
        </E.BoxFlex>
      </E.Container>
    );
  }
}

export default compose(
  withRouter,
  withFirebase,
  inject('messengerStore'),
  observer
)(MessengerScreen);
