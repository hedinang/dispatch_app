importScripts('https://www.gstatic.com/firebasejs/6.6.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.6.2/firebase-messaging.js');
// import './firebase-app';
// import './firebase-messaging';


// import { firebaseConfig } from 'src/firebase-config';

firebase.initializeApp({
  apiKey: "AIzaSyA4WCvx4WbZV5VGEmTJwRJ-Li9qsW5eU3U",
  authDomain: "driver-app-v2-staging.firebaseapp.com",
  databaseURL: "https://driver-app-v2-staging.firebaseio.com",
  projectId: "driver-app-v2-staging",
  storageBucket: "driver-app-v2-staging.appspot.com",
  messagingSenderId: "15562989744",
  appId: "1:15562989744:web:2b5c1613a6a4bac7605b75",
  measurementId: "G-MD194M3Q4Q"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  self.clients.matchAll({includeUncontrolled: true}).then(function (clients) {
    // console.log(clients);
    //you can see your main window client in this list.
    clients.forEach(function(client) {
      var data = {
        url: client.url,
        id: client.id,
        action: payload.data.action,
        message: payload.data.message || null,
        messenger_ref_id: payload.data.messenger_ref_id || null,
        messenger_topic_name: payload.data.messenger_topic_name || null,
        messenger_message_id: payload.data.messenger_message_id || null,
        messenger_topic_id: payload.data.messenger_topic_id || null,
        messenger_ref_type: payload.data.messenger_ref_type || null,
      }
      client.postMessage(data);
    })
  })
  // Customize notification here
  var notification = null;
  if(payload.data.notification) {
    notification = JSON.parse(payload.data.notification);
  } else if(payload.data.title) {
    notification = {
      title: payload.data.title,
      body: payload.data.message,
      icon: "https://axlehire.com/images/favicon.ico"
    }
  }

  if(notification) {
    const notificationTitle = notification.title;
    const notificationOptions = {
      body: notification.body,
      icon: notification.icon || "https://axlehire.com/images/favicon.ico"
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// self.addEventListener('notificationclick', function(event) {
//   console.log(event)
//   console.log(event.notification)
//   // event.notification.close();
//   event.waitUntil(
//     clients.openWindow(event.notification.data.url + "?notification_id=" + event.notification.data.id)
//   );
// })