angular.module('GitUploader_App', ['ngStorage', 'ui.grid', 'GitUploader.GithubService', 'satellizer', 'ui.bootstrap'])
.component("gituploaderMain", {
	//component directive
    templateUrl: "/wp-content/pages/gituploader/templates/GitUploaderTemplate.html",
    controller: function ($scope, $http, $interval, GithubService, $auth, $uibModal ) {
        if (Page)
            Page.ShowSideBar(false);
        $scope.initGrid = function () {
            $scope.gridOptions = {
                enableSorting: true,
                columnDefs: [
                      { field: 'id' },
                      { field: 'filename' },
                      { field: 'filesize' },
                      { field: 'createdate' },
                      { field: 'writedate' }
                ]
            };
        }
        
		$scope.userName = "";
       
        $scope.getWorldDir = function () {
            var url = "ajax/GitUploader?action=gituploader_get_world_dir";
            $http.get(url).then(function (response) {
                $scope.world_dir = response.data.world_dir;
                $scope.loadFiles();
            });
        }
        $scope.loadFiles = function (id) {
            if (!id) {
                id = "";
            }
            var max_files_level = 1000;
            var url = "ajax/GitUploader?action=gituploader_get_world_files&id=" + id + "&max_files_level=" + max_files_level;
            $http.get(url).then(function (response) {
                $scope.gridOptions.data = response.data;
            });
        }
        $scope.fetchRepos = function () {
            GithubService.fetchRepos(function (data) {
                $scope.response_data = data.length;
            });
        }
        $scope.login = function () {
            GithubService.login(function () {
                var token = $auth.getToken();
                $scope.response_data = token;
				$scope.getUsername();
            });
        }
        $scope.getUsername = function () {
            GithubService.getUsername(function (data) {
                $scope.userName = data.login;
            });
        }
        
        $scope.initGrid();
        $scope.getWorldDir();

		//custom code
		$scope.newRepos = function(){
			 GithubService.newRepos(function (data) {
                $scope.response_data = data;
            });
		}

		$scope.delRepos = function(){
			 GithubService.delRepos(function (data) {
                $scope.response_data = data;
            });
		}

		$scope.foo = function(){
			//alert($scope.gridOptions.data.length);
			for(var i=0; i < $scope.gridOptions.data.length; i++){
				GithubService.upload($scope.gridOptions.data[i].filename, $scope.gridOptions.data[i].file_content, function (data) {
					$scope.response_data = data;
				});
			}
			
		}

		$scope.uploadPage = function(){
			$uibModal.open({
				templateUrl: "/wp-content/pages/gituploader/templates/uploadPage.html",
				controller: "uploadCtrl",
			});
			
		}
    }
	
})

.controller('uploadCtrl', function($scope, $uibModalInstance, GithubService, $http){
	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};

	$scope.css = "{'border':" + 2 + "px;}";

	$scope.userReops = new Array();
	$scope.newReposName = "";
	$scope.uploadPath = "";
	$scope.str = 'upload to ';
	$scope.loginUser = "";
	$scope.progressText = "";

	$scope.getLoginUser = function(){
		GithubService.getUsername(function(data){
			$scope.loginUser = data.login;
		});
	};
	$scope.getLoginUser();
	

	$scope.getRepos = function(){
		GithubService.fetchRepos(function (data){
			for(var i = 0; i < data.length; i++){
				$scope.userReops.push(data[i].name);
			}
		});
	};
	$scope.getRepos();


	$scope.newRepos = function(){
		var tplReposName = $scope.newReposName;
		if(tplReposName != ""){
			var isExist = $scope.userReops.indexOf(tplReposName);
			if(isExist == -1){
				$scope.userReops.push(tplReposName);
				GithubService.newRepos(tplReposName);
			}else{
				alert("the repos name you entered has existed!");
			}
			
		}else{
			alert('please enter new repos name!!!');
		}
		
	};

	$scope.test = function(x){
		$scope.uploadPath = x;
		var aLi = document.getElementsByClassName('reposList');
		for(var i = 0; i < aLi.length; i++){
			if(aLi[i].innerHTML == "/"+x){
				aLi[i].style.background = '#b15fff';
			}else{
				aLi[i].style.background = '#e0e0e0';
			}
		}
	};
	

	$scope.loadFiles = function (id) {
		if (!id) {
			id = "";
		}
		var max_files_level = 1000;
		var url = "ajax/GitUploader?action=gituploader_get_world_files&id=" + id + "&max_files_level=" + max_files_level;
		$http.get(url).then(function (response) {
			$scope.gridOptions = response.data;
		});
	}
	$scope.loadFiles();
	
	$scope.info = 0;
	$scope.upload = function(){
		//alert($scope.gridOptions.length);
		if($scope.uploadPath == ""){
			alert("please select upload path!");
		}else{
			//GithubService.upload_($scope.loginUser, $scope.uploadPath, "sss2.txt", "bHpxbHpxbHpx");
			//GithubService.upload_($scope.loginUser, $scope.uploadPath, $scope.gridOptions[i].filename, $scope.gridOptions[i].file_content)
			var num = "";
			var finishedCount = 0; 
			var curFileIndex = 0;
			var totalCount = $scope.gridOptions.length;
			var updateProgress = function(text){
				$scope.progressText = text || (finishedCount + "/" + totalCount);
			}
			var uploadOne = function(){
				if(curFileIndex < totalCount)
				{
					var item = $scope.gridOptions[curFileIndex];
					curFileIndex+=1;
					if(item){
						GithubService.upload($scope.loginUser, $scope.uploadPath, item.filename, item.file_content, function(bSuccess){
							if(bSuccess){
								finishedCount += 1;
								if(finishedCount == totalCount)
								{
									alert('upload successfully!');
									$scope.cancel();
									//updateProgress("All Done!");
								}
								else{
									uploadOne();
								}
								updateProgress();
							}else{
								GithubService.getContent($scope.loginUser, $scope.uploadPath, item.filename, function(bIsGetContent){
									if(bIsGetContent != 'false'){
										GithubService.update($scope.loginUser, $scope.uploadPath, item.filename, item.file_content, bIsGetContent.sha, function(bIsUpdate){
											if(bIsUpdate){
												finishedCount += 1;
												if(finishedCount == totalCount){
													alert('upload successfully!');
													$scope.cancel();
													//updateProgress("All Done!");
												}else{
													uploadOne();
												}
												updateProgress(item.filename+" updated! "+finishedCount + "/" + totalCount);
											}else{
												updateProgress("failed to upload "+ item.filename);
											}
										});
									}else{
										updateProgress("failed to upload "+ item.filename);
										alert('upload progress failed, please try again later!');
									}
								});
							}
							
						});
					}
				}
			};
			
			uploadOne();
			updateProgress();
			// for(var i = 0; i < 2*$scope.gridOptions.length; i++){
			// 		GithubService.upload($scope.loginUser, $scope.uploadPath, $scope.gridOptions[i].filename, $scope.gridOptions[i].file_content, function(data){
			// 			if(data){
			// 				$scope.info = $scope.info + 1;
			// 				console.log($scope.info);
			// 			}else{
			// 				$scope.info = $scope.info + 0;
			// 				console.log($scope.info);
			// 			}

			// 			($scope.info == $scope.gridOptions.length) ? (this.break, $scope.cancel(), alert('upload successfully!')) : this.continue;
			// 		});
			// }

		}
	};
	
})
