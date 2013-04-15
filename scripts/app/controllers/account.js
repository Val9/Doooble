
function AccountController($rootScope, $scope, $location, $route, User, Local, Utils) {
  'use strict';
  

  // ViewModel
  // ---------
  $scope.GetUser = function () {
    
    var localUser = Local.get();
    if (localUser == null) {
      $rootScope.User = new User({ Lists: [], DateModified: new Date() });
    } else {
      $rootScope.User = new User(localUser);
    }
    Local.save($rootScope.User);

    if (navigator.onLine && $rootScope.User.PIN != null && $rootScope.User.PIN.length > 0) {
      if ($rootScope.User != null && $rootScope.User._id != null && $rootScope.User._id.$oid != null) {
        $scope.Password = $rootScope.User.Password;

        // We have a user, get them from the cloud
        User.get({ id: $rootScope.User._id.$oid }, function (user) {
          // Decide which user was touched last
          if (user.DateModified > $rootScope.User.DateModified) { // If database is latest use its data
            $rootScope.User = new User(user);
            Local.save($rootScope.User);
          } else { // Otherwise use what we have in localStorage and update the database
            $rootScope.User.update();
          }
        }, function () {
          // If error with getting user just use localStorage
          $rootScope.User.update();
        });
      } else { // If no user found add a new one
        $rootScope.User = { Lists: [], DateModified: new Date() };
        User.save($rootScope.User, function (user) {
          $rootScope.User = new User(user);
          Local.save($rootScope.User);
        });
      }
    }
  };


  $scope.GetUser();


  $scope.$on('GetUser', function () {
    $scope.GetUser();
  });


  // Watch Tasks and save when changes are made
  // ------------------------------------------
  $scope.$watch('User', function () {
    try {
      if (navigator.onLine && $rootScope.User.PIN != null && $rootScope.User.PIN.length > 0) {
        $rootScope.User.update();
        Local.save($rootScope.User);
        $scope.UpdateNotifications();
      } else {
        throw 'No resource or not online';
      }
    } catch (e) {
      Local.save($rootScope.User);
      $scope.UpdateNotifications();
    }
    $rootScope.$broadcast('CloseModal');
  }, true);

  
  $scope.UpdateNotifications = function () {
    plugins.localNotification.cancelAll();

    // For each task in each list
    for (var l = 0; l < $scope.User.Lists.length; l++) {
      var list = $scope.User.Lists[l];

      if (list.Type == 'task') {

        for (var t = 0; t < list.Items.length; t++) {

          var item = $scope.User.Lists[l].Items[t];
          if (item.DueDate != null && item.DueDate.length > 0 && item.DueTime != null && item.DueTime.length > 0) {

            var dueDateSplit = item.DueDate.split('-');
            var dueTimeSplit = item.DueTime.split(':');
            var year = dueDateSplit[0];
            var month = parseInt(dueDateSplit[1]) - 1; // For some reason months start at 0
            var date = parseInt(dueDateSplit[2]);
            var hours = dueTimeSplit[0];
            var mins = dueTimeSplit[1];

            var due = new Date();
            due.setYear(year);
            due.setMonth(month);
            due.setDate(date);
            due.setHours(hours);
            due.setMinutes(mins);
            due.setSeconds(0);

            var now = new Date();
            now.setSeconds(0);
            var diff = due.getTime() - now.getTime();
            if (diff > 0) { // if the due date is in the future.
              var d = new Date();
              d.setSeconds(0);
              d = d.getTime() + diff;
              d = new Date(d);
              d.setSeconds(0);

              plugins.localNotification.add({
                date: d,
                message: item.Name,
                id: (Math.floor(Math.random() * 1679615) + 46656).toString(36),
                background: 'app.background("' + list.Id + '")'
              });
            }

          }
        }
      }
    }
  };


  // Open List from notification
  // ---------------------------
  $scope.OpenList = function (id) {
    $rootScope.$broadcast('CloseModal');
    $location.path('/tasks/' + id);
  };


  $scope.ToggleSyncSettings = function () {
    $('#register').toggleClass('hide');
    $('#sync').toggleClass('hide');
  };


  $scope.Register = function () {
    if ($scope.Password != null && $scope.Password.length > 0) {
      $rootScope.User.Password = $scope.Password;
      $rootScope.User.PIN = $scope.GenerateNewPin();

      try {
        User.save($rootScope.User, function (user) {
          $rootScope.User = new User(user);
          Local.save($rootScope.User);
          if (navigator.notification != null) {
            navigator.notification.vibrate(200);
            navigator.notification.alert(
                'Your new PIN: \n' + $rootScope.User.PIN + '\n Use this to sync other devices',  // message
                null,               // callback
                'Registration successful',          // title
                'Ok'                // button text
            );
          } else {
            alert('Registration successful. Your new PIN: ' + $rootScope.User.PIN + '. Use this to sync other devices');
          }
        });
      } catch (e) { }
      Local.save($rootScope.User);
    }
  };


  $scope.GenerateNewPin = function () {
    var newPin = Utils.newPin().toUpperCase();
    var users = User.query({ q: { "PIN": newPin } });

    if (users == null || users.length == 0) {
      return newPin;
    } else {
      $scope.GenerateNewPin();
    }
  };


  $scope.Sync = function () {
    if ($scope.NewPin != null && $scope.NewPassword != null) {
      $scope.NewPin = $scope.NewPin.toUpperCase();

      User.query({ q: { "PIN": $scope.NewPin, "Password": $scope.NewPassword } }, function (users) {

        if (users != null && users.length > 0) {
          // We have a registered user, clear and update our user with the one from the cloud
          Local.clear();
          $rootScope.User = new User(users[0]);
          Local.save($rootScope.User);
          if (navigator.notification != null) {
            navigator.notification.vibrate(200);
            navigator.notification.alert(
                'Sync successful',  // message
                null,               // callback
                'Doooble',          // title
                'Ok'                // button text
            );
          } else {
            alert('Sync successful');
          }

          // Close modal and load list page with new user data
          $route.reload();
          $rootScope.$broadcast('CloseModal');

        } else {
          if (navigator.notification != null) {
            navigator.notification.vibrate(200);
            navigator.notification.alert(
                'Your PIN/Password did not match our records',  // message
                null,                                           // callback
                'Sync unsuccessful',                            // title
                'Ok'                                            // button text
            );
          }
          else {
            alert('Your PIN/Password did not match our records');
          }
        }
      }, function () {
        if (navigator.notification != null) {
          navigator.notification.vibrate(200);
          navigator.notification.alert(
              'Your PIN/Password did not match our records',  // message
              null,                                           // callback
              'Sync unsuccessful',                            // title
              'Ok'                                            // button text
          );
        }
        else {
          alert('Your PIN/Password did not match our records');
        }
      });
    }
  };


  $scope.UnSync = function () {
    if (navigator.notification != null) {
      navigator.notification.vibrate(200);
      navigator.notification.confirm(
          'Are you sure you want unsync this device?',            // message
          UnSyncConfirmed,            // callback to invoke with index of button pressed
          'Doooble',                  // title
          'Yes,No'                        // buttonLabels
      );
    }
    else {
      if (confirm("Are you sure you want unsync this device?")) {
        $scope.UnSyncAction();
      }
    }
  };


  var UnSyncConfirmed = function (button) {
    if (button === 1) {
      $scope.$apply(function () {
        $scope.UnSyncAction();
      });
    }
  };


  $scope.UnSyncAction = function () {
    $scope.Password = null;
    $scope.NewPassword = null;
    $scope.NewPin = null;
    if ($scope.AccountSettings !== undefined) $scope.AccountSettings.$setPristine();
    var newUser = { Lists: [], DateModified: new Date() };
    Local.clear();
    newUser = new User(newUser);
    Local.save(newUser);

    if (navigator.notification != null) {
      navigator.notification.vibrate(200);
      navigator.notification.alert(
          'Unsync successful',  // message
          null,               // callback
          'Doooble',          // title
          'Ok'                // button text
      );
    } else {
      alert('Unsync successful');
    }

    // Close modal and load list page with new user data
    $route.reload();
    $rootScope.$broadcast('CloseModal');

    $rootScope.User = newUser;
  };


}


AccountController.$inject = ['$rootScope', '$scope', '$location', '$route', 'User', 'Local', 'Utils'];