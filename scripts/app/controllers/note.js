
function NoteController($rootScope, $scope, $routeParams, $filter, User, Local, Utils, Email) {
  'use strict';

  $rootScope.$broadcast('GetUser');

  // Filters
  // -------
  var markdown = $filter('markdown');

  // ViewModel
  // ---------
  $rootScope.User = new User(Local.get());

  $scope.List = getItemFromArray($rootScope.User.Lists, $routeParams.listId);

  // Set App Title
  $rootScope.Title = $scope.List.Name;

  // Watch notes and save when changes are made
  // ------------------------------------------
  $scope.$watch('List', function () {

    if ($scope.List !== null) {
      var listIndex = getIndexOfItemFromArray($rootScope.User.Lists, $routeParams.listId);
      $rootScope.User.Lists[listIndex] = $scope.List;
    }

  }, true);


  // Adding New Note
  // ---------------
  $scope.OpenAddNote = function () {
    // Initialise
    $scope.Content = null;
    if ($scope.NewNoteForm !== undefined) $scope.NewNoteForm.$setPristine();

    $('#new-note-item').addClass('open').find('.wait').delay(550).hide(0);
    $rootScope.ModalOpen = true;
  };


  $scope.AddNote = function () {
    // Validate
    if ($scope.Content != null && $scope.Content.length > 0) {

      var note = new Note(Utils.newGuid(), $scope.Content, $scope.List.length);

      $scope.List.Items.push(note);
      $rootScope.User.DateModified = new Date();
    }
  };


  $scope.$on('OpenAddItem', function () {
    $scope.OpenAddNote();
  });


  // Updating Notes
  // --------------
  $scope.OpenEditNote = function (note) {
    // Store the note being edited. This will be used in the update method.
    $scope.EditingNote = { Id: note.Id, Content: note.Content, Order: note.Order };
    $scope.OriginalNote = note;

    $('#edit-note-item').addClass('open').find('.wait').delay(550).hide(0);
    $rootScope.ModalOpen = true;
  };


  $scope.UpdateNote = function () {
    if ($scope.EditingNote.Content != null && $scope.EditingNote.Content.length > 0) {
      $scope.OriginalNote.Content = $scope.EditingNote.Content;
      $rootScope.User.DateModified = new Date();
    }
  };


  // Deleting Note
  // -------------
  $scope.DeleteNote = function () {
    if (navigator.notification != null) {
      navigator.notification.vibrate(200);
      navigator.notification.confirm(
          'Delete this note?',            // message
          DeleteNoteConfirmed,            // callback to invoke with index of button pressed
          'Doooble',                      // title
          'Yes,No'                        // buttonLabels
      );
    }
    else {
      if (confirm("Delete note?")) {
        $scope.DeleteNoteAction();
      }
    }
  };


  var DeleteNoteConfirmed = function (button) {
    if (button === 1) {
      $scope.$apply(function () {
        $scope.DeleteNoteAction();
      });
    }
  };


  $scope.DeleteNoteAction = function () {
    $scope.List.Items.splice($scope.List.Items.indexOf($scope.OriginalNote), 1);
    $rootScope.User.DateModified = new Date();

  };


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
            'You have no notes to send',    // message
            null,         // callback
            'Doooble',    // title
            'Ok'          // button text
        );
      } else {
        alert('You have no notes to send');
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
        // Text
        msg += '<td style="padding-bottom: 15px;">';
        msg += markdown($scope.List.Items[i].Content);
        msg += '</td>';
        // End Row
        msg += '</tr>';
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
          'Doooble',    // message
          null,         // callback
          'Email sent', // title
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


NoteController.$inject = ['$rootScope', '$scope', '$routeParams', '$filter', 'User', 'Local', 'Utils', 'Email'];