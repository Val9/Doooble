'use strict';


// For use with camera
var destinationType;
var pictureSource;


var app = {
  initialize: function () {
    this.bind();
  },

  bind: function () {
    document.addEventListener('deviceready', this.deviceready, false);
  },

  deviceready: function () {
    // Report the event
    app.report('deviceready');

    document.addEventListener("resume", this.resume, false);

    // Setup the camera features
    if (navigator.camera != null && navigator.splashscreen != null) {
      destinationType = navigator.camera.DestinationType;
      pictureSource = navigator.camera.PictureSourceType;

      // Hide the splash screen and fade in the app contents.
      navigator.splashscreen.hide();
    }

    // Fade in the application
    var completeElem = document.querySelector('#deviceready .complete');
    completeElem.className = completeElem.className.split('see-through').join('');
  },

  resume: function () {
    // Report the event
    app.report('resume');

    // Get Angular scope from the known DOM element
    var scope = angular.element(document.getElementById('account-settings')).scope();
    // Resync with DB
    scope.$apply(function () {
      scope.GetUser();
    });
  },

  background: function (id) {
    // Report the event
    app.report('background');

    // Get Angular scope from the known DOM element
    var scope = angular.element(document.getElementById('account-settings')).scope();
    // Resync with DB
    scope.$apply(function () {
      scope.OpenList(id);
    });
  },

  running: function () {

  },

  report: function (id) {
    // Report the event in the console
    console.log("Report: " + id);
  }
};


// Custom Script
// -------------
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


function getItemFromArray(array, id) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].Id === id) {
      return array[i];
    }
  }
  return null;
}


function getIndexOfItemFromArray(array, id) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].Id === id) {
      return i;
    }
  }
  return null;
}


function onload() {
  $('.modal').css({
    'height': $(window).height() - 40
  });
  // Prevent flash of bindings
  $('.invisible').removeClass('invisible');
}


var timeOut = null;
var resize = function () {
  $('.modal').css({
    'height': $(window).height() - 40
  });
  if (!$('input, textarea').is(":focus")) window.scrollBy(0, 1);
};
window.onresize = function () {
  if (timeOut != null) clearTimeout(timeOut);
  timeOut = setTimeout(resize, 100);
};


// Quick textbox and Link listener
// -------------------------------
$(function () {
  $(document).on('focus', '.quick-form input', function () {

    $('.go-over').addClass('top');
    $('.go-under').hide();
    $('header').hide();
    $('button.clear').hide();
    window.scroll(0, 0);

  }).on('blur', '.quick-form input', function () {

    $('.go-over').removeClass('top');
    $('.go-under').show();
    $('header').show();
    $('button.clear').show();
    window.scroll(0, 0);

  });

  $(document).on('click', '.note a', function(e) {
    e.preventDefault();

    // Get Angular scope from the known DOM element
    var rootScope = angular.element(document.getElementById('body')).scope();
    // Resync with DB
    rootScope.$apply(function () {
      rootScope.CloseModal();
    });

    var url = $(this).attr('href');
    window.open(url, '_blank', 'location=no');
  });
});


// Markdown
// --------
$(function () {
  // Set default options
  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    langPrefix: 'language-',
    highlight: function (code, lang) {
      if (lang === 'js') {
        return highlighter.javascript(code);
      }
      return code;
    }
  });
});