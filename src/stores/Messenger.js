import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import {searchInObject} from "axl-js-utils";

export default class MessengerStore {
  constructor(api, assignmentStore) {
    this.api = api;
    this.processAssignmentDetail = assignmentStore.processAssignmentDetail;
    this.selectedAssignmentId = assignmentStore.selectedAssignmentId || null;
    this.selectedAssignment = assignmentStore.selectedAssignment || null;
    assignmentStore && assignmentStore.selectedAssignmentId && console.log(assignmentStore.selectedAssignmentId)
  }

  @observable token = null;
  @observable upserting = false;
  @observable revoketing = false;
  @observable dateRanger = 10;
  @observable startDate = '';
  @observable endDate = '';
  @observable limitMsg = null;
  @observable posting = false;
  @observable loading = false;
  @observable uploading = false;
  @observable topicLoading = false;
  @observable topicsLoading = false;
  @observable refreshTopicLoading = false;
  @observable isFollow = false;
  @observable following = false;
  @observable creatingTopic = false;
  @observable closing = false;
  @observable opening = false;
  @observable marking = false;
  @observable userListing = false;
  @observable newMessageId = null;
  @observable topicSelected = null;
  @observable topicSelectedId = null;
  @observable filesUploaded = [];
  @observable messengers = [];
  @observable followers = [];
  @observable unFollowers = [];
  @observable administrators = [];
  @observable markedAllViewed = false;
  @observable pageNumber = 1;
  @observable pageSize = 10;
  @observable messagesEmbedded = false;
  @observable refType = 'ASSIGNMENT_CONVERSATION';
  // Store Users
  @observable admins = [];
  @observable drivers = [];
  @observable dispatchers = [];
  // Driver process
  @observable driverSeaching = false;
  @observable driverSearchResult = null;
  // Message process
  @observable newMessage = false;
  @observable lastMessage = null;
  // Topics
  @observable topics = [];
  @observable topicsFilter = {
    "ref_type": "DRIVER_GENERAL_SUPPORT",
    "show_only_followed": false,
    "page_number": 1,
    "page_size": 2
  };
  @observable topicsOderBy = {
    'age_in_milliseconds': 'asc'
  };
  @observable assignmentInfoInTopicSelected = {};
  // Assignment Converstation
  @observable assignmentSummaries = [];
  @observable assignmentSummaryLoading = false;
  // Active Assignment Summeries
  @observable AASummeriesQuery = {};
  @observable activeAssignmentSummaries = {};
  @observable loadingactiveAssignmentSummaries = false;
  // Active Assignment Sections
  @observable AA_Query = {
    'start_ts': '',
    'end_ts': '',
    'page_number': 1,
    'page_size': 3,
  };
  @observable AA_Following = [];
  @observable AA_Attended = [];
  @observable AA_ReadUnattended = [];
  @observable AA_Unattended = [];
  @observable AA_UnreadUnattended = [];
  @observable AA_FollowLoading = false;
  @observable AA_AttendedLoading = false;
  @observable AA_UnattendedLoading = false;
  @observable AA_ReadUnattendedLoading = false;
  @observable AA_UnreadUnattendedLoading = false;

  @observable subscribed = false;

  @action
  subscribe(cb) {
    this.api.post(`/messenger/subscribe_all`).then(res => {
      if(res.status === 204 && res.ok) {
        this.subscribed = true;
      }
    });
  }

  @action
  //Todo upsertToken()
  upsertToken(token, cb) {
    if(!token) return;
    this.upserting = true;

    this.api.post(`/fcm/upsert`, {
      "token": token,
      "os": "Windows",
      "device_id": null,
      "revoke_policy": "GLOBAL"
    }).then(res => {
        if(res.status === 204 || res.ok) {
          this.token = token;
          if(cb) cb(res);
        }
        this.upserting = false;
      }
    );
  }

  @action
  // Todo revokeToken()
  revokeToken() {
    this.revoketing = true;
    this.api.post(`/fcm/upsert`, {
      "token": null,
      "os": navigator.userAgent,
      "device_id": null,
      "revoke_policy": "GLOBAL"
    }).then(res => {
        if(res.status === 200 || res.ok) {
          this.token = null;
        }
        this.revoketing = false;
      }
    );
  }

