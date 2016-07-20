##oAuth :
1. send request GET https://github.com/login/oauth/authorize/client_id=44ed8acc9b71e36f47d8$redirecturi=127.0.0.1
2. get code
3. sned request GET https://github.com/login/oauth/access_token?client_id=xxxx&client_secret=xxx&code=xxx&redirect_uri=xxxx
4. get token
5. https://api.github.com/user?access_token=xxx

[click the url https://github.com/login/oauth/authorize?scope=user:email&client_id=44ed8acc9b71e36f47d8] (https://github.com/login/oauth/authorize?scope=user:email&client_id=44ed8acc9b71e36f47d8)
