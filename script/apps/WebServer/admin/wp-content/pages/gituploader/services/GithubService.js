angular.module('GitUploader.GithubService', ['satellizer'])
    .config(function ($authProvider) {
        $authProvider.github({
            url: "/TempGithub",
            clientId: '44ed8acc9b71e36f47d8',
            redirectUri: window.location.origin + '/GitUploader',
        });
    })
    .service("GithubService", ['$http', '$auth', function ($http, $auth, $uibModalInstance) {
        this.githubApi = "https://api.github.com/";
        this.getUsername = function (callback) {
            var uri = this.githubApi + 'user?access_token=' + $auth.getToken()
            $http.get(uri).then(function (response) {
                if (callback) {
                    callback(response.data);
                }
            });
        }
        this.fetchRepos = function (callback) {
            this.getUsername();
            var uri = this.githubApi + "user/repos?access_token=" + $auth.getToken();
            uri += "&type=owner";
            $http.get(uri).then(function (response) {
                if (callback) {
                    callback(response.data);
                }
            });
        }
        this.login = function (callback) {
            var provider = "github";
            $auth.authenticate(provider)
             .then(function () {
                 if (callback) {
                     callback($auth);
                 }
             })
             .catch(function (error) {
             });
        }
    }])

