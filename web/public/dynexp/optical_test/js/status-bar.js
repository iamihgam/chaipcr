window.App.directive('statusBar', [
  'Experiment', 'Status', 'TestInProgressService', '$rootScope', function(Experiment, Status, TestInProgressService, $rootScope) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        experimentId: '=?'
      },
      templateUrl: './views/directives/status-bar.html',
      link: function($scope, elem, attrs) {
        var getExperiment;
        $scope.show = function() {
          if ($scope.experimentId) {
            return $scope.experimentId && $scope.status;
          } else {
            return $scope.status;
          }
        };
        getExperiment = function(cb) {
          return TestInProgressService.getExperiment($scope.experimentId).then(function(experiment) {
            return cb(experiment);
          });
        };
        $scope.$watch('experimentId', function(id) {
          if (!id) {
            return;
          }
          return getExperiment(function(exp) {
            return $scope.experiment = exp;
          });
        });
        $scope.is_holding = false;
        Status.startSync();
        elem.on('$destroy', function() {
          return Status.stopSync();
        });
        $scope.$watch(function() {
          return Status.getData();
        }, function(data, oldData) {
          var ref, ref1, ref2, ref3;
          if (!data) {
            return;
          }
          if (!data.experiment_controller) {
            return;
          }
          $scope.state = data.experiment_controller.machine.state;
          $scope.thermal_state = data.experiment_controller.machine.thermal_state;
          $scope.oldState = (oldData != null ? (ref = oldData.experiment_controller) != null ? (ref1 = ref.machine) != null ? ref1.state : void 0 : void 0 : void 0) || 'NONE';
          if (($scope.oldState !== $scope.state || !$scope.experiment) && $scope.experimentId) {
            getExperiment(function(exp) {
              $scope.experiment = exp;
              $scope.status = data;
              return $scope.is_holding = TestInProgressService.set_holding(data, exp);
            });
          } else {
            $scope.status = data;
            $scope.is_holding = TestInProgressService.set_holding(data, $scope.experiment);
          }
          $scope.timeRemaining = TestInProgressService.timeRemaining(data);
          if ($scope.state === 'running' && !attrs.experimentId && ((ref2 = data.experiment_controller) != null ? (ref3 = ref2.expriment) != null ? ref3.id : void 0 : void 0)) {
            $scope.experimentId = data.experiment_controller.expriment.id;
            return getExperiment(function(exp) {
              return $scope.experiment = exp;
            });
          }
        }, true);
        $scope.getDuration = function() {
          var ref;
          if (!($scope != null ? (ref = $scope.experiment) != null ? ref.completed_at : void 0 : void 0)) {
            return 0;
          }
          return Experiment.getExperimentDuration($scope.experiment);
        };
        $scope.startExperiment = function() {
          return Experiment.startExperiment($scope.experiment.id).then(function() {
            return $rootScope.$broadcast('experiment:started', $scope.experimentId);
          });
        };
        $scope.stopExperiment = function() {
          return Experiment.stopExperiment($scope.experiment.id);
        };
        return $scope.resumeExperiment = function() {
          return Experiment.resumeExperiment($scope.experiment.id);
        };
      }
    };
  }
]);

// ---
// generated by coffee-script 1.9.2