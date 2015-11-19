(function() {
    var app = angular.module('mainside-directives', []);
    app.directive("mainSide", function() {
        return {
            restrict: 'E',
            templateUrl: "../pages/main-side.html",
            controller: function($scope, $compile, $window, $KawalService) {
                this.setPage = function(page) {
                    $scope.selectedTemplate.hash = page;
                    $KawalService.handleHash(page.substr(1), $scope);
                };
                this.isSelected = function(page) {
                    return $scope.selectedTemplate.hash === page;
                }
                this.isSelected2 = function(page) {
                    return $scope.selectedTemplate.hash.indexOf(page) >= 0;
                }
                

                $('#side-menu').metisMenu();
            },
            controllerAs: "mainSide"
        };
    });
})();
