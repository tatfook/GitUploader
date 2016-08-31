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
	$scope.str = 'sync to ';
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

	

	$scope.sync = function(){
		if ($scope.uploadPath == "")
		{
			alert("please select upload path!");
		}else{
			$scope.progressText = 'getting file sha list...';
			
			var curUploadIndex = 0;
			var totalUploadIndex = $scope.gridOptions.length;
			var uploadOne = function(){
				//$scope.progressText = 'uploading file to github...';
				if(curUploadIndex < totalUploadIndex){
					if($scope.gridOptions[curUploadIndex].needUpload){
						GithubService.upload($scope.loginUser, $scope.uploadPath, $scope.gridOptions[curUploadIndex].filename, $scope.gridOptions[curUploadIndex].file_content, function(bIsUpload){
							if(bIsUpload){
								$scope.progressText = $scope.gridOptions[curUploadIndex].filename + ' upload successfully...' + (curUploadIndex + 1) + '/' + totalUploadIndex;
									curUploadIndex += 1;
									if(curUploadIndex >= totalUploadIndex){
										alert('sync successfully!');
										$scope.cancel();
									}else{
										uploadOne();
									}
							}else{
								alert($scope.gridOptions[curUploadIndex].filename + ' upload failed, please try again later...');
							}
						});
					}else{
						curUploadIndex += 1;
						if(curUploadIndex >= totalUploadIndex){
							alert('sync successfully!');
							$scope.cancel();
						}else{
							uploadOne();
						}
					}
				}
			}

			//get sha value of the files in github
			GithubService.getFileShaList($scope.loginUser, $scope.uploadPath, function(returnInfo){
				if (returnInfo != 'false')            //if success, then update files
				{
					$scope.progressText = 'get remote file sha list successfully...';
					var aLocalFileName = new Array();
					for (var i = 0; i < $scope.gridOptions.length; i++){
						aLocalFileName[i] = $scope.gridOptions[i].filename;
					}
					$scope.progressText = 'get lcoal file list successfully...';

					var curIndex = 0;
					var totalIndex = returnInfo.tree.length;
					var updateOne = function(){              //update files had existed in github one by one
						if(curIndex < totalIndex){
							var bIsExisted = aLocalFileName.indexOf(returnInfo.tree[curIndex].path);
							//compare the files in github with the ones in local host
							if(bIsExisted > -1){
								// if existed, 
								$scope.gridOptions[bIsExisted].needUpload = false;
								if($scope.gridOptions[bIsExisted].sha1 != returnInfo.tree[curIndex].sha){
									//if file existed, and has different sha value, update it
									GithubService.update($scope.loginUser, $scope.uploadPath, returnInfo.tree[curIndex].path, $scope.gridOptions[bIsExisted].file_content, returnInfo.tree[curIndex].sha, function(bIsUpdate){
										if(bIsUpdate){
											$scope.progressText = returnInfo.tree[curIndex].path + ' update successfully...' + (curIndex + 1) + '/' + totalIndex;
											curIndex += 1;
											if(curIndex >= totalIndex){      //check whether all files have updated or not. if false, update the next one, if true, upload files.  
												$scope.progressText = 'all file update successfully...';
												uploadOne();
											}else{
												updateOne();
											}
											
										}else{
											alert(returnInfo.tree[curIndex].path + ' update failed, please try again later...');
										}
									});
								}else{
									//if file exised, and has same sha value, then contain it
									$scope.progressText = returnInfo.tree[curIndex].path + ' has existed...' + (curIndex + 1) + '/' + totalIndex;
									curIndex += 1;
									if(curIndex >= totalIndex){     //check whether all files have updated or not. if false, update the next one, if true, upload files.
										$scope.progressText = 'all file update successfully...';
										uploadOne();
									}else{
										updateOne();
									}
								}
							}else{
								//if file does not exist, delete it
								if(returnInfo.tree[curIndex].type == 'blob'){
									GithubService.delete($scope.loginUser, $scope.uploadPath, returnInfo.tree[curIndex].path, returnInfo.tree[curIndex].sha, function(bIsDelete){
										if(bIsDelete){
											
											$scope.progressText = returnInfo.tree[curIndex].path + ' delete successfully...' + (curIndex + 1) + '/' + totalIndex;
											curIndex += 1;
											if(curIndex >= totalIndex){   //check whether all files have updated or not. if false, update the next one, if true, upload files.
												$scope.progressText = 'all file update successfully...';
												uploadOne();
											}else{
												updateOne();
											}
										}else{
											alert('delete ' + returnInfo.tree[curIndex].path + ' failed, please try again later...');
										}
									});
								}else{
									$scope.progressText = returnInfo.tree[curIndex].path + 'has existed...' + (curIndex + 1) + '/' + totalIndex;
									curIndex += 1;
									if(curIndex >= totalIndex){   //check whether all files have updated or not. if false, update the next one, if true, upload files.
										$scope.progressText = 'all file update successfully...';
										uploadOne();
									}else{
										updateOne();
									}
								}
								
							}							


							
						}
					}
					
					updateOne();

				}else{
					//if the repos is empty, then upload files 
					uploadOne();
				}
			});
		}
	};

	/*

	$scope.upload_ = function(){
		if($scope.uploadPath == ""){       
			alert("please select upload path!");
		}else{

			var num = "";
			var finishedCount = 0; 
			var curFileIndex = 0;
			var totalCount = $scope.gridOptions.length;
			var updateProgress = function(text){
				$scope.progressText = text || (finishedCount + "/" + totalCount);
			}

			//function: upload one by one 
			var uploadOne = function(){
				if(curFileIndex < totalCount){

					// get the current file object to upload by index
					var item = $scope.gridOptions[curFileIndex];
					curFileIndex+=1;     //current file object index increase
					if(item){    //current file object is not undefined
						GithubService.upload($scope.loginUser, $scope.uploadPath, item.filename, item.file_content, function(bSuccess){
							if(bSuccess){             //upload successfully then upload the next one 
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
							}else{                 //uploading failure info states the file existed, then determine whether to update or not
								var str_path = item.filename.split("/");
								var path = 'master';
								for (var i = 0; i < str_path.length - 1; i++){
									path = path + ":" + str_path[i];
								}
								//get the file sha value
								GithubService.getTree($scope.loginUser, $scope.uploadPath, path, function(bIsGetContent){
									
									if(bIsGetContent != 'false' && bIsGetContent.sha != item.sha1){
										//get file sha value successfully and remote file sha value is not equal local file sha value, it means the file need to update

										GithubService.update($scope.loginUser, $scope.uploadPath, item.filename, item.file_content, bIsGetContent.sha, function(bIsUpdate){
											if(bIsUpdate){       //file update successfully, then current file index increase and upload the next one.
												finishedCount += 1;
												if(finishedCount == totalCount){
													alert('upload successfully!');
													$scope.cancel();
													//updateProgress("All Done!");
												}else{
													uploadOne();
													
												}
												updateProgress(item.filename+" updated! "+finishedCount + "/" + totalCount);
											}else{            //file update failed, prompt failing infomation to user.
												updateProgress("failed to upload "+ item.filename);
												alert('upload progress failed, please try again later!');
											}
										});
									}else if(bIsGetContent != 'false' && bIsGetContent.sha == item.sha1){
										//get file sha value successfully and remote file sha value is equal local file sha value, it means the file does not need to update.
										//upload the next one.

										finishedCount += 1;
										if(finishedCount == totalCount){
											alert('upload successfully!');
											$scope.cancel();
										}else{
											uploadOne();
											
										}
										updateProgress(finishedCount + "/" + totalCount);

									}else{     //get file sha value fail, prompt failing infomation to user.
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

		}
	};
	*/
	
})
