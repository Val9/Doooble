
function ListController($rootScope, $scope, $location, $filter, User, Utils) {
  'use strict';

  $rootScope.$broadcast('GetUser');

  // Adding New Lists
  // ----------------
  $scope.OpenListChooser = function () {
    $('#add-list-chooser').addClass('open').find('.wait').delay(550).hide(0);
    $rootScope.ModalOpen = true;
  };


  $scope.OpenAddList = function (type) {
    // Initialise
    $scope.ListName = '';
    $scope.Picture = '';

    if ($scope.NewTaskForm !== undefined) $scope.NewTaskForm.$setPristine();
    if ($scope.NewWishForm !== undefined) $scope.NewWishForm.$setPristine();
    if ($scope.NewShoppingForm !== undefined) $scope.NewShoppingForm.$setPristine();
    if ($scope.NewNoteForm !== undefined) $scope.NewNoteForm.$setPristine();

    // Set default picture - depending on list type
    $scope.Picture = 'img/lists/' + type + '.jpg';
    $('#add-list-chooser').removeClass('open').find('.wait').delay(550).show(0);
    $('#new-' + type + '-list').addClass('open').find('.wait').delay(550).hide(0);
    $rootScope.ModalOpen = true;
  };

  $scope.AddList = function (type) {
    if ($scope.ListName == null || $scope.ListName.length == 0) {
      switch (type) {
        case 'task': $scope.ListName = 'Reminders'; break;
        case 'wish': $scope.ListName = 'Presents'; break;
        case 'shopping': $scope.ListName = 'Shopping'; break;
        case 'note': $scope.ListName = 'Notes'; break;
        default: $scope.ListName = 'My list'; break;
      }
    }

    var list = new List(Utils.newGuid(), type, $scope.ListName, $rootScope.User.Lists.length, $scope.Picture, [], false, false);
    $rootScope.User.Lists.push(list);
    $rootScope.User.DateModified = new Date();
  };

  $scope.$on('OpenAddTaskList', function () {
    $scope.OpenAddList('task');
  });
  $scope.$on('OpenAddWishList', function () {
    $scope.OpenAddList('wish');
  });
  $scope.$on('OpenAddShoppingList', function () {
    $scope.OpenAddList('shopping');
  });
  $scope.$on('OpenAddNoteList', function () {
    $scope.OpenAddList('note');
  });


  // Updating Lists
  // --------------
  $scope.OpenEditList = function (list) {
    // Store the list being edited. This will be used in the update method.
    $scope.EditingList = { Id: list.Id, Name: list.Name, Picture: list.Picture };
    $scope.OriginalList = list;

    $('#edit-list').addClass('open').find('.wait').delay(550).hide(0);
    $rootScope.ModalOpen = true;
  };


  $scope.UpdateList = function () {
    if ($scope.EditingList.Name == null || $scope.EditingList.Name.length == 0) {
      switch (type) {
        case 'task': $scope.EditingList.Name = 'Reminders'; break;
        case 'wish': $scope.EditingList.Name = 'Presents'; break;
        case 'shopping': $scope.EditingList.Name = 'Shopping'; break;
        case 'note': $scope.EditingList.Name = 'Notes'; break;
        default: $scope.EditingList.Name = 'My list'; break;
      }
    }

    $scope.OriginalList.Name = $scope.EditingList.Name;
    $scope.OriginalList.Picture = $scope.EditingList.Picture;
    $rootScope.User.DateModified = new Date();
  };


  // Deleting Lists
  // --------------
  $scope.DeleteList = function () {
    if (navigator.notification != null) {
      navigator.notification.vibrate(200);
      navigator.notification.confirm(
          'Are you sure you want to delete this list and all its items?',            // message
          DeleteListConfirmed,            // callback to invoke with index of button pressed
          'Delete List',                  // title
          'Yes,No'                        // buttonLabels
      );
    }
    else {
      if (confirm("Delete this list?")) {
        $scope.DeleteListAction();
      }
    }
  };

  var DeleteListConfirmed = function (button) {
    if (button === 1) {
      $scope.$apply(function () {
        $scope.DeleteListAction();
      });
    }
  };


  $scope.DeleteListAction = function () {
    $rootScope.User.Lists.splice($rootScope.User.Lists.indexOf($scope.OriginalList), 1);
    $rootScope.User.DateModified = new Date();
  };


  // Open List
  // ---------
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


ListController.$inject = ['$rootScope', '$scope', '$location', '$filter', 'User', 'Utils'];