window.ChaiBioTech.ngApp

.directive 'sideMenu', [
  '$rootScope'
  ($rootScope) ->

    restrict: 'EA'
    replace: true
    scope: {}
    templateUrl: 'views/directives/sidemenu.html'
    link: ($scope, elem, attrs) ->

      $scope.open = false

      $scope.toggle = ->
        $scope.open = !$scope.open

      $rootScope.$on 'sidemenu:open', ->
        $scope.open = true

      $rootScope.$on 'sidemenu:close', ->
        $scope.open = false

      $rootScope.$on 'sidemenu:toggle', ->
        $scope.toggle()

]