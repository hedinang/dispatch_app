import app from 'firebase/app';
import * as firebase from "firebase";
import { firebaseConfig, usePublicVapidKey } from '../../firebase-config';

class Firebase {
  constructor() {
    if (!firebase.apps.length) {
      app.initializeApp(firebaseConfig);
    }

    this.messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;
    
    this.requesting = true;
    this.token = null;
    this.permission = null;
    this.initFirebaseMessage();    
  }

  initFirebaseMessage = async() => {    
    if(this.messaging) {                
      this.permissionRequest = Notification.requestPermission().then((result) => {  
        if (result === 'granted') {
          this.messaging.usePublicVapidKey(usePublicVapidKey);
        }
        
        this.permission = result;
        this.requesting = false;
      });            
    }
  }

  requestPermissionPushNotifications = async() => {
    try {
      // this.messaging = firebase.messaging.isSupported() ? firebase.messaging() : null;
      await Notification.requestPermission();
      if(this.messaging) {
        // await this.messaging.usePublicVapidKey(usePublicVapidKey);
        if (this.requesting) {
          await this.permissionRequest;
        }
        
        const token = await this.messaging.getToken();        
        this.token = token;

        return token;
      }

      return this.token;
    } catch (error) {      
      try {
        if (Notification.permission !== 'granted') {
          //alert("Notification is disabled on your browser. Please enable before use messenger.");
          Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
              alert("Notification enabled.")
            }
          });
        }        
      } catch (e) {
        console.error(e);
      }
      console.error(error);
    }
  };

  deleteToken() {
    if(!this.token) return false;

    return this.messaging.deleteToken(this.token);
  }

  onMessage = (cb) => this.messaging.onMessage(payload => {
    if(cb) {
      cb(payload)
    }
    return payload;
  });
}

export default Firebase;