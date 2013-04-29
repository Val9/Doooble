'use strict';

//http://www.benlesh.com/2012/11/angular-js-directive-basics.html

angular.module('Doooble.directives', [])

  // hold tap doubletap transformstart transform transformend dragstart drag dragend release swipe

              .directive('onTouch', function () {
                return function (scope, element, attrs) {

                  return element.bind('touchstart', function () {
                    return scope.$apply(attrs['onTouch']);
                  });

                };
              })
              .directive('onTap', function () {
                return function (scope, element, attrs) {

                  return $(element).hammer({
                    prevent_default: false,
                  }).bind("tap", function (ev) {
                    return scope.$apply(attrs['onTap']);
                  });

                };
              })
              .directive('onSwipe', function () {
                return function (scope, element, attrs) {

                  return $(element).hammer({
                    prevent_default: false,
                  }).bind("swipe", function (ev) {
                    return scope.$apply(attrs['onSwipe']);
                  });

                };
              })
              .directive('onHold', function () {
                return function (scope, element, attrs) {

                  return $(element).hammer({
                    prevent_default: false,
                  }).bind("hold", function (ev) {
                    return scope.$apply(attrs['onHold']);
                  });

                };
              });