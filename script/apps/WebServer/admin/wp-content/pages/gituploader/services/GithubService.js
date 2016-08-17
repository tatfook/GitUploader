angular.module('GitUploader.GithubService', ['satellizer'])
    .config(function ($authProvider) {
        $authProvider.github({
            url: "/TempGithub",
            clientId: '44ed8acc9b71e36f47d8',
            redirectUri: window.location.origin + '/GitUploader',
			scope: ["public_repo", "delete_repo"], 
        });
    })
    .service("GithubService", ['$http', '$auth', function ($http, $auth, $uibModalInstance) {
        this.githubApi = "https://api.github.com/";
        this.getUsername = function (callback) {
            var uri = this.githubApi + 'user?access_token=' + $auth.getToken();
            $http.get(uri).then(function (response) {
                if (callback) {
                    callback(response.data);
                }
            });
        }
        this.fetchRepos = function (callback) {
            //this.getUsername();
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

		
		//custom code
		/*
		this.newRepos = function(callback){
			var reposName = 'newRepos';
			//this.getUsername();
			var uri = this.githubApi + "user/repos?access_token=" + $auth.getToken();
			uri += "&type=owner";

			//$auth.authenticate('github');
			$http({
				method: 'POST',
				url: uri,
				data: {
					'name': reposName, 
					'description': 'This is your first repository'
				}
			}).then(function (response){
				response.headers('Authorization: token S3CR3T');
				 if (callback) {
                     callback(response.data);
                 }
			});
		}
		*/

		this.newRepos = function(reposName){
			var uri = this.githubApi + "user/repos?access_token=" + $auth.getToken();
			uri += "&type=owner";

			$http({
				method: 'POST',
				url: uri,
				data: {
					'name': reposName, 
					'description': 'new repository'
				}
			}).success(function (response){
				alert("new repos successfully!");
			});
		}

		this.delRepos = function(callback){

			var uri = this.githubApi + "repos/test1?access_token=" + $auth.getToken();
			$http.delete(uri).then(function(response){
				if (callback) {
                     callback(response.data);
                 }
			});
			
		}

		/*
		this.upload = function(fileName, fileContent){

			var uri = this.githubApi + "repos/Xuntian/newRepos/contents/"+fileName+"?access_token=" + $auth.getToken();
			$http({
				method: 'PUT',
				url: uri,
				data: {
					'committer': {'name': 'LiZhiqiang', 'email': 'li.zq@foxmail.com', },
					'message': 'commit checked',
					'content': fileContent
				}
			}).then(function(response){
				if (callback) {
                     callback(response.data);
                 }
			});
		}
		*/

		this.upload = function(loginUser, reposName, fileName, fileContent, callback){

			var uri = this.githubApi + "repos/"+loginUser+"/"+reposName+"/contents/"+fileName+"?access_token=" + $auth.getToken();
			$http({
				method: 'PUT',
				url: uri,
				data: {
					'message': 'file upload',
					'content': fileContent
				}
			}).then(function(response){
				if (callback) {
                     callback(true);
                 }
			}).catch(function(response){
				if(callback){
					callback(false);
				}
			});
		}

    }])

