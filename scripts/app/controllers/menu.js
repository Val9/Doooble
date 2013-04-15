
function MenuController($rootScope, $scope, $location, Local) {
  'use strict';

  // Monitor the current page
  // ------------------------
  $scope.location = $location;

  // Set App Title
  $rootScope.Title = 'doooble';

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


  $scope.OpenEmailList = function () {
    $rootScope.$broadcast('OpenEmailList');
  };


  // Close Modal
  // -----------
  $rootScope.CloseModal = function () {
    if ($('.modal').is('.open')) {
      window.scroll(0, 0);
      $('.modal').removeClass('open').find('.wait').delay(550).show(0);
      $rootScope.ModalOpen = false;
      $('input, textarea').blur();
    }
  };


  $scope.$on('CloseModal', function () {
    $rootScope.CloseModal();
  });


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
    $rootScope.Title = 'doooble';
  };


}


MenuController.$inject = ['$rootScope', '$scope', '$location', 'Local'];