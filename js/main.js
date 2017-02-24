/**
 * Created by ChenQiang on 2017/2/22.
 */
var app  = angular.module('app',['ui.router']);

app.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise('menu');
    $stateProvider
        .state('menu',{
            url:'/menu',
            templateUrl:'module/menu.html',
            controller:'menuController'
        })
        .state('menu.home',{
            url:'/home',
            templateUrl:'module/home.html',
            controller:'homeController'
        })
        .state('menu.follow',{
            url:'/follow',
            templateUrl:'module/follow.html',
            controller:'followController'
        })
        .state('menu.video',{
            url:'/video',
            templateUrl:'module/video.html',
            controller:'videoController'
        })
        .state('menu.me',{
            url:'/me',
            templateUrl:'module/me.html',
            controller:'meController'
        })
        .state('detail',{
            url:'/detail',
            templateUrl:'module/detail.html',
            controller:'detailController'
        });
}]);

app.controller('detailController', ['$scope', '$state', '$window', function($scope, $state, $window){
    $scope.goBack = function(){
        $window.history.back();
    }
}]);

app.controller('menuController', ['$scope', '$state', function($scope, $state){
    $state.go('menu.home');
}]);

app.controller('homeController', ['$scope', '$http', function($scope, $http){

    $scope.currentPage = 0;
    $scope.data = [];

    var data = {};

    getData();

    $scope.loadMore = function(){
        $scope.currentPage ++;
        $http({method:'POST',url:'data/homeData.json',params:data}).success(function(response){
            $scope.data = $scope.data.concat(response);
        });
    }

    function getData(){
        $http({method:'POST',url:'data/homeData.json',params:data}).success(function(response){
            $scope.data = response;
        });
    }
}]);

app.controller('followController', ['$scope', 'ajax', function($scope, ajax){
    $scope.currentPage = 1;
    $scope.videos = [];
    $scope.isLoadMore = true;

    var data = {
        currentPage:$scope.currentPage
    };

    page();

    $scope.loadMore = function(){
        data.currentPage = $scope.currentPage + 1;
        page();
    }

    function page(){
        var para = {url:'http://www.qiangchen.me/enms/news/page',data:data};
        ajax.post(para).then(function(data){
            $scope.videos = $scope.videos.concat(data.resultData);
            $scope.currentPage = data.currentPage;
            if(data.currentPage == data.totalPageSize){
                $scope.isLoadMore = false;
            }
        });
    }
}]);

app.controller('videoController', ['$scope', '$http', function($scope, $http){
    $scope.msg = '视频直播';
    $scope.currentPage = 1;
    $scope.videos = [];
    $scope.isLoadMore = true;

    var data = {
        currentPage:$scope.currentPage
    };

    page();

    $scope.loadMore = function(){
        data.currentPage = $scope.currentPage + 1;
        page();
    }

    function page(){
        $http({method:'POST',url:'http://www.qiangchen.me/enms/news/page',data:data})
        .success(function(response){
            $scope.videos = $scope.videos.concat(response.data.resultData);
            $scope.currentPage = response.data.currentPage;
            if(response.data.currentPage == response.data.totalPageSize){
                $scope.isLoadMore = false;
            }
        })
        .error(function(response){

        });
    }
}]);

app.controller('meController', ['$scope', function($scope){
    $scope.msg = '个人中心';
}]);

app.service('ajax', ['$http', '$state', '$q', function($http, $state, $q){
    this.get = function(params){
        var defer = $q.defer();
        $http({method:'get',url:params.url}).success(function(data, status, headers, config){
            if(data.code == 0){
                defer.resolve(data.data, status, headers, config);
            }else if(data.code == '1002'){
                $state.go('login');
            }else{
                alert(data.msg);
            }
        }).error(function(data, status, headers, config){
            alert(data);
            defer.resolve(data.data, status, headers, config);
        });
        return defer.promise;
    };

    this.post = function(params){
        var defer = $q.defer();
        $http({method:'post',url:params.url,data:params.data}).success(function(data, status, headers, config){
            if(data.code == 0){
                defer.resolve(data.data, status, headers, config);
            }else if(data.code == '1002'){
                $state.go('login');
            }else{
                alert(data.msg);
            }
        }).error(function(data, status, headers, config){
            alert(data);
            defer.resolve(data.data, status, headers, config);
        });
        return defer.promise;
    };

}]);

app.config(['$httpProvider', function ($httpProvider) {
    //HTTP 改造
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    $httpProvider.defaults.withCredentials = true;//允许cookie策略
    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function (data) {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function (obj) {
            var query = '';
            var name, value, fullSubName, subName, subValue, innerObj, i;
            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        if (subValue != null) {
                            fullSubName = name + '.' + subName;
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                }
                else if (value !== undefined) { //&& value !== null
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }
            return query.length ? query.substr(0, query.length - 1) : query;
        };
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
}]);