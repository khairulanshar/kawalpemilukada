(function() {
    var app = angular.module('KawalPemiluKaDaApp', ['mcontrollers']);
    app.controller('KawalPemiluKaDaCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {
            $scope.tahun = 2015;
            $scope.kawal.niksaya;
            $scope.datanik = {};
            $scope.imgurlsaya = "";
            $scope.provinsis = [];
            $scope.provinsi = {};
            $scope.kawal.searchProvinsi = "";
            $scope.kandidat = {"provinsi": [], "kabupaten-kota": []};
            $scope.showmain = true;
            $scope.kandidatSelected = {};
            $scope.wilayahSelected = {};
            $scope.version = '1';
            $scope.android_id = "";
            $scope.forceupdate = false;
            try {
                $scope.android_id = $kawalpilkada.getandroid_id();
            } catch (e) {
                $scope.android_id = "";
            }
            try {
                $scope.version = $kawalpilkada.getAppsVersion();
            } catch (e) {
                $scope.version = '1';
            }
            if ($scope.version !== "1.0.1") {
                $scope.forceupdate = true;
                try {
                    $("#centerversi").show();
                } catch (e) {
                }
            }
            $scope.showmainpage = function() {
                $scope.showmain = true;
            }
            $scope.random = function(max) {
                try {
                    var x=Math.floor((Math.random() * max) + 0);
                    return x;//Math.floor((Math.random() * max.length) + 0);//Math.floor(Math.random() * (max.length - 0 + 1)) + 0;
                } catch (e) {
                    return 0;
                }
            }
            $scope.sendToGa = function() {
                ga('send', 'screenview', {
                    'screenName': window.location.hash
                });
            };
            $scope.replaceSpecial = function(inp, t) {
                var val = inp.replace(/\ /g, t).replace(/\,/g, t).replace(/\`/g, t).replace(/\~/g, t).replace(/\!/g, t).replace(/\@/g, t).replace(/\#/g, t).replace(/\$/g, t).replace(/\%/g, t).replace(/\^/g, t).replace(/\&/g, t).replace(/\*/g, t).replace(/\(/g, t).replace(/\)/g, t).replace(/\+/g, t).replace(/\|/g, t).replace(/\{/g, t).replace(/\}/g, t).replace(/\[/g, t).replace(/\]/g, t).replace(/\:/g, t).replace(/\;/g, t).replace(/\"/g, t).replace(/\'/g, t).replace(/\?/g, t);
                return val;
            };
            $scope.pages = ["cektps.html", "privasi.html", "c4n.html", "paslon.html"];
            $scope.handleHash = function(hash, $scope) {
                if (hash.length > 0 && (hash !== $scope.selectedTemplate.hash)) {
                    hash = hash.replace("#/", "");
                    hash = hash.replace("#", "");
                    hash = $scope.replaceSpecial(hash, "/");
                    hash = hash.replace("//", "/");
                    var hashs = hash.split("/");
                    if ($scope.pages.indexOf(hashs[0]) >= 0) {
                        window.location.hash = "#" + hash;
                        $scope.selectedTemplate.hash = window.location.hash;
                        $scope.selectedTemplate.path = hashs[0];
                    }
                }
            };
            $scope.isSelected = function(arg) {
                return $scope.selectedTemplate.hash.indexOf(arg) >= 0;
            }
            $scope.isSelected2 = function(args) {
                var found = false;
                angular.forEach(args, function(arg, key) {
                    if ($scope.selectedTemplate.hash.indexOf(arg) >= 0) {
                        found = true;
                    }
                });
                return found;
            }
            $scope.selectedTemplate = {
                "hash": '',
                "path": ""
            };
            $scope.openPage = function(page) {
                $scope.handleHash(page, $scope);
            }
            $scope.$watch(function() {
                return location.hash;
            }, function(value) {
                $scope.sendToGa();
            });
            try {
                if (window.location.hash.length === 0) {
                    $scope.handleHash('#cektps.html', $scope);
                } else {
                    $scope.openPage(window.location.hash);
                }
            } catch (e) {
            }
        }]);



})();




