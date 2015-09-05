(function() {
    var app = angular.module('mainheader-directives', []);
    app.directive("mainHeader", function() {
        return {
            restrict: 'E',
            templateUrl: "../pages/main-header.html",
            controller: function($scope, $http, $KawalService) {

                $KawalService.cekauth($http, $scope);
                this.setPage = function(page) {
                    if (!$scope.user.logged) {
                        return;
                    }
                    page=page+'/'+$scope.$tahun+'/'+$scope.user.provinsiId+'/'+$scope.user.kabkotaId+'/'+$scope.user.kecamatanId+'/'+$scope.user.desaId;
                    $scope.selectedTemplate.hash = page;
                    $KawalService.handleHash(page.substr(1), $scope);
                };
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
