(function() {
    var app = angular.module('mainheader-directives', []);
    app.directive("mainHeader", function() {
        return {
            restrict: 'E',
            templateUrl: "../pages/main-header.html",
            controller: function($scope, $http, $KawalService) {
                $KawalService.cekauth($http, $scope);
                $("#menuBtn").click(function() {
                    $("#navsidebar").show();
                    $("#pagewrapper").attr("style", "");
                    $("#menuBtn").hide();
                });
            },
            controllerAs: "mainHeader"
        };
    });
})();
