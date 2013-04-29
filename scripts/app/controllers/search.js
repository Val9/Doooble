
function SearchController($rootScope, $scope, $location, $routeParams, filterFilter, Local) {
  'use strict';

  $rootScope.Title = 'Search';

  var User = Local.get();
  $scope.Lists = User.Lists;
  $scope.Items = [];

  for (var i = 0; i < User.Lists.length; i++) {
    var list = User.Lists[i];
    for (var j = 0; j < list.Items.length; j++) {
      var task = list.Items[j];
      task.List = list;
      $scope.Items.push(task);
    }
  }

  $scope.Q = Local.getSearch();

  $scope.Tag = $routeParams.tag;

  if ($scope.Tag != '') {
    $scope.Q = '#' + $scope.Tag;
    $rootScope.Title = '#' + $scope.Tag;
  }

  // Search filters
  $scope.$watch('Q', function () {
    Local.setSearch($scope.Q);
    $scope.FilteredLists = filterFilter($scope.Lists, { Name: $scope.Q });
    $scope.FilteredItems = filterFilter($scope.Items, { Name: $scope.Q });
  }, true);


  $scope.OpenList = function (list) {
    switch (list.Type) {
      case 'task': $location.path('/tasks/' + list.Id); break;
      case 'wish': $location.path('/wishes/' + list.Id); break;
      case 'shopping': $location.path('/products/' + list.Id); break;
      case 'note': $location.path('/notes/' + list.Id); break;
      default: $location.path('/'); break;
    }
  };

}


SearchController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', 'filterFilter', 'Local'];