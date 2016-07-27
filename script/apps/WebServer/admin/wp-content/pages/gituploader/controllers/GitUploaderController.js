angular.module('GitUploader_App', ['ngStorage', 'ui.grid', 'GitUploader.GithubService', 'satellizer'])
.component("gituploaderMain", {
    templateUrl: "/wp-content/pages/gituploader/templates/GitUploaderTemplate.html",
    controller: function ($scope, $http, $interval, GithubService, $auth) {
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
                $scope.response_data = data;
            });
        }
        $scope.login = function () {
            GithubService.login(function () {
                var token = $auth.getToken();
                $scope.response_data = token;
            });
        }
        $scope.getUsername = function () {
            GithubService.getUsername(function (data) {
                $scope.response_data = data;
            });
        }
        
        $scope.initGrid();
        $scope.getWorldDir();
    }
})
