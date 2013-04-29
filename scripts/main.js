'use strict';


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

    if (navigator.splashscreen != null) {
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


// Quick textbox and Link listeners
// --------------------------------
$(function () {

  // Get Angular scope from the known DOM element
  var rootScope = angular.element(document.getElementById('body')).scope();

  // Links in notes
  $(document).on('touchstart', '.note a', function (e) {
    e.preventDefault();

    rootScope.$apply(function () {
      rootScope.CloseModal();
    });

    window.open($(this).attr('href'), '_blank', 'location=no');
  });

  // Opening hashtags
  $(document).on('touchstart', 'span[data-hashtag]', function (e) {
    e.preventDefault();
    var hashtag = $(this).data('hashtag');

    rootScope.$apply(function () {
      rootScope.CloseModal();
      rootScope.OpenTag(hashtag);
    });
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


// HashTags
// --------
function hashed(str) {
  // order matters
  var re = [
      "\\b((?:https?|ftp)://[^\\s\"'<>]+)\\b",
      "\\b(www\\.[^\\s\"'<>]+)\\b",
      "\\b(\\w[\\w.+-]*@[\\w.-]+\\.[a-z]{2,6})\\b",
      "#([a-z0-9]+)"];
  re = new RegExp(re.join('|'), "gi");

  return str.replace(re, function (match, url, www, mail, hashtag) {

    if (hashtag)
      return '<span class="hashtag" data-hashtag="' + hashtag + '">#' + hashtag + '</span>';

    return match;
  });
}