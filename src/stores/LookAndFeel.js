import {observable, action} from 'mobx';

class LookAndFeelStore {
  @observable
  fullscreen = false;

  @observable
  isHideMainMenu = false;

  @observable
  currentPath;

  @action
  toggleFullScreen() {
    this.fullscreen = !this.fullscreen;
  }

  @action
  setCurrentPath(p) {
    this.currentPath = p
  }

  @action
  toggleMainMenu(){
    this.isHideMainMenu = !this.isHideMainMenu;
  }
}

export default LookAndFeelStore;
