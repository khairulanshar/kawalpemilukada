/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {
    var app = angular.module('mcontrollers', []);
    app.controller('cektpsController', ['$scope', '$http', '$window', function($scope, $http, $window) {
            $scope.clear = function() {
                $scope.$parent.$parent.kawal.niksaya = "";
            };
            $scope.caritps = function() {
                if ($scope.$parent.$parent.kawal.niksaya) {
                    $("#caritpsBtn").html('<i class="fa fa-spinner fa-pulse"></i>');
                    $scope.$parent.$parent.imgurlsaya = "";
                    $http.get('/ceknik/json/' + $scope.$parent.$parent.kawal.niksaya).
                            success(function(data, status, headers, config) {
                                $scope.$parent.$parent.datanik = data;
                                try {
                                    var latlon = data.position.results[0].geometry.location.lat + "," + data.position.results[0].geometry.location.lng;
                                    var w = ($window.innerWidth > 0) ? $window.innerWidth : screen.width;
                                    $scope.$parent.$parent.imgurlsaya = "http://maps.googleapis.com/maps/api/staticmap?center=" + latlon + "&zoom=13&size=" + w + "x400&maptype=roadmap&markers=color:blue%7Clabel:P%7C" + latlon;
                                } catch (e) {
                                }
                                localStorage.setItem("datanik", JSON.stringify(data));
                                $("#caritpsBtn").html('<i class="fa fa-check"></i> Cari TPS saya');
                            }).
                            error(function(data, status, headers, config) {
                                $("#caritpsBtn").html('<i class="fa fa-check"></i> Cari TPS saya');
                            });
                }
            };
            try {
                if (!$scope.$parent.$parent.kawal.niksaya) {
                    var datanik = localStorage.getItem("datanik");
                    if (datanik !== null) {
                        datanik = JSON.parse(datanik);
                        $scope.$parent.$parent.kawal.niksaya = parseInt(datanik.nik);
                        $scope.caritps();
                    }
                }
            } catch (e) {
            }
        }]);
    app.controller('paslonController', ['$scope', '$http', '$window', '$sce', '$timeout', function($scope, $http, $window, $sce, $timeout) {
            $scope.setdatanik = function() {
                if ($scope.$parent.$parent.kawal.searchProvinsi.length === 0) {
                    try {
                        var datanik = localStorage.getItem("datanik");
                        if (datanik !== null) {
                            datanik = JSON.parse(datanik);
                            $scope.$parent.$parent.kawal.searchProvinsi = datanik.provinsi;
                            angular.forEach($scope.$parent.$parent.provinsis, function(item) {
                                if (item.nama === datanik.provinsi) {
                                    $scope.$parent.$parent.provinsi = item;
                                }
                            });
                            $timeout(function() {
                                angular.element('#idcaripaslon').trigger('click');
                            }, 100);
                        }
                    } catch (e) {
                    }
                }
            };

            if ($scope.$parent.$parent.provinsis.length === 0) {
                try {
                    var provinsis = localStorage.getItem("provinsis");
                    if (provinsis !== null) {
                        $scope.$parent.$parent.provinsis = JSON.parse(provinsis);
                        $scope.setdatanik();
                    }
                } catch (e) {
                }
                if ($scope.$parent.$parent.provinsis.length === 0) {
                    $http.get('/wilayah/' + $scope.$parent.$parent.tahun + '/0').success(function(data) {
                        if (data.length > 0) {
                            $scope.$parent.$parent.provinsis = data[0];
                            localStorage.setItem("provinsis", JSON.stringify($scope.$parent.$parent.provinsis));
                            $scope.setdatanik();
                        }
                    }).error(function(data) {

                    });
                }
            }
            $scope.detailload = false;
            $scope.showkandidat = function(wilayah_i, kandidat_i) {
                if (typeof kandidat_i.kpu_id_peserta !== "undefined" && kandidat_i.kpu_id_peserta.length > 0) {
                    $scope.$parent.$parent.showmain = false;
                    if (kandidat_i.kpu_id_peserta !== $scope.$parent.$parent.kandidatSelected.kpu_id_peserta) {
                        $scope.$parent.$parent.kandidatSelected = kandidat_i;
                        $scope.$parent.$parent.wilayahSelected = wilayah_i;
                        $scope.detailload = true;
                        $http.get('/kandidat/get-profil-from-json/' + $scope.$parent.$parent.tahun + '/dataKandidat/' + kandidat_i.kpu_id_peserta).success(function(data) {
                            try {
                                $scope.$parent.$parent.kandidatSelected["kandidatJSON"] = data[0];
                                $scope.$parent.$parent.kandidatSelected["kandidatHTML"] = $sce.trustAsHtml(data[1].substr(0, data[1].length - 10).replace(new RegExp('href="/', 'g'), 'href="http://infopilkada.kpu.go.id/'));
                            } catch (e) {
                            }
                            $scope.detailload = false;
                        }).error(function(data) {
                            $scope.detailload = false;
                        });
                    }
                }
            };
            $scope.showmainpage = function() {
                $scope.$parent.$parent.showmain = true;
            };
            $scope.setProvinsi = function(provinsi_i) {
                $scope.$parent.$parent.provinsi = provinsi_i;
                $scope.$parent.$parent.kawal.searchProvinsi = provinsi_i.nama;
                $timeout(function() {
                    angular.element('#idcaripaslon').trigger('click');
                }, 100);
            };
            $scope.clear = function() {
                $scope.$parent.$parent.provinsi = {};
                $scope.$parent.$parent.kawal.searchProvinsi = "";
            };
            $('.dropdown-toggle button').click(function() {
                return false;
            });
            $scope.caripaslon = function($event) {
                if ($scope.$parent.$parent.provinsi.kpuid.length > 0) {
                    var target = $($event.target);
                    var orignalHtml = target.html();
                    target.html('<i class="fa fa-spinner fa-pulse"></i>');
                    $http.get('/kandidat/get/' + $scope.$parent.$parent.tahun + '/Provinsi/kpuid/' + $scope.$parent.$parent.provinsi.kpuid).success(function(data) {
                        if (data.length > 0) {
                            $scope.kandidat.provinsi = data[0];
                        }
                        target.html(orignalHtml);
                    }).error(function(data) {
                        $($event.target).html(orignalHtml);
                    });
                    $http.get('/kandidat/get/' + $scope.$parent.$parent.tahun + '/Kabupaten-Kota/parentkpuid/' + $scope.$parent.$parent.provinsi.kpuid).success(function(data) {
                        if (data.length > 0) {
                            $scope.kandidat["kabupaten-kota"] = data[0];
                        }
                        target.html(orignalHtml);
                    }).error(function(data) {
                        $($event.target).html(orignalHtml);
                    });
                }
            };
        }]);
})();

