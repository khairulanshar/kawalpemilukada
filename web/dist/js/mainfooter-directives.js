(function () {
    var app = angular.module('mainfooter-directives', []);
    app.directive("mainFooter", function () {
        return {
            restrict: 'E',
            templateUrl: "../pages/main-footer.html",
            controller: function () {

            },
            controllerAs: "mainFooter"
        };
    });
})();
