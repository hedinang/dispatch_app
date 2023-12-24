# axlehire-dispatcher-app

Generate your auth key by run echo -n 'your_nexus_username:your_nexus_password' | openssl base64
Create (or edit if it exist) ~/.npmrc
Input contents:
  registry=https://nexus.axlehire.com/repository/npm-group/
  _auth=your_above_auth_key
  email=your_email

If you run project has error. Please follow step:
 1. delete folder node_modules (macos: rm -rf node_modules)
 2. roll back package-lock.json as same as package-lock.json in DEV branch
 3. Run npm install (yarn install --force)
