(function() {
    var app = angular.module('mainheader-directives', []);
    app.directive("mainHeader", function() {
        return {
            restrict: 'E',
            templateUrl: "../pages/main-header.html",
            controller: function($scope, $http, $KawalService) {

                $KawalService.cekauth($http, $scope);
                
                
                $(window).bind("load resize", function() {
                    var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
                    if (width >= 768) {
                        try {
                            if ($("#myMenu").hasClass("in")) {
                                $("#myMenu").offcanvas('hide');
                            }
                        } catch (e) {
                        }
                    }
                });
            },
            controllerAs: "mainHeader"
        };
    });
})();
