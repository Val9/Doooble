
function MenuController($rootScope, $scope, $location, Local) {
  'use strict';

  // Monitor the current page
  // ------------------------
  $scope.location = $location;

  // Set App Title
  $rootScope.Title = 'Doooble';

  // Account settings
  // ----------------
  $scope.OpenAccountSettings = function () {
    var user = Local.get();
    if (user.PIN != null && user.PIN.length > 0) {
      $('#sync').addClass('hide');
      $('#register').removeClass('hide');
    }
    else {
      $('#sync').removeClass('hide');
      $('#register').addClass('hide');
    }
    $('#account-settings').addClass('open').find('.wait').delay(550).hide(0);
    $rootScope.ModalOpen = true;
  };

  // Search
  // ------
  $scope.OpenSearch = function () {
    $scope.CloseModal();
    $location.path('/search/');
  };

  $scope.OpenEmailList = function () {
    $rootScope.$broadcast('OpenEmailList');
  };


  // Hashtags
  // --------
  $rootScope.OpenTag = function (tag) {
    $location.path('/search/' + tag);
  };


  // Close Modal
  // -----------
  $rootScope.CloseModal = function () {
    if ($('.modal').is('.open')) {
      $('.modal').removeClass('open').find('.wait').delay(550).show(0);
      $rootScope.ModalOpen = false;
      $('input, textarea').blur();
    }
  };


  // Onload of views
  // ---------------
  $scope.$on('$routeChangeSuccess', function () {
    onload();
  });


  // Back home
  // ---------
  $scope.Back = function () {
    $scope.CloseModal();
    $location.path('/');
  };


}


MenuController.$inject = ['$rootScope', '$scope', '$location', 'Local'];