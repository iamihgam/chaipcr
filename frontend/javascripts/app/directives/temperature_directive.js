/*
 * Chai PCR - Software platform for Open qPCR and Chai's Real-Time PCR instruments.
 * For more information visit http://www.chaibio.com
 *
 * Copyright 2016 Chai Biotechnologies Inc. <info@chaibio.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

window.ChaiBioTech.ngApp.directive('temperature', [
  'ExperimentLoader',
  '$timeout',
  function(ExperimentLoader, $timeout) {
    return {
      restric: 'EA',
      replace: true,
      scope: {
        caption: "@",
        unit: "@",
        reading: '=',
        action: '&' // Learn how to pass value in this scenario
      },

      templateUrl: 'app/views/directives/edit-value.html',

      link: function(scope, elem, attr) {

        scope.delta = true; // This is to prevent the directive become disabled, check delta in template, this is used for auto delta field
        var editValue;

        scope.$watch("reading", function(val) {

          if(angular.isDefined(scope.reading)) {
            scope.shown = Number(scope.reading).toFixed(1);
          }
        });

        scope.editAndFocus = function(className) {

          editValue = Number(scope.shown).toFixed(1);
        };

        scope.save = function() {

          if(! isNaN(scope.shown) && editValue != Number(scope.shown)) {

            scope.reading = Number(scope.shown).toFixed(1);
            $timeout(function() {
              ExperimentLoader.changeTemperature(scope.$parent).then(function(data) {
                console.log(data);
              });
            });

          } else {
            scope.shown = Number(scope.reading).toFixed(1);
          }
        };
      }
    };
  }
]);
