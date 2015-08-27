(function() {
    var app = angular.module('mainside-directives', []);
    app.directive("mainSide", function() {
        return {
            restrict: 'E',
            templateUrl: "../pages/main-side.html",
            controller: function($scope, $compile, $window, $KawalService) {

                $(window).on("resize.doResize", function() {
                    var height = $KawalService.setWindowResize($scope, $window);

                    $scope.$apply(function() {
                        if (height > 750) {
                            $scope.minHeight = height;
                        } else {
                            $scope.minHeight = 750;
                        }
                        //do something to update current scope based on the new innerWidth and let angular update the view.
                    });
                });
                $scope.$on("$destroy", function() {
                    $(window).off("resize.doResize"); //remove the handler added earlier
                });
                $KawalService.setWindowResize($scope, $window);
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
                this.hideMenu = function() {
                    $("#navsidebar").hide();
                    $("#pagewrapper").css("margin", "0px");
                    $("#menuBtn").show();
                }

                $('#side-menu').metisMenu();
            },
            controllerAs: "mainSide"
        };
    });
})();