  @action
  //Todo loadSingleTopicById()
  loadSingleTopicById(cb) {
    if(!this.topicSelected && !this.topicSelectedId) return false;

    const topicId = this.topicSelectedId || (this.topicSelected && this.topicSelected.id);
    this.loading = true;
    const params = new URLSearchParams();
    params.append('messages_embedded', this.messagesEmbedded);

    return this.api.get(`messenger/topics/${topicId}?${params}`).then(res => {
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
        this.topicSelectedId = topicId;
        this.messengers = res.data.messages;
        if(this.topicSelected && this.topicSelected.unviewed_messages_count) {
          this.markedAllViewed = false;
        }
      }
      if(cb) {
        cb(res);
      }

      this.loading = false;
    });
  }

  @action
  //Todo loadSingleTopicByRefId()
  loadSingleTopicByRefId(cb) {
    if(!this.selectedAssignmentId) return false;

    this.loading = true;
    const params = new URLSearchParams();
    params.append('messages_embedded', this.messagesEmbedded);
    params.append('ref_type', this.refType);

    return this.api.get(`/messenger/topics_by_ref/${this.selectedAssignmentId}?${params}`).then(res => {
      if(res.status === 200 || res.ok) {
        this.messengers = res.data.messages;
        if(this.topicSelected && this.topicSelected.unviewed_messages_count) {
          this.markedAllViewed = false;
        }
      }
      if(cb) {
        cb(res);
      }

      this.loading = false;
    });
  }

  @action
  //Todo loadTopics()
  loadTopics(cb) {
    this.topicsLoading = true;

    let params = new URLSearchParams();

    Object.keys(this.topicsFilter).map(t => {
      params.append(t, this.topicsFilter[t]);
    });

    this.api.get(`/messenger/topics_by_ref`, params).then(res => {
      if(res.status === 200 || res.ok) {
        let topics = [];
        let _topics = res.data || [];
        _topics = _.groupBy(_topics, (topic) => topic.unviewed_messages_count > 0 ? 0 : 1);
        Object.values(_topics).map(t => {
          let _t = [];
          _t = _.orderBy(t, Object.keys(this.topicsOderBy), Object.values(this.topicsOderBy));
          topics = topics.concat(_t);
        });

        this.topics = topics;
      }

      if(cb) cb(res);

      this.topicsLoading = false;
    });
  }

  @observable topicQuery = {
    messages_embedded: false
  }

  //Todo setTopicQuery()
  setTopicQuery() {}
  //Todo loadTopic()
  @action
  loadTopic(id = null, cb = () => {}) {
    if(!id) return null;

    this.api.get(`/messenger/topics/${id}`).then(res => {
      if(cb) cb(res);

      if(res.ok || res.status === 200) {

      }
    });
  }

  // [Messenger] -Paginated- Messages Inside a Topic
  @action
  //Todo loadMessageByTopicId()
  loadMessageByTopicId(topicId, cb) {
    this.loading = true;
    const arrayParams = {
      start_ts: this.startDate,
      end_ts: this.endDate,
      // page_number: this.pageNumber,
      // page_size: this.pageSize,
    };
    const searchParams = new URLSearchParams(arrayParams);
    const params = searchParams.toString();

    return this.api.get(`/messenger/topics/${topicId}/messages?` + params).then(res => {
      if(res.status === 200 || res.ok) {
        this.messengers = res.data;
        // this.markedAllViewed = false;
      }
      if(cb) {
        cb(res);
      }

      this.loading = false;
    });
  }

  @action
  //Todo generateTopic()
  generateTopic(refId, cb) {
    this.creatingTopic = true;
    this.topicLoading = true;
    const params = new URLSearchParams();
    params.append('ref_id', refId);
    params.append('ref_type', this.refType);

    this.api.post(`/messenger/topics?${params}`).then(res => {
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
      }
      if(cb) {
        cb(res);
      }
      this.creatingTopic = false;
      this.topicLoading = false;
    });
  }

  @action
  //Todo postMessage()
  postMessage(body, cb) {
    this.posting = true;

    // Self follow when is unfollow
    // if(!this.isFollow) {
    //   this.follow();
    // }

    this.api.post(`/messenger/messages`, body).then(res => {
      if(res.status === 200 || res.ok) {
        this.lastMessage = res.data;
      }
      if(cb) {
        cb(res);
      }
      this.posting = false;
    });
  }

  @action
  //Todo loadTopicByAssignmentId()
  loadTopicByAssignmentId(assignmentId, cb) {
    if(!assignmentId) return false;

    this.topicLoading = true;
    const params = new URLSearchParams();
    params.append('messages_embedded', this.messagesEmbedded);
    params.append('ref_type', this.refType);

    this.api.get(`/messenger/topics_by_ref/${assignmentId}?${params}`).then(res => {
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
      }
      if(cb) {
        cb(res)
      }
      this.topicLoading = false;
    });
  }

  @action
  //Todo loadSingleTopic()
  loadSingleTopic(cb) {
    if(!this.topicSelectedId) return;

    this.topicLoading = true;
    const params = new URLSearchParams();
    params.append('messages_embedded', this.messagesEmbedded);

    this.api.get(`/messenger/topics/${this.topicSelectedId}?${params}`).then(res => {
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
      }
      if(cb) {
        cb(res)
      }

      this.topicLoading = false;
    });
  }

  @action
  //Todo reloadMessages()
  reloadMessages() {
    if(!this.topicSelected) return;

    this.loadMessageByTopicId(this.topicSelected.id)
  }

  @action
  //Todo uploadFile()
  uploadFile(files, cb) {
    if(!files || !files.length) return false;

    this.uploading = true;
    const formData = new FormData();
    // Turn of multiple files uploaded
    // files.map(file => formData.append('files', files));
    // Limit single file.
    if(files.length < 1) return false;

    formData.append('file', files[0]);

    this.api.post(`/messenger/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => {
        if(res.status === 200 || res.ok) {
          this.filesUploaded = [res.data.unsigned_url];
        }
        if(cb) {
          cb(res);
        }
      this.uploading = false;
    });
  }

  @action
  removeUploadFiles() {
    this.filesUploaded = [];
  }

  @action
  //Todo follow()
  follow(cb) {
    if(!this.topicSelected || !this.topicSelected.id) return false;
    this.following = true;

    this.api.patch(`/messenger/topics/${this.topicSelected.id}/follow`).then(res => {
      if(cb) {
        cb(res);
      }
      if(res.status === 200 || res.ok) {
        this.isFollow = true;
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
      }

      this.following = false;
    });
  }

  @action
  //Todo forceFollow()
  forceFollow(followers, cb) {
    if(!followers.length || !this.topicSelectedId) return false;
    this.following = true;

    this.api.patch(`/messenger/topics/${this.topicSelectedId}/follow`, followers).then(res => {
      if(cb) {
        cb(res);
      }
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
      }

      this.following = false;
    });
  }

  @action
  //Todo forceUnfollow()
  forceUnfollow(unfollowers, cb) {
    if(!unfollowers.length || !this.topicSelectedId) return false;
    this.following = true;

    this.api.patch(`/messenger/topics/${this.topicSelectedId}/unfollow`, unfollowers).then(res => {
      if(cb) {
        cb(res);
      }
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
      }

      this.following = false;
    });
  }

  @action
  //Todo driverFollow()
  driverFollow(driverId, cb) {
    if(!driverId) return false;
    this.driverSeaching = true;

    this.api.get(`/drivers/search?q=id:${driverId}`)
      .then(res => {
        if (res.status === 200) {
          this.driverSearchResult = res.data;
          const userId = res.data.drivers.map(d => d.user_id)
          if(userId.length) {
            this.forceFollow(userId);
          }
        }
        if(cb) cb(res);

        this.driverSeaching = false;
      })
  }

  @action
  //Todo driverUnfollow()
  driverUnfollow(driverId, cb) {
    if(!driverId) return false;
    this.driverSeaching = true;

    this.api.get(`/drivers/search?q=id:${driverId}`)
      .then(res => {
        if (res.status === 200) {
          this.driverSearchResult = res.data;
          const userId = res.data.drivers.map(d => d.user_id)
          if(userId.length) {
            this.forceUnfollow(userId);
          }
        }
        if(cb) cb(res);

        this.driverSeaching = false;
      })
  }

  @action
  //Todo unfollow()
  unfollow(cb) {
    if(!this.topicSelected || !this.topicSelected.id) return false;
    this.following = true;

    this.api.patch(`/messenger/topics/${this.topicSelected.id}/unfollow`).then(res => {
      if(cb) {
        cb(res);
      }
      if(res.status === 200 || res.ok) {
        this.isFollow = false;
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
      }

      this.following = false;
    });
  }

  @action
  //Todo assignFollower()
  assignFollower(topicId, userIds, cb) {
    this.following = true;

    this.api.patch(`/messenger/topics/${topicId}/unfollow`, {
      "body": userIds
    }).then(res => {
      if(cb) {
        cb(res);
      }

      this.following = false;
    });
  }

  @action
  //Todo closeTopic()
  closeTopic(cb) {
    if(!this.topicSelected || !this.topicSelected.id) return false;
    this.closing = true;

    this.api.patch(`/messenger/topics/${this.topicSelected.id}/close`).then(res => {
      if(cb) cb(res);
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
        this.loadSingleTopic();
      }
    });

    this.closing = false;
  }

  @action
  //Todo openTopic()
  openTopic(cb) {
    if(!this.topicSelected || !this.topicSelected.id) return false;
    this.opening = true;

    this.api.patch(`/messenger/topics/${this.topicSelected.id}/open`).then(res => {
      if(cb) cb(res);
      if(res.status === 200 || res.ok) {
        this.topicSelected = res.data;
        this.topicSelectedId = this.topicSelected.id;
        this.loadSingleTopic();
      }
    });

    this.opening = false;
  }

  @action
  //Todo getDispatchers()
  getDispatchers(cb) {
    this.userListing = true;

    this.api.post(`/users/dispatchers`).then(res => {
      if(res.status === 200 || res.ok) {
        this.dispatchers = _.sortBy(res.data, [function(m){ return m.id }]);
      }
      if(cb) cb(res);
      this.userListing = false;
    })
  }

  @action
  //Todo getAdmins()
  getAdmins(cb) {
    this.userListing = true;
    this.api.post(`/users/admins`).then(res => {
      if(res.status === 200 || res.ok) {
        this.admins = _.sortBy(res.data, [function(m){ return m.id }]);
      }
      if(cb) cb(res);
      this.userListing = false;
    })
  }

  @action
  //Todo getDrivers()
  getDrivers(cb) {
    this.userListing = true;
    this.api.get(`/drivers/search?size=1000`).then(res => {
      if(res.status === 200 || res.ok) {
        const drivers = res.data.drivers.map(d => {
          d.id = d.user_id;
          delete d.user_id;
          return d;
        });

        this.drivers = _.sortBy(drivers, [function(m){ return m.id }]);
      }
      if(cb) cb(res);
      this.userListing = false;
    })
  }

  @observable users = [];
  //Todo getAdminDispatcher
  @action
  getAdminDispatcher(cb) {
    this.userListing = true;

    this.api.post(`/users/admins_or_dispatchers`).then(res => {
      if(res.ok || res.status === 200) {
        this.users = res.data;
      }

      if(cb) cb(res);

      this.userListing = false;
    });
  }

  @action
  //Todo getDriverInfo()
  getDriverInfo(driverId = null, cb) {
    if(!driverId) return false;

    this.api.get(`/drivers/search?size=1&q=id:${driverId}`).then(res => {

      if(res.status === 200 || res.ok) {
        this.assignmentInfoInTopicSelected = {
          driver: res.data.drivers[0]
        }
      }

      if(cb) cb(res);
    })
  }

  @observable loadingDriver = false;
  @action
  //Todo getDriverByIds
  getDriverByIds(ids = [], cb = () => {}) {
    if(!ids.length) return;

    this.loadingDriver = true;

    return this.api.post(`/users/drivers`, ids).then(res => {
      if((res.status === 200 || res.ok) && res.data.length) {
        // this.assignmentInfoInTopicSelected = Object.assign(this.assignmentInfoInTopicSelected, {['driver']: res.data[0].driver})
        this.loadingDriver = false;
      }

      if(cb) cb(res);
    });
  }

  @action
  //Todo setDate()
  setDate(dateTime) {
    if(!dateTime) return false;

    this.dateRanger = dateTime;
  }

  @action
  //Todo setmarkedAllViewed()
  setmarkedAllViewed(cb) {
    if(!this.messengers.length || this.markedAllViewed) return false;

    this.marking = true;
    const messengerIds = this.messengers.map(m => m.id);

    this.api.put(`/messenger/messages/mark_as_viewed`, messengerIds).then(res => {
      this.marking = false;
      if(res.status === 200 || res.ok) {
        this.markedAllViewed = true;
        this.messagesEmbedded = true;
        this.loadSingleTopicById()
      } else {
        this.markedAllViewed = false;
      }

      if(cb) cb(res);
    });
  }

  @action
  //Todo MarkedAllViewed no need Ids
  markAllViewed(topicId = null , cb) {
    if(!topicId && !this.topicSelectedId && !this.topicSelected) return false;

    const topic_id = topicId || this.topicSelectedId || this.topicSelected.id;

    this.marking = true;
    this.api.put(`messenger/topics/${topic_id}/mark_as_viewed`).then(res => {
      if(cb) cb(res);

      this.marking = false;

      if(res.ok || res.status === 204 || res.status === 200) {
        this.markedAllViewed = true;
      } else {
        this.markedAllViewed = false;
      }
    });
  }

  @action
  //Todo assignmentConverstationSummary()
  assignmentConverstationSummary(params = [], cb) {
    this.assignmentSummaryLoading = true;

    const assignmentSummaries = this.api.post(`/messenger/assignment_conversation/summary`, params).then(res => {
      if(res.status === 200 || res.ok) {
        this.assignmentSummaries = res.data;
      }

      this.assignmentSummaryLoading = false;

      if(cb) cb(res);

      return res.data;
    });

    return assignmentSummaries;
  }

  set_AAS_Query_filter(value) {
    this.AASummeriesQuery = value;
  }

  get_AAS_Query_filter() {
    return this.AASummeriesQuery;
  }

  setActiveAssignmentQuery(value) {
    this.AA_Query = value;
  }

  getActiveAssignmentQuery() {
    return this.AA_Query;
  }

  @action
  //Todo activeAssignmentSummery()
  activeAssignmentSummery(cb) {
    this.loadingactiveAssignmentSummaries = true;
    const query = this.get_AAS_Query_filter();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/active_assignment_conversation/summary`, params).then(res => {
      if(cb) cb(res);

      if(res.status === 200 || res.ok) {
        this.activeAssignmentSummaries = Object.assign(this.activeAssignmentSummaries, {[query.section]: res.data});
      }

      this.loadingactiveAssignmentSummaries = false;
    });
  }

  @observable assignmentLoading = false;

  @action
  //Todo getAssignmentInfo()
  getAssignmentInfo(assignmentId = null, cb) {

    if(!assignmentId && !this.selectedAssignmentId) return false;

    this.assignmentLoading = true;

    const assignment_id = assignmentId || this.selectedAssignmentId;

    this.api.get(`/assignments/${assignment_id}/detail?show_soft_deleted=true`).then(res => {
      if(res.status === 200 || res.ok) {
        if(res.data) {
          this.assignmentInfoInTopicSelected = this.processAssignmentDetail(res.data);
        }
        this.assignmentLoading = false;
      }
      if(cb) cb(res);
    })
  }

  //Todo getFollowActiveAssignment
  @action
  getFollowActiveAssignment(cb) {
    this.AA_FollowLoading = true;

    const query = this.getActiveAssignmentQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/extract/active/following`, params).then(res => {
      if(cb) cb(res);

      if(res.data === 200 || res.ok) {
        this.AA_Following = res.data;
      }

      this.AA_FollowLoading = false;
    });
  }

  //Todo getAttendedActiveAssignment
  @action
  getAttendedActiveAssignment(cb) {
    this.AA_AttendedLoading = true;

    const query = this.getActiveAssignmentQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/extract/active/attended`, params).then(res => {
      if(cb) cb(res);

      if(res.data === 200 || res.ok) {
        this.AA_Attended = res.data;
      }

      this.AA_AttendedLoading = false;
    });
  }

  //Todo getUnattendedActiveAssignment
  @action
  getReadUnattendedActiveAssignment(cb) {
    this.AA_ReadUnattendedLoading = true;

    const query = this.getActiveAssignmentQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/extract/active/unattended/read`, params).then(res => {
      if(cb) cb(res);

      if(res.data === 200 || res.ok) {
        this.AA_ReadUnattended = res.data;
      }

      this.AA_ReadUnattendedLoading = false;
    });
  }

  //Todo getUnattendedActiveAssignment
  @action
  getUnreadUnattendedActiveAssignment(cb) {
    this.AA_UnreadUnattendedLoading = true;

    const query = this.getActiveAssignmentQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/extract/active/unattended/unread`, params).then(res => {
      if(cb) cb(res);

      if(res.data === 200 || res.ok) {
        this.AA_UnreadUnattended = res.data;
      }

      this.AA_UnreadUnattendedLoading = false;
    });
  }

  //Todo getUnattendedActiveAssignment
  @action
  getAllUnattendedActiveAssignment(cb) {
    this.AA_UnattendedLoading = true;

    const query = this.getActiveAssignmentQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/extract/active/unattended/all`, params).then(res => {
      if(cb) cb(res);

      if(res.data === 200 || res.ok) {
        this.AA_Unattended = res.data;
      }

      this.AA_UnattendedLoading = false;
    });
  }

  // General Solving
  @observable generalSolving = [];
  @observable generalSolvingLoading = false;
  // General Solved
  @observable generalSolved = [];
  @observable generalSolvedLoading = false;
  // General Unsolved
  @observable generalUnsolve = [];
  @observable generalUnsolveLoading = false;
  // Query
  @observable GS_Query = {
    'start_ts': '',
    'end_ts': '',
    'page_number': 1,
    'page_size': 20,
  }

  //Todo setGeneralSupportQuery
  @action
  setGeneralSupportQuery(query) {
    this.GS_Query = Object.assign(this.GS_Query, query);
  }

  //Todo getGeneralSupportQuery
  @action
  getGeneralSupportQuery() {
    return this.GS_Query;
  }

  //Todo generalLoadSolving
  @action
  getGeneralSolving(cb) {
    this.generalSolvingLoading = true;

    const query = this.getGeneralSupportQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/extract/general/solving`, query).then(res => {
      if(res.ok || res.status === 200) {
        this.generalSolving = res.data;

        if(cb) cb(res);
      }

      this.generalSolvingLoading = false;
    });
  }

  //Todo generalLoadSolved
  @action
  getGeneralSolved(cb) {
    this.generalSolvedLoading = true;

    const query = this.getGeneralSupportQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    return this.api.get(`/messenger/topics/extract/general/solved`, params).then(res => {
      if(res.ok || res.status === 200) {
        this.generalSolved = res.data;

        if(cb) cb(res);
      }

      this.generalSolvedLoading = false;

      return res;
    }).then(res => res);
  }

  //Todo generalLoadSolving
  @action
  getGeneralUnsolved(cb) {
    this.generalUnsolveLoading = true;

    const query = this.getGeneralSupportQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/extract/general/unsolved`, params).then(res => {
      if(res.ok || res.status === 200) {
        this.generalSolving = res.data;

        if(cb) cb(res);
      }

      this.generalUnsolveLoading = false;
    });
  }

  @observable solving = false;

  //Todo solve
  @action
  solve(topicId = null, cb = () => {}) {
    if(!topicId || !this.topicSelectedId) return false;

    this.solving = true;

    this.api.patch(`/messenger/topics/${topicId}/solve`).then(res => {
      if(res.ok || res.status === 200) {
        this.topicSelected = res.data;
        if(cb) cb(res);
      }

      this.solving = false;
    })
  }

  //Todo solve
  @action
  unsolve(topicId = null, cb = () => {}) {
    if(!topicId || !this.topicSelectedId) return false;

    this.solving = true;

    this.api.patch(`/messenger/topics/${topicId}/unsolve`).then(res => {
      if(res.ok || res.status === 200) {
        this.topicSelected = res.data;
        if(cb) cb(res);
      }

      this.solving = false;
    })
  }

  //Todo loadTopic
  @action
  externaLloadTopic(topicId = null, cb = () => {}) {
    this.api.get(`/messenger/topics/${topicId}`).then(res => {
      if(cb) cb(res);
    });
  }

  // General support search
  @observable generalSearching = false;
  @observable generalSearchQuery = {
    q: 'id:2',
    status: 'OPEN',
    ref_type: 'DRIVER_GENERAL_SUPPORT'
  }

  //Todo setGeneralSearchQuery
  setGeneralSearchQuery(value) {
    this.generalSearchQuery = value;
  }

  //Todo getGeneralSearchQuery
  getGeneralSearchQuery(value) {
    return this.generalSearchQuery;
  }

  //Todo generalSearch()
  @action
  generalSearch(cb) {
    const query = this.getGeneralSearchQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/search`, params).then(res => {
      if(cb) cb(res);
    });
  }

  // Active assignment search
  @observable activeSearching = false;
  @observable activeSearchQuery = {
    q: 'id:186244',
    status: 'OPEN',
    ref_type: 'ASSIGNMENT_CONVERSATION'
  }

  //Todo setGeneralSearchQuery
  setActiveSearchQuery(value) {
    this.activeSearchQuery = value;
  }

  //Todo getGeneralSearchQuery
  getActiveSearchQuery(value) {
    return this.activeSearchQuery;
  }

  //Todo generalSearch()
  @action
  activeSearch(cb) {
    const query = this.getActiveSearchQuery();

    let params = new URLSearchParams();

    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/topics/search`, params).then(res => {
      if(cb) cb(res);
    });
  }

  @observable logging = false;
  @observable activities = [];
  @observable activityQuery = {
    topic_id: null
  };

  //Todo activityLogs()
  @action
  getActivityLogs(topicId = null, cb = () => {}) {
    if(!topicId && !this.topicSelectedId) return;

    this.logging = true;

    const query = {
      topic_id: topicId
    };
    let params = new URLSearchParams();
    Object.keys(query).map(t => {
      params.append(t, query[t]);
    });

    this.api.get(`/messenger/activity_logs`, params).then(res => {
      if(cb) cb(res);

      if(res.ok || res.status === 200) {
        this.activities = res.data;
      }
    })
  }

  @observable showingStopTypes = ['DROP_OFF', 'RETURN'];
  @observable filter;

  @computed
  get filteredShowingStops() {
    if (!this.assignmentInfoInTopicSelected || !this.assignmentInfoInTopicSelected.stops)
      return []

    const stops = this.assignmentInfoInTopicSelected.stops
      .filter(s => this.showingStopTypes.indexOf(s.type) >= 0)

    // filter
    if (this.filter) {
      const searchFields = [
        "label.driver_label",
        "shipment.customer.name",
        "shipment.customer.phone_number",
        "shipment.customer.email",
        "shipment.dropoff_address.street",
        "shipment.dropoff_address.city",
        "shipment.dropoff_address.state",
        "shipment.dropoff_address.zipcode",
        "shipment.internal_id",
        "shipment.delivery_items",
        "shipment.tracking_code",
      ];
      return stops.filter(s => searchInObject(s, this.filter, "i", searchFields))
    }

    return stops;
  }

  @observable stopSelected = null;

  @action
  setStopSelected = (stop) => {
    this.stopSelected = stop;
  };

  @observable addressSearchResults = [];
  @observable addressSearchFilter = {
    "from": 0,
    "size": 10,
    "q": "",
    "filters": {},
    "sorts": [
      "-dropoff_earliest_ts"
    ]
  };

  @action
  searchAddress(cb) {
    const keywordIgnoreWord = this.addressSearchFilter.q.replaceAll(/[^a-zA-Z0-9-\s]/ig, '');
    const params = Object.assign({}, this.addressSearchFilter, {q: keywordIgnoreWord});

    this.api.post(`/shipments/search`, params).then(res => {
      if(res.status === 200 && res.ok && res.data && res.data.results) {
        this.addressSearchResults = res.data.results;
      }
      if(cb)
        cb(res);
    })
  }

  @observable pods = [];
  @action
  loadPodsByStop(cb) {
    if(!this.stopSelected) return;

    this.api.get(`/stops/${this.stopSelected.id}/pod`).then(res => {
      if(res.status === 200 && res.ok && res.data) {
        this.pods = res.data;
      }
    });
  }

  @action
  sendLink({title = null, url = null}, cb) {
    if(!this.topicSelectedId || !title || !url) return;

    const body = { title, url, topic_id: this.topicSelectedId };

    this.api.post(`/messenger/messages/share_link?minified=false`, body).then(res => {
      if(cb) cb(res)
    })
  }

  @action
  removeMessage(messageId, cb) {
    if(!messageId){
      return;
    }
    console.log('this', this);
    this.api.delete(`/messenger/messages/${messageId}`).then(res => {
      if(cb) cb(res)
    });
  }
}
