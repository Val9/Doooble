
function TaskController($rootScope, $scope, $compile, $routeParams, $filter, filterFilter, User, Utils, Email) {
  'use strict';

  $rootScope.$broadcast('GetUser');

  // Filter helpers
  // --------------
  var priorityFilter = $filter('priority');
  var monetizeFilter = $filter('monetize');

  // ViewModel
  // ---------
  var yesterday = new Date();
  var today = new Date();
  var tomorrow = new Date();

  yesterday.setDate(today.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);

  $scope.Yesterday = $filter('date')(yesterday, 'yyyy-MM-dd');
  $scope.Today = $filter('date')(today, 'yyyy-MM-dd');
  $scope.Tomorrow = $filter('date')(tomorrow, 'yyyy-MM-dd');

  var hours = today.getHours()
  var minutes = today.getMinutes()

  if (minutes < 10) minutes = "0" + minutes;
  if (hours < 10) hours = "0" + hours;
  $scope.Now = hours + ":" + minutes;

  $scope.List = getItemFromArray($rootScope.User.Lists, $routeParams.listId);

  // Set App Title
  $rootScope.Title = $scope.List.Name;

  var orderByFilter = $filter('orderBy');
  $scope.List.Items = orderByFilter($scope.List.Items, 'Order');

  $scope.$watch('EditingItem.DueDate', function () {
    if ($scope.EditingItem != null && ($scope.EditingItem.DueDate == null || $scope.EditingItem.DueDate.length == 0)) {
      $scope.EditingItem.DueDate == null;
      $scope.EditingItem.DueTime = null;
    }
  }, true);


  // Watch Tasks and save when changes are made
  // ------------------------------------------
  $scope.$watch('List', function () {
    // Re-order based on Order...
    $scope.List.Items = orderByFilter($scope.List.Items, 'Order');

    // Update completed total
    $scope.CompletedTotal = filterFilter($scope.List.Items, { Complete: true }).length;
    $scope.OutstandingTotal = $scope.List.Items.length - $scope.CompletedTotal;
    $scope.HighPriorityTotal = priorityFilter($scope.List.Items).length;
    $scope.TotalPrice = 0;

    // Initialise overdue and today flags to false
    $scope.List.Overdue = false;
    $scope.List.DueToday = false;

    if ($scope.List !== null) {
      // Calculate total price
      switch ($scope.List.Type) {
        case 'wish':
          $scope.TotalPrice = 0;
          for (var i = 0; i < $scope.List.Items.length; i++) {
            var item = $scope.List.Items[i];
            if (!isNumber($scope.Price)) $scope.Price = 0;
            $scope.TotalPrice = $scope.TotalPrice + item.Price;
            $scope.TotalPrice = monetizeFilter($scope.TotalPrice);
          }
          break;
        case 'shopping':
          $scope.TotalPrice = 0;
          for (var i = 0; i < $scope.List.Items.length; i++) {
            var item = $scope.List.Items[i];
            if (!isNumber($scope.Price)) $scope.Price = 0;
            if (!isNumber($scope.Quantity)) $scope.Quantity = 1;
            $scope.TotalPrice = $scope.TotalPrice + (item.Price * item.Quantity);
            $scope.TotalPrice = monetizeFilter($scope.TotalPrice);
          }
          break;
      }
    }

    for (var i = 0; i < $scope.List.Items.length; i++) {
      // Remove order gaps
      $scope.List.Items[i].Order = i;

      // Set overdue & today flags
      // For each task in list
      if ($scope.List.Items[i].Complete != true) { // if task is not complete
        if ($scope.List.Items[i].DueDate != null && $scope.List.Items[i].DueDate.length > 0) { // if task has a due date
          if ($scope.List.Items[i].DueDate < $scope.Today) { // if task due date is before today, ie. its overdue
            $scope.List.Overdue = true;
            $scope.List.DueToday = false;
          } else if ($scope.List.Items[i].DueDate == $scope.Today) { // if task due date is today, ie. its due now
            var deadline = $scope.List.Items[i].DueTime;
            if (deadline == null || deadline == '' || deadline >= $scope.Now) {
              $scope.List.DueToday = true;
            } else {
              $scope.List.Overdue = true;
            }
          }
        }
      }
    }

    var listIndex = getIndexOfItemFromArray($rootScope.User.Lists, $routeParams.listId);
    $rootScope.User.Lists[listIndex] = $scope.List;

  }, true);


  $scope.AddQuickTask = function () {
    // Validate
    if ($scope.QuickName != null && $scope.QuickName.length > 0) {

      var task = new Task(Utils.newGuid(), $scope.QuickName, false, 2, $scope.List.Items.length, null, null);

      $scope.QuickName = null;
      if ($scope.NewQuickTaskForm !== undefined) $scope.NewQuickTaskForm.$setPristine();

      $scope.List.Items.push(task);
      $rootScope.User.DateModified = new Date();
    }
  };


  $scope.AddQuickWish = function () {
    // Validate
    if ($scope.QuickName != null && $scope.QuickName.length > 0) {

      var wish = new Wish(Utils.newGuid(), $scope.QuickName, false, 2, $scope.List.Items.length, monetizeFilter(0));

      $scope.QuickName = null;
      if ($scope.NewQuickWishForm !== undefined) $scope.NewQuickWishForm.$setPristine();

      $scope.List.Items.push(wish);
      $rootScope.User.DateModified = new Date();
    }
  };


  $scope.AddQuickProduct = function () {
    // Validate
    if ($scope.QuickName != null && $scope.QuickName.length > 0) {

      var product = new Product(Utils.newGuid(), $scope.QuickName, false, 2, $scope.List.Items.length, monetizeFilter(0), 1);

      $scope.QuickName = null;
      if ($scope.NewQuickProductForm !== undefined) $scope.NewQuickProductForm.$setPristine();

      $scope.List.Items.push(product);
      $rootScope.User.DateModified = new Date();
    }
  };


  $scope.FocusQuickTask = function () {
    $('.quick-form input').focus();
  };


  $scope.$on('OpenAddItem', function () {
    $scope.OpenAddItem();
  });


  // Updating Items
  // --------------
  $scope.OpenEditItem = function (item) {

    $('.quick-form input').blur();

    // Store the item being edited. This will be used in the update method.
    switch ($scope.List.Type) {
      case 'task':
        $scope.EditingItem = { Id: item.Id, Name: item.Name, Priority: item.Priority, Order: item.Order, DueDate: item.DueDate, DueTime: item.DueTime };
        break;
      case 'wish':
        $scope.EditingItem = { Id: item.Id, Name: item.Name, Priority: item.Priority, Order: item.Order, Price: item.Price };
        break;
      case 'shopping':
        $scope.EditingItem = { Id: item.Id, Name: item.Name, Priority: item.Priority, Order: item.Order, Price: item.Price, Quantity: item.Quantity };
        break;
      default:
        $scope.EditingItem = { Id: item.Id, Name: item.Name, Priority: item.Priority, Order: item.Order, DueDate: item.DueDate, DueTime: item.DueTime };
        break;
    }

    $scope.OriginalItem = item;

    $('#edit-' + $scope.List.Type + '-item').addClass('open').find('.wait').delay(550).hide(0);
    $rootScope.ModalOpen = true;
  };


  $scope.UpdateItem = function () {
    if ($scope.EditingItem.Name != null && $scope.EditingItem.Name.length > 0) {
      if ($scope.EditingItem.DueDate == null || $scope.EditingItem.DueDate.length == 0) {
        $scope.EditingItem.DueDate == null
        $scope.EditingItem.DueTime = null;
      }

      $scope.OriginalItem.Name = $scope.EditingItem.Name;
      $scope.OriginalItem.DueDate = $scope.EditingItem.DueDate;
      $scope.OriginalItem.DueTime = $scope.EditingItem.DueTime;
      $scope.OriginalItem.Priority = $scope.EditingItem.Priority;
      switch ($scope.List.Type) {
        case 'wish':
          $scope.OriginalItem.Price = monetizeFilter($scope.EditingItem.Price);
          break;
        case 'shopping':
          $scope.OriginalItem.Price = monetizeFilter($scope.EditingItem.Price);
          $scope.OriginalItem.Quantity = $scope.EditingItem.Quantity;
          break;
      }
      $rootScope.User.DateModified = new Date();
    }
  };


  // Deleting Item
  // -------------
  $scope.DeleteItem = function () {
    if (navigator.notification != null) {
      navigator.notification.vibrate(200);
      navigator.notification.confirm(
          'Delete this task?',            // message
          DeleteItemConfirmed,            // callback to invoke with index of button pressed
          'Doooble',                      // title
          'Yes,No'                        // buttonLabels
      );
    }
    else {
      if (confirm("Delete task?")) {
        $scope.DeleteItemAction();
      }
    }
  };

  var DeleteItemConfirmed = function (button) {
    if (button === 1) {
      $scope.$apply(function () {
        $scope.DeleteItemAction();
      });
    }
  };

  $scope.DeleteItemAction = function () {
    $scope.List.Items.splice($scope.List.Items.indexOf($scope.OriginalItem), 1);
    $rootScope.User.DateModified = new Date();
  };


  // Clear Completed
  // ---------------
  $scope.ClearCompleted = function () {
    if (navigator.notification != null) {
      navigator.notification.vibrate(200);
      navigator.notification.confirm(
          'Delete completed tasks?',        // message
          ClearCompletedConfirmed,          // callback to invoke with index of button pressed
          'Doooble',                        // title
          'Yes,No'                          // buttonLabels
      );
    } else {
      if (confirm("Delete completed tasks?")) {
        $scope.ClearCompletedAction();
      }
    }
  };

  var ClearCompletedConfirmed = function (button) {
    if (button === 1) {
      $scope.$apply(function () {
        $scope.ClearCompletedAction();
      });
    }
  };

  $scope.ClearCompletedAction = function () {
    $scope.List.Items = $scope.List.Items.filter(function (item) {
      $rootScope.User.DateModified = new Date();
      return !item.Complete;
    });
  };


  // Complete Item
  // -------------
  $scope.ToggleComplete = function (item) {
    item.Complete = !item.Complete;
    $rootScope.User.DateModified = new Date();
  };


  // Sortable
  // --------
  $('.items').sortable({
    placeholder: 'droparea',
    axis: 'y',
    items: '.task',
    forcePlaceholderSize: true,
    handle: '.handle',
    revert: 200,
    start: function (e, ui) {
      $('.droparea').css({ 'height': ui.item.outerHeight() + 'px' });
    },
    stop: function (e, ui) {
      $scope.$apply(function () {
        var itemIds = $('.items').sortable('toArray');
        for (var i in itemIds) {
          var itemId = itemIds[i];
          if (itemId != null && itemId.length > 0) {
            itemId = itemId.replace("task_", "");
            var item = getItemFromArray($scope.List.Items, itemId);
            item.Order = parseInt(i);
          }
        }
        $rootScope.User.DateModified = new Date();
      });
    }
  });


  // Email list
  // ----------
  $scope.OpenEmailList = function () {
    if ($scope.List.Items.length > 0) {
      $scope.To = null;

      $scope.EmailListForm.$setPristine();

      $('#email-list').addClass('open').find('.wait').delay(550).hide(0);
      $rootScope.ModalOpen = true;
    } else {
      if (navigator.notification != null) {
        navigator.notification.vibrate(200);
        navigator.notification.alert(
            'You have no tasks to send',    // message
            null,         // callback
            'Doooble',    // title
            'Ok'          // button text
        );
      } else {
        alert('You have no tasks to send');
      }
    }
  };


  $scope.SendEmail = function () {
    if ($scope.To != null && $scope.To.length > 0) {
      var msg = '<h4 class="h4">' + $scope.List.Name + '</h4>';
      msg += '<table>';

      // Construct Email message
      for (var i = 0; i < $scope.List.Items.length; i++) {
        // Row
        msg += '<tr class="complete-' + $scope.List.Items[i].Complete + ' priority' + $scope.List.Items[i].Priority + '">';
        // Quantity
        msg += '<td style="text-align: right; padding-bottom: 15px;">';
        msg += $scope.List.Items[i].Quantity == null ? '' : $scope.List.Items[i].Quantity;
        msg += '</td>';
        // Text
        if ($scope.List.Type == 'wish' || $scope.List.Type == 'shopping') {
          msg += '<td style="width: 230px; padding-bottom: 15px;">';
        } else {
          msg += '<td style="padding-bottom: 15px;">';
        }
        msg += $scope.List.Items[i].Name;
        msg += '</td>';
        // Price
        msg += '<td style="text-align: right; padding-bottom: 15px;">';
        msg += $scope.List.Items[i].Price == null ? '' : $scope.List.Items[i].Price;
        msg += '</td>';
        // End Row
        msg += '</tr>';
      }
      if ($scope.List.Type == 'wish' || $scope.List.Type == 'shopping') {
        msg += '<tr>';
        msg += '<td></td>';
        msg += '<td style="font-size: 16px; font-weight: bold;">Total</td>';
        msg += '<td style="font-size: 16px; font-weight: bold; text-align: right;">' + $scope.TotalPrice + '</td>';
        msg += '<tr>';
      }

      msg += '</table>';

      Email.get({
        to: $scope.To,
        subject: $scope.List.Name,
        html: msg
      }, function () {
        EmailSent();
      }, function () {
        EmailSent();
      });
    }
  };


  var EmailSent = function () {
    if (navigator.notification != null) {
      navigator.notification.vibrate(200);
      navigator.notification.alert(
          'Email sent',    // message
          null,         // callback
          'Doooble', // title
          'Ok'          // button text
      );
    } else {
      alert('Email sent');
    }
    $rootScope.$broadcast('CloseModal');
  };


  $scope.$on('OpenEmailList', function () {
    $scope.OpenEmailList();
  });


}


TaskController.$inject = ['$rootScope', '$scope', '$compile', '$routeParams', '$filter', 'filterFilter', 'User', 'Utils', 'Email'];