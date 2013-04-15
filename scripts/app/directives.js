'use strict';

// hold tap doubletap transformstart transform transformend dragstart drag dragend release swipe
angular.module('Doooble.directives', [])

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
              })
              .directive('openCamera', function () {

                return {
                  restrict: 'A',
                  require: 'ngModel',
                  link: function (scope, elm, attrs, ctrl) {
                    elm.on('touchstart', function () {
                      navigator.camera.getPicture(
                      function (imageURI) {
                        scope.$apply(function () {
                          ctrl.$setViewValue(imageURI);
                        });
                      },
                      function (err) {
                        console.log('Failed because: ' + err);
                      },
                      {
                        quality: 75,
                        allowEdit: true,
                        destinationType: destinationType.FILE_URI,
                        sourceType: pictureSource.PHOTOLIBRARY,
                        targetWidth: 260,
                        targetHeight: 260
                      });
                    });
                  }
                };

              });