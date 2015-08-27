var $kpuurl = "https://scanc1.kpu.go.id/viewp.php";
var $autolinker = new Autolinker({newWindow: true, className: "myLink"});
(function() {
    var app = angular.module('controllers', []);
    app.directive('parseUrl', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            replace: true,
            scope: {
                props: '=parseUrl',
                ngModel: '=ngModel'
            },
            link: function compile(scope, element, attrs, controller) {
                scope.$watch('ngModel', function(value) {
                    element.html($autolinker.link(value));
                });
            }
        };
    });
    app.controller('tabulasiController', ['$scope', '$http', '$KawalService', '$window', function($scope, $http, $KawalService, $window) {
            this.numberDecimal = 4;
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.$tahun, $scope.$parent.$parent, $window)
            };
            this.roundToTwo = function(num, a) {
                return $KawalService.roundToTwo(num, a);
            };
            this.setpercent = function(a, b) {
                return $KawalService.setpercent(a, b);
            };
            this.setTahun = function(selected) {
                $scope.$parent.$parent.$tahun = selected.tahun;
                var hashs = window.location.hash.substr(2).split("/");
                $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + selected.tahun, $scope);
            };
            var context = this;
            this.save1 = function(dataSuara, type, $index) {
                $KawalService.submitSuara($http, $scope, dataSuara, type, $index);
            };
            this.save = function(dataSuara, type, $index) {
                $KawalService.itemyangsedangdiproses.setTabulasi(true);
                if (type === "HC") {
                    dataSuara["errorAlertsHC"] = [];
                    dataSuara["sedangdisaveHC"] = true;
                    if (dataSuara.photosrc.length === 0 && dataSuara["tps_file"].length === 0) {
                        dataSuara["errorAlertsHC"].push('Foto C1 tidak boleh kosong');
                    }
                    angular.forEach(context.uruts, function(value, key) {
                        if (dataSuara.suaraKandidat[value + ''].suaraTPS.length === 0) {
                            dataSuara["errorAlertsHC"].push('Suara ' + dataSuara.suaraKandidat[value + ''].nama + ' tidak boleh kosong');
                        }
                    });
                    if (dagetSelectedKandidattaSuara.suarasahHC.length === 0) {
                        dataSuara["errorAlertsHC"].push('Suara Sah tidak boleh kosong');
                    }
                    if (dataSuara.suaratidaksahHC.length === 0) {
                        dataSuara["errorAlertsHC"].push('Suara Tidak Sah tidak boleh kosong');
                    }
                    if (dataSuara["errorAlertsHC"].length > 0) {
                        $KawalService.itemyangsedangdiproses.setTabulasi(false);
                        dataSuara["sedangdisaveHC"] = false;
                        return;
                    }
                    if (dataSuara["tps_file"].length === 0) {
                        $KawalService.getUrlFileSuaraTPS($http, $scope, dataSuara, "save/" + type + "/withimage", $index);
                    } else {
                        $KawalService.submitSuara($http, $scope, dataSuara, "save/" + type + "/noimage", $index);
                    }
                } else {
                    dataSuara["errorAlerts"] = [];
                    dataSuara["sedangdisave"] = true;
                    if (type === "C1") {
                        angular.forEach(context.uruts, function(value, key) {
                            if (dataSuara.suaraKandidat[value + ''].suaraVerifikasiC1.length === 0) {
                                dataSuara["errorAlerts"].push('Suara ' + dataSuara.suaraKandidat[value + ''].nama + ' tidak boleh kosong');
                            }
                        });
                        if (dataSuara.suarasah.length === 0) {
                            dataSuara["errorAlerts"].push('Suara Sah tidak boleh kosong');
                        }
                        if (dataSuara.suaratidaksah.length === 0) {
                            dataSuara["errorAlerts"].push('Suara Tidak Sah tidak boleh kosong');
                        }
                        if (dataSuara["errorAlerts"].length > 0) {
                            $KawalService.itemyangsedangdiproses.setTabulasi(false);
                            dataSuara["sedangdisave"] = false;
                            return;
                        }
                    }
                    $KawalService.submitSuara($http, $scope, dataSuara, "save/" + type, $index);
                }
            };
            this.photoChange = function(selected) {
                var id = parseInt(selected.id.replace("photo", ""));
                var dataSuara = context.DataSuarasTPS[id];
                dataSuara.photos = selected.files;
                for (var i = 0, f; f = dataSuara.photos[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                        return function(e) {
                            $scope.$apply(function() {
                                dataSuara.photosrc = e.target.result;
                                dataSuara.showPhoto = true;
                                dataSuara.errorAlerts = [];
                                dataSuara.tps_file = [];
                                context.initDivImg("HC" + id);
                            });
                        };
                    })(f);
                    reader.readAsDataURL(f);
                }
            };
            this.controlWilayahs = [
                {id: 1, kpuid: "0", nama: "Lihat Semua", tingkat: "Nasional", showdiv: false}
            ];
            this.blmadaData = true;
            this.KandidatWilayahs = [];
            this.DataSuaras = [];
            this.DataSuarasTPS = [];
            this.DataDesa = [];
            this.namas = [];
            this.uruts = [];
            this.showHitungCepat = true;
            this.showC1 = true;
            this.openPage = function(page, kandidat, wilayah) {
                $KawalService.setSelectedKandidat(kandidat, wilayah);
                $scope.selectedTemplate.hash = page + wilayah.tahun + '/' + wilayah.id.replace(wilayah.kpuid, '') + '/' + wilayah.kpuid + '/' + $KawalService.replaceSpecial(wilayah.nama, '-') + '/' + $KawalService.replaceSpecial(kandidat.nama, '-');
                $KawalService.handleHash(page.substr(1) + wilayah.tahun + '/' + wilayah.id.replace(wilayah.kpuid, '') + '/' + wilayah.kpuid + '/' + $KawalService.replaceSpecial(wilayah.nama, '-') + '/' + $KawalService.replaceSpecial(kandidat.nama, '-'), $scope);
            };
            this.setPage = function(controlWilayah, $index) {
                if (this.controlWilayahs.length > $index + 1 && this.controlWilayahs.length > 1) {
                    this.controlWilayahs.splice($index + 1, (this.controlWilayahs.length));
                }
                var urlfilter = "";
                for (var i = 0; i < this.controlWilayahs.length; i++) {
                    if (i === 0) {
                        urlfilter = urlfilter + "/" + $scope.$parent.$parent.$tahun;
                    } else {
                        urlfilter = urlfilter + "/" + this.controlWilayahs[i].kpuid;
                    }
                }
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[1] === "Kabupaten-Kota" && controlWilayah.tingkat === "Provinsi") {
                    $KawalService.handleHash(hashs[0] + "/" + hashs[1] + "/" + hashs[2], $scope.$parent.$parent);
                } else {
                    $KawalService.handleHash(hashs[0] + "/" + hashs[1] + urlfilter, $scope.$parent.$parent);
                }
            };
            this.getChild = function(kandidatWilayah) {
                if (kandidatWilayah.tingkat === "TPS") {
                    return;
                }
                var hashs = window.location.hash.substr(2).split("/");
                var parentkpuid = 0;
                try {
                    parentkpuid = kandidatWilayah.parentkpuid;
                    parentkpuid = kandidatWilayah.parentkpuid.length;
                } catch (e) {
                    parentkpuid = 0;
                }
                if (hashs[1] === "Kabupaten-Kota" && parentkpuid > 0) {
                    $KawalService.handleHash(window.location.hash.substr(1) + "/" + kandidatWilayah.parentkpuid + "/" + kandidatWilayah.kpuid, $scope);
                } else {
                    $KawalService.handleHash(window.location.hash.substr(1) + "/" + kandidatWilayah.kpuid, $scope);
                }
            };
            this.showTable = function(data) {
                if (data.length > 0) {
                    return true;
                } else {
                    return false;
                }
            };
            this.showTextBox = function(admin, user, dataSuara, attributeName, val, type) {
                if (user.logged && dataSuara[attributeName] === val && user.terverifikasi === "Y") {
                    if (user.userlevel >= 500
                            || (type === 'HC' && admin === "Y" && user.userlevel >= 200)
                            || (user.userlevel === 100 && type === 'HC' && admin === "N")
                            || (user.userlevel === 200 && type !== 'HC')
                            ) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };

            this.showGambar = function(dataSuara, data) {
                dataSuara["currentkpugambar"] = dataSuara[data];
            };
            this.resizeGambar = function(dataSuara, $index, val) {
                $('#modal-content-img').html('<img src="' + dataSuara[val] + '" style="width: 100%;">');
                $('#modal-content-div').modal('show');
            }
            this.putarGambar = function(dataSuara, id, value) {
                dataSuara["currentRotate"] = dataSuara["currentRotate"] + value;
                $("#img" + id).attr("style", "width:600px;-ms-transform: rotate(" + dataSuara['currentRotate'] + "deg);-webkit-transform: rotate(" + dataSuara['currentRotate'] + "deg);transform: rotate(" + dataSuara['currentRotate'] + "deg);");
                $("#divimg" + id).scrollLeft(600);
            }
            this.putarGambar2 = function(value) {
                var datarot = $('#modal-content-img').attr('data-rot');
                datarot = parseInt(datarot) + parseInt(value);
                $('#modal-content-img').attr('data-rot', datarot);
                $('#modal-content-img').children().attr("style", "width:100%;-ms-transform: rotate(" + datarot + "deg);-webkit-transform: rotate(" + datarot + "deg);transform: rotate(" + datarot + "deg);");
            }
            this.initDivImg = function(id) {
                setTimeout(function() {
                    $("#divimg" + id).scrollLeft(600);
                    $("#divimg" + id).scrollTop(120);
                }, 1000);
            }
            this.setcolor = function(dataSuara, $index) {
                if (dataSuara.tidakadaC1 === "N") {
                    dataSuara["tidakadaC1_"] = false;
                    dataSuara["color"] = "transparent";
                } else {
                    dataSuara["tidakadaC1_"] = true;
                    dataSuara["color"] = "pink";
                }
            }
            this.init = function(tabulasiCtrl, dataSuara, $index) {
                var parents = dataSuara.key.raw.name.split("#");
                function pad(num, size) {
                    var s = "000000000" + num;
                    return s.substr(s.length - size);
                }
                var parent = pad(parents[2], 7) + pad(dataSuara.nama, 3);
                dataSuara["kpugambar1"] = $kpuurl + "?f=" + parent + "01.jpg";
                dataSuara["kpugambar2"] = $kpuurl + "?f=" + parent + "02.jpg";
                dataSuara["kpugambar3"] = $kpuurl + "?f=" + parent + "03.jpg";
                dataSuara["kpugambar4"] = $kpuurl + "?f=" + parent + "04.jpg";
                dataSuara["kpugambar5"] = $kpuurl + "?f=" + parent + "05.jpg";
                dataSuara["currentkpugambar"] = dataSuara["kpugambar4"];
                dataSuara["currentRotate"] = 0;
                dataSuara["photosrc"] = "";
                dataSuara["showPhoto"] = false;
                dataSuara["sedangdisaveHC"] = false;
                dataSuara["sedangdisave"] = false;
                dataSuara["errorAlertsHC"] = [];
                dataSuara["successAlertsHC"] = [];
                dataSuara["errorAlerts"] = [];
                dataSuara["successAlerts"] = [];
                dataSuara["photos"] = [];
                dataSuara["files"] = [];
                dataSuara["TotalsuaraTPS"] = 0;
                dataSuara["TotalsuaraC1"] = 0;
                if (dataSuara.statusHC === "N") {
                    dataSuara["statusHCDesc"] = "Belum diisi atau diperbaiki";
                } else
                if (dataSuara.statusHC === "R") {
                    dataSuara["statusHCDesc"] = "Belum divalidasi";
                } else
                if (dataSuara.statusHC === "Y") {
                    dataSuara["statusHCDesc"] = "Data valid";
                } else {
                    dataSuara["statusHCDesc"] = dataSuara.statusHC;
                }


                if (dataSuara.dilock === "N") {
                    if (dataSuara.suarasah === 0) {
                        dataSuara.suarasah = '';
                    }
                    if (dataSuara.suaratidaksah === 0) {
                        dataSuara.suaratidaksah = '';
                    }
                }
                if (dataSuara.dilockHC === "N") {
                    if (dataSuara.suarasahHC === 0) {
                        dataSuara.suarasahHC = '';
                    }
                    if (dataSuara.suaratidaksahHC === 0) {
                        dataSuara.suaratidaksahHC = '';
                    }
                    if (dataSuara["tps_file"].length > 0) {
                        dataSuara.photosrc = dataSuara["tps_file"][dataSuara["tps_file"].length - 1]["fileLink"];
                        dataSuara["showPhoto"] = true;
                        context.initDivImg("HC" + $index);
                    }
                } else {
                    dataSuara.photosrc = dataSuara["tps_file"][dataSuara["tps_file"].length - 1]["fileLink"];
                    dataSuara["showPhoto"] = true;
                    context.initDivImg("HC" + $index);
                }
            };
            this.init2 = function(tabulasiCtrl, dataSuara, urut, $index) {
                if (dataSuara.dilock === "N") {
                    if (dataSuara.suaraKandidat[urut + ''].suaraVerifikasiC1 === 0) {
                        dataSuara.suaraKandidat[urut + ''].suaraVerifikasiC1 = '';
                    }
                }
                if (dataSuara.dilockHC === "N") {
                    if (dataSuara.suaraKandidat[urut + ''].suaraTPS === 0) {
                        dataSuara.suaraKandidat[urut + ''].suaraTPS = '';
                    }
                }
            };
            $scope.$watch(function() {
                return window.location.hash;
            }, function(value) {
                context.getData();
            });
            var desaSelected = {};
            var desaSelectedPrev = {};
            var desaSelectedNext = {};
            this.setDesa = function(datadesa) {
                try {
                    context.desaSelected = datadesa;
                    var hashs = window.location.hash.substr(2).split("/");
                    $KawalService.handleHash(hashs[0] + "/" + hashs[1] + "/" + hashs[2] + "/" + hashs[3] + "/" + hashs[4] + "/" + hashs[5] + "/" + datadesa.kpuid, $scope.$parent.$parent);
                } catch (e) {
                }
            };
            this.setPrevandNext = function() {
                angular.forEach(context.DataDesa, function(value, key) {
                    if (context.desaSelected.kpuid === value.kpuid) {
                        context.desaSelectedPrev = context.DataDesa[key - 1];
                        context.desaSelectedNext = context.DataDesa[key + 1];
                    }
                });
            };
            this.tingkat = "";
            this.getData = function() {
                if (window.location.hash.substr(window.location.hash.length - 1) === "/") {
                    window.location.hash = window.location.hash.substr(0, window.location.hash.length - 1);
                }

                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[0] !== "tabulasi.html") {
                    return;
                }
                context.tingkat = hashs[1];
                context.KandidatWilayahs = [];
                context.DataSuaras = [];
                context.DataSuarasTPS = [];
                context.DataDesa = [];
                context.blmadaData = true;
                context.namas = [];
                context.uruts = [];
                context.controlWilayahs = [
                    {id: 1, kpuid: "0", nama: "Lihat Semua", tingkat: "Nasional", showdiv: false}
                ];
                $KawalService.itemyangsedangdiproses.setTabulasi(true);

                if (hashs.length > 3) {
                    $scope.$parent.$parent.$tahun = hashs[2];
                    for (var i = context.controlWilayahs.length + 2; i < hashs.length; i++) {
                        var parentId = hashs[i - 1];
                        if (context.controlWilayahs.length === 1) {
                            parentId = "0";
                        }
                        var kpuid = hashs[i];
                        var urlFilter = hashs[2] + "/kpuid/" + parentId + "/" + kpuid;
                        context.controlWilayahs.push({});

                        var callback = function(data, id) {
                            if (data.length > 0) {
                                data = data[0];
                                if (data.length > 0) {
                                    data = data[0];
                                    data.id = id;
                                    data.showdiv = true;
                                    context.controlWilayahs[id - 2] = data;
                                    if (data.tingkat === "Desa") {
                                        context.desaSelected = data;
                                        context.setPrevandNext();
                                    }
                                }
                            }
                        }
                        $KawalService.getWilayah($http, context, urlFilter, callback, i);
                    }
                    $http.get('/suara/get/' + hashs[2] + '/' + hashs[1] + '/' + hashs[hashs.length - 1]).
                            success(function(data, status, headers, config) {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        if (data[0].tingkat === "TPS") {
                                            context.blmadaData = false;
                                            context.DataSuarasTPS = data;
                                            $http.get('/suara/get/' + hashs[2] + '/' + hashs[1] + '/' + hashs[hashs.length - 2]).
                                                    success(function(data, status, headers, config) {
                                                        context.DataDesa = data[0];
                                                        context.setPrevandNext();
                                                    }).
                                                    error(function(data, status, headers, config) {

                                                    });



                                        } else {
                                            context.blmadaData = false;
                                            context.DataSuaras = data;
                                        }
                                        context.namas = data[0].namas;
                                        context.uruts = data[0].uruts;
                                    }
                                }
                                $KawalService.itemyangsedangdiproses.setTabulasi(false);
                            }).
                            error(function(data, status, headers, config) {

                            });
                } else {
                    if (hashs.length <= 2) {
                        $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + $scope.$parent.$parent.tahuns[0], $scope);
                        hashs.push($scope.$parent.$parent.tahuns[0]);
                    }
                    $scope.$parent.$parent.$tahun = hashs[2];
                    $http.get('/kandidat/get/' + hashs[2] + '/' + hashs[1]).
                            success(function(data, status, headers, config) {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        context.blmadaData = false;
                                        context.KandidatWilayahs = data;
                                    }
                                }
                                $KawalService.itemyangsedangdiproses.setTabulasi(false);
                            }).
                            error(function(data, status, headers, config) {

                            });
                }
            };
            $KawalService.sendToGa();
        }]);
    app.controller('profilKandidatController', ['$scope', '$http', '$KawalService', function($scope, $http, $KawalService) {
            this.kandidat = $KawalService.getSelectedKandidat();
            this.wilayah = $KawalService.getSelectedWilayah();
            var context = this;
            this.getData = function() {
                var test = 0;
                try {
                    test = context.wilayah.nama.length;
                } catch (e) {
                    test = 0;
                }
                if (test > 0) {
                    return;
                }
                var hashs = window.location.hash.substr(2).split("/");
                $KawalService.itemyangsedangdiproses.setKandidat(true);
                $http.get('/kandidat/single/' + hashs[1] + '/' + hashs[2] + '/' + hashs[3]).
                        success(function(data, status, headers, config) {
                            if (data.length > 0) {
                                data = data[0];
                                if (data.length > 0) {
                                    context.wilayah = data[0];
                                    angular.forEach(context.wilayah.kandidat, function(value, key) {
                                        if ($KawalService.replaceSpecial(value.nama, '-') === hashs[5]) {
                                            context.kandidat=value;
                                        }
                                    });
                                }
                            }
                            $KawalService.itemyangsedangdiproses.setKandidat(false);
                        }).
                        error(function(data, status, headers, config) {

                        });
            }
            this.getData();
        }]);

    app.controller('kandidatController', ['$scope', '$http', '$KawalService', function($scope, $http, $KawalService) {
            $KawalService.sendToGa();
            this.showAll = false;
            this.tingkat = "";
            this.errorAlerts = [];
            this.successAlerts = [];
            this.showAddNewCandidate = false;
            this.showKabupaten = false;
            this.submitShow = true;
            this.wilayahs = [];
            this.childWilayahs = [];
            this.wilayah = {nama: "", kandidat: [], kpuid: "", dikunci: ""};
            this.showPhoto = false;
            this.photosrc = "";
            this.searchWilayah = "";
            this.searchWilayah1 = "";
            this.searchWilayah0 = "";
            this.openPage = function(page, kandidat, wilayah) {
                $KawalService.setSelectedKandidat(kandidat, wilayah);
                $scope.selectedTemplate.hash = page + wilayah.tahun + '/' + wilayah.id.replace(wilayah.kpuid, '') + '/' + wilayah.kpuid + '/' + $KawalService.replaceSpecial(wilayah.nama, '-') + '/' + $KawalService.replaceSpecial(kandidat.nama, '-');
                $KawalService.handleHash(page.substr(1) + wilayah.tahun + '/' + wilayah.id.replace(wilayah.kpuid, '') + '/' + wilayah.kpuid + '/' + $KawalService.replaceSpecial(wilayah.nama, '-') + '/' + $KawalService.replaceSpecial(kandidat.nama, '-'), $scope);
            };
            $('.dropdown-menu').click(function(event) {
                var target = $(event.target);
                if (target.is("input") || target.is("i") || target.is("label") || target.is("div")) {
                    event.stopPropagation();
                }
            });
            this.photoChange = function(selected) {
                this.photos = selected.files;
                var contex = this;
                for (var i = 0, f; f = this.photos[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                        return function(e) {
                            $scope.$apply(function() {
                                contex.photosrc = e.target.result;
                                contex.showPhoto = true;
                                contex.errorAlerts = []
                            })
                        };
                    })(f);
                    reader.readAsDataURL(f);
                }
            };

            var callback = function(data, levelName) {
                context[levelName] = data[0];
            };
            this.kandidat = {
                nama: "",
                tingkat: "",
                tingkatId: "",
                provinsiId: "",
                provinsi: "",
                kabupatenId: "",
                kabupaten: "",
                img_url: ""
            }
            this.setTahun = function(selected) {
                $scope.$parent.$parent.$tahun = selected.tahun;
                var hashs = window.location.hash.substr(2).split("/");
                $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + selected.tahun, $scope);
            };
            this.showForm = function(selected) {
                selected.errorAlerts = [];
                selected.successAlerts = [];
                var hashs = window.location.hash.substr(2).split("/");
                selected.kandidat = {
                    nama: "",
                    tingkatId: "",
                    tingkat: hashs[1],
                    provinsiId: "",
                    provinsi: "",
                    kabupatenId: "",
                    kabupaten: ""
                }
                selected.showAddNewCandidate = !selected.showAddNewCandidate;
            }
            this.provinsis = [];
            this.fromSetWilayah = false;
            this.setWilayah = function(scope, selected) {
                scope.fromSetWilayah = true;
                scope.wilayah = selected;
                scope.childWilayahs = [];
                var hashs = window.location.hash.substr(2).split("/");
                $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + hashs[2] + "/" + selected.kpuid, $scope.$parent.$parent);
                var callback = function(data, id) {
                    if (data.length > 0) {
                        data = data[0];
                        if (data.length > 0) {
                            scope.childWilayahs = data;
                        }
                    }
                }
                var id = scope.wilayah.kpuid;
                if (scope.wilayah.id.indexOf("Kabupaten-Kota") >= 0) {
                    id = scope.wilayah.parentkpuid;
                }
                var urlFilter = $scope.$parent.$parent.$tahun + "/" + id;
                $KawalService.getWilayah($http, scope, urlFilter, callback, id);
            };
            this.isDikunci = function() {
                if (this.wilayah.dikunci === "N") {
                    return false;
                } else if (this.wilayah.dikunci === "Y") {
                    return true;
                }
            };
            this.showStatusSetup = function(StatusWilayahSetup) {
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs === 'Provinsi') {
                    if (StatusWilayahSetup.sudahDisetup1 === "Y" || StatusWilayahSetup.sudahDisetup1 === "N" || StatusWilayahSetup.sudahDisetup1 === "P") {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (StatusWilayahSetup.sudahDisetup2 === "Y" || StatusWilayahSetup.sudahDisetup2 === "N" || StatusWilayahSetup.sudahDisetup2 === "P") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
            this.setLock = function() {
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    this.wilayah.dikunci = 'Y';
                    this.fromSetWilayah = false;
                    var context = this;
                    context.childWilayahs = [];
                    var callback = function(data, id) {
                        if (data.length > 0) {
                            data = data[0];
                            if (data.length > 0) {
                                context.childWilayahs = data;
                            }
                        }
                    }
                    var id = this.wilayah.kpuid;
                    if (this.wilayah.id.indexOf("Kabupaten-Kota") >= 0) {
                        id = this.wilayah.parentkpuid;
                    }
                    var urlFilter = $scope.$parent.$parent.$tahun + "/" + id;
                    $KawalService.getWilayah($http, this, urlFilter, callback, id);
                }
            };
            this.resetup = function(kandidatCtrl, wilayah, $index) {
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[1] === 'Provinsi') {
                    if (wilayah.sudahDisetup1 === "Y" || wilayah.sudahDisetup1 === "P") {
                        return;
                    }
                } else {
                    if (wilayah.sudahDisetup2 === "Y" || wilayah.sudahDisetup2 === "P") {
                        return;
                    }
                }
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    if (hashs[1] === 'Provinsi') {
                        kandidatCtrl.childWilayahs[$index].sudahDisetup1 = "P";
                    } else {
                        kandidatCtrl.childWilayahs[$index].sudahDisetup2 = "P";
                    }
                    var callback = function(data) {
                        if (data[0] === "OK") {
                            kandidatCtrl.childWilayahs[$index] = data[1];
                        }
                    }
                    $KawalService.setupSuaraWilayah($http, {data: [hashs[1], wilayah, this.wilayah]}, callback, "setup");
                }
            };
            this.init = function(kandidatCtrl, wilayah, $index) {
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[1] === "Provinsi") {
                    if (wilayah.sudahDisetup1 === "Y" || wilayah.sudahDisetup1 === "P" || this.fromSetWilayah) {
                        return;
                    }
                } else {
                    if (wilayah.sudahDisetup2 === "Y" || wilayah.sudahDisetup2 === "P" || this.fromSetWilayah) {
                        return;
                    }
                }
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    var found = false;
                    var arg = {};
                    if (hashs[1] === "Kabupaten-Kota") {
                        angular.forEach(context.wilayahs, function(value, key) {
                            if (value.kpuid === wilayah.kpuid) {
                                kandidatCtrl.childWilayahs[$index].sudahDisetup2 = "P";
                                found = true;
                                arg = {
                                    data: [hashs[1], wilayah, value]
                                }
                            }
                        });
                    } else {
                        found = true;
                        kandidatCtrl.childWilayahs[$index].sudahDisetup1 = "P";
                        arg = {
                            data: [hashs[1], wilayah, this.wilayah]
                        }
                    }
                    if (found) {
                        var callback = function(data) {
                            if (data[0] === "OK") {
                                kandidatCtrl.childWilayahs[$index] = data[1];
                            }
                        }
                        $KawalService.setupSuaraWilayah($http, arg, callback, "setup");
                    }
                }
            }
            this.getData = function() {
                if (window.location.hash.substr(window.location.hash.length - 1) === "/") {
                    window.location.hash = window.location.hash.substr(0, window.location.hash.length - 1);
                }
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[0] !== "kandidat.html") {
                    return;
                }
                if (this.fromSetWilayah && hashs.length === 4) {
                    return;
                }
                if (hashs.length >= 3) {
                    $scope.$parent.$parent.$tahun = hashs[2];
                } else {
                    $scope.$parent.$parent.$tahun = $scope.$parent.$parent.tahuns[0];
                    $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + $scope.$parent.$parent.tahuns[0], $scope);
                    hashs.push($scope.$parent.$parent.tahuns[0]);
                }
                this.kandidat = {
                    nama: "",
                    tingkatId: "",
                    tingkat: hashs[1],
                    provinsiId: "",
                    provinsi: "",
                    kabupatenId: "",
                    kabupaten: "",
                    img_url: ""
                }
                if (this.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                    this.showKabupaten = true;
                } else {
                    this.showKabupaten = false;
                }
                this.wilayahs = [];
                this.wilayah = {nama: "", kandidat: [], kpuid: "", dikunci: ""};
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, "0", callback, "provinsis");
                }
                $KawalService.itemyangsedangdiproses.setKandidat(true);
                var context = this;
                $http.get('/kandidat/get/' + hashs[2] + '/' + context.kandidat.tingkat).
                        success(function(data, status, headers, config) {
                            if (data.length > 0) {
                                data = data[0];
                                if (data.length > 0) {
                                    context.wilayahs = data;
                                    if (hashs.length === 4) {
                                        angular.forEach(context.wilayahs, function(value, key) {
                                            if (value.kpuid === hashs[3]) {
                                                context.setWilayah(context, value);
                                            }
                                        });
                                    } else {
                                        context.setWilayah(context, context.wilayahs[0]);
                                    }
                                }
                            }
                            context.showAll = true;
                            $KawalService.itemyangsedangdiproses.setKandidat(false);
                        }).
                        error(function(data, status, headers, config) {
                            context.showAll = true;
                        });
            }
            this.photos = [];
            this.files = [];
            this.dosubmit = function(user, selected) {
                selected.errorAlerts = [];
                selected.successAlerts = [];
                if (selected.kandidat.nama.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Isi Nama Kandidat"});
                    return;
                }
                if (selected.kandidat.urut.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Isi No Urut Kandidat"});
                    return;
                }
                if (selected.kandidat.provinsiId.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Pilih Provinsi"});
                    return;
                }
                if (selected.photosrc.length <= 0) {
                    selected.errorAlerts.push({"text": "Silahakan Pilih Foto"});
                    return;
                }
                if (selected.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                    selected.kandidat.tingkatId = selected.kandidat.kabupatenId;
                } else {
                    selected.kandidat.tingkatId = selected.kandidat.provinsiId;
                }
                selected.submitShow = false;
                $KawalService.getUrlFileKandidat($http, $scope);
            }
            this.setProvinsi = function(selected) {
                this.kandidat.provinsiId = selected.kpuid;
                this.kandidat.provinsi = selected.nama;
                if (this.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, selected.kpuid, callback, "kabkotas");
                }
            }
            this.setKabupaten = function(selected) {
                this.kandidat.kabupatenId = selected.kpuid;
                this.kandidat.kabupaten = selected.nama;
            }

            var context = this;
            $scope.$watch(function() {
                return location.hash;
            }, function(value) {
                context.getData();
            });
        }]);
    app.controller('wilayahController', ['$http', '$scope', '$KawalService', function($http, $scope, $KawalService) {
            this.blmadaData = false;
            this.map = L.map('map').setView([-2.2, 118], 4.4);
            this.nkri = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                layers: 'BatasWilayah:propinsi_shp',
                format: 'image/png',
                transparent: true,
                attribution: "<a href='http://geoserver.apps.kawaldesa.id/geoserver/web/?wicket:bookmarkablePage=:org.geoserver.web.demo.MapPreviewPage' target='_kawaldesa'>geoserver.apps.kawaldesa.id</a>"
            }).addTo(this.map);
            this.kabupaten = null;
            // Disable drag and zoom handlers.
            //this.map.dragging.disable();
            this.map.touchZoom.disable();
            //this.map.doubleClickZoom.disable();
            this.map.scrollWheelZoom.disable();
            this.controlWilayahs = [
                {id: 1, kpuid: "0", nama: "Nasional", tingkat: "Nasional", showdiv: false}
            ];
            this.wilayahs = [];
            this.provinsis = [];
            this.kabkotas = [];
            this.kecamatans = [];
            this.desas = [];
            this.getData = function() {
                if (window.location.hash.substr(window.location.hash.length - 1) === "/") {
                    window.location.hash = window.location.hash.substr(0, window.location.hash.length - 1);
                }
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[0] !== "wilayah.html") {
                    return;
                }
                var context = this;
                if (hashs.length <= 1) {
                    $scope.$parent.$parent.$tahun = $scope.$parent.$parent.tahuns[0];
                    $KawalService.handleHash(hashs[0] + "/" + $scope.$parent.$parent.tahuns[0] + "/0", $scope.$parent.$parent);
                    hashs.push($scope.$parent.$parent.tahuns[0]);
                    hashs.push("0");
                } else if (hashs.length === 2) {
                    $scope.$parent.$parent.$tahun = hashs[1];
                    $KawalService.handleHash(hashs[0] + "/" + hashs[1] + "/0", $scope.$parent.$parent);
                    hashs.push("0");
                } else {
                    $scope.$parent.$parent.$tahun = hashs[1];
                }
                if (this.controlWilayahs.length > hashs.length - 2) {
                    this.controlWilayahs.splice(hashs.length - 2, (this.controlWilayahs.length));
                }
                this.wilayahs = [];
                if (hashs.length > 3) {
                    for (var i = this.controlWilayahs.length + 2; i < hashs.length; i++) {
                        var parentId = hashs[i - 1];
                        var kpuid = hashs[i];
                        var urlFilter = hashs[1] + "/kpuid/" + parentId + "/" + kpuid;
                        var callback = function(data, id) {
                            if (data.length > 0) {
                                data = data[0];
                                if (data.length > 0) {
                                    data = data[0];
                                    data.id = id;
                                    data.showdiv = true;
                                    context.controlWilayahs.push(data);
                                }
                            }
                        }
                        $KawalService.getWilayah($http, this, urlFilter, callback, i);
                    }
                }
                var parentId = hashs[hashs.length - 1];
                var urlFilter = hashs[1] + "/" + parentId;
                var callback = function(data) {
                    if (data.length > 0) {
                        if (data[0].length > 0) {
                            var sortid = function(a, b) {
                                return (parseInt(a.kpuid) - parseInt(b.kpuid));
                            }
                            context.wilayahs = data[0].sort(sortid);
                            context.blmadaData = false;
                        } else {
                            context.blmadaData = true;
                        }
                    }
                }
                $KawalService.getWilayah($http, this, urlFilter, callback);
                if (parentId === "0") {
                    context.clearChildMap(context);
                    context.map.setView([-2.2, 118], 4.4);
                } else {
                    context.clearChildMap(context);
                    if (hashs.length === 4) {
                        context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                            layers: 'BatasWilayah:kabupaten_shp',
                            format: 'image/png',
                            transparent: true,
                            cql_filter: "(kpu_prop_id='" + parentId + "')"
                        }).addTo(context.map);
                    } else if (hashs.length === 5) {
                        context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                            layers: 'BatasWilayah:kabupaten_shp',
                            format: 'image/png',
                            transparent: true,
                            cql_filter: "(kpu_kab_id='" + hashs[hashs.length - 1] + "')"
                        }).addTo(context.map);
                    }
                }
                $KawalService.sendToGa();
            };
            this.setTahun = function(selected) {
                $scope.$parent.$parent.$tahun = selected.tahun;
                var hashs = window.location.hash.substr(2).split("/");
                $KawalService.handleHash(hashs[0] + "/" + selected.tahun + "/0", $scope.$parent.$parent);
            };
            this.getChild = function(wilayah) {
                if (wilayah.tingkat === "TPS") {
                    return;
                }
                $KawalService.handleHash(window.location.hash.substr(1) + "/" + wilayah.kpuid, $scope.$parent.$parent);
            };
            this.setPage = function(controlWilayah, $index) {
                if (this.controlWilayahs.length > $index + 1 && this.controlWilayahs.length > 1) {
                    this.controlWilayahs.splice($index + 1, (this.controlWilayahs.length));
                }
                var urlfilter = "";
                for (var i = 0; i < this.controlWilayahs.length; i++) {
                    urlfilter = urlfilter + "/" + this.controlWilayahs[i].kpuid;
                }
                var hashs = window.location.hash.substr(2).split("/");
                $KawalService.handleHash(hashs[0] + "/" + hashs[1] + urlfilter, $scope.$parent.$parent);
            };
            this.getChildMap = function(selected) {
                var hashs = window.location.hash.substr(2).replace("wilayah.html/", "").split("/");
                var context = this;
                if (hashs.length === 2) {
                    context.clearChildMap(context);
                    context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                        layers: 'BatasWilayah:kabupaten_shp',
                        format: 'image/png',
                        transparent: true,
                        cql_filter: "(kpu_prop_id='" + selected.kpuid + "')"
                    }).addTo(context.map);
                } else if (hashs.length === 3) {
                    context.clearChildMap(context);
                    context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                        layers: 'BatasWilayah:kabupaten_shp',
                        format: 'image/png',
                        transparent: true,
                        cql_filter: "(kpu_kab_id='" + selected.kpuid + "')"
                    }).addTo(context.map);
                }
            };
            this.clearChildMap = function(context) {
                try {
                    context.map.eachLayer(function(layer) {
                        if (layer.options.layers !== "BatasWilayah:propinsi_shp") {
                            context.map.removeLayer(layer);
                        }
                    });
                } catch (e) {
                }
            };
            var context = this;
            $scope.$watch(function() {
                return location.hash;
            }, function(value) {
                context.getData();
            });
        }]);
    app.controller('dashboardController', ['$scope', '$http', '$KawalService', function($scope, $http, $KawalService) {
            this.setTahun = function(selected) {
                $scope.$parent.$parent.$tahun = selected.tahun;
                $KawalService.getDashboard($http, $scope);
            };
            this.getUser = function() {
                if ($scope.user.userlevel >= 1000) {
                    $scope.panelproprerty.users = "...";
                    $KawalService.getUser($http, $scope);
                }
            };
            $KawalService.getDashboard($http, $scope);
            $KawalService.sendToGa();
        }]);
    app.controller('UserController', ['$scope', '$window', '$http', '$KawalService', function($scope, $window, $http, $KawalService) {
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$tahun, $scope.$parent, $window)
            };
            $KawalService.sendToGa();
        }]);
    app.controller('userProfileController', ['$scope', '$window', '$http', '$KawalService', function($scope, $window, $http, $KawalService) {
            $scope.$parent.$parent.$tahun = '2015';
            this.searchWilayah3 = "";
            this.searchWilayah2 = "";
            this.searchWilayah1 = "";
            this.searchWilayah0 = "";
            var context = this;
            this.setLevelDesc = function(user) {
                angular.forEach(context.userlevelSelection, function(selected, key) {
                    if (user.userlevel === selected[0]) {
                        $scope.$parent.$parent.user.userlevelDesc = selected[1];
                    }
                });
            }
            $('.dropdown-menu').click(function(event) {
                var target = $(event.target);
                if (target.is("input") || target.is("i") || target.is("label") || target.is("div")) {
                    event.stopPropagation();
                }
            });
            this.submitShow = true;
            this.userlevelSelection = [[100, "Menghitung Cepat dari TPS dan Mengupload Foto C1"], [200, "Menghitung Suara Scan C1 dari http://kpu.go.id/"]];
            this.setUserlevelSelection = function(selected) {
                $scope.$parent.$parent.user.userlevel = selected[0];
                $scope.$parent.$parent.user.userlevelDesc = selected[1];
            }
            this.errorAlerts = [];
            this.successAlerts = [];
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.$tahun, $scope.$parent.$parent, $window)
            };
            this.provinsis = [];
            this.kabkotas = [];
            this.kecamatans = [];
            this.desas = [];
            var context = this;
            var callback = function(data, levelName) {
                context[levelName] = data[0];
            };

            this.setProvinsi = function(provinsi) {
                $scope.$parent.$parent.user.provinsi = provinsi.nama;
                $scope.$parent.$parent.user.provinsiId = provinsi.kpuid;
                $scope.$parent.$parent.user.kabkota = "";
                $scope.$parent.$parent.user.kabkotaId = "";
                $scope.$parent.$parent.user.kecamatan = "";
                $scope.$parent.$parent.user.kecamatanId = "";
                $scope.$parent.$parent.user.desa = "";
                $scope.$parent.$parent.user.desaId = "";
                this.searchWilayah3 = "";
                this.searchWilayah2 = "";
                this.searchWilayah1 = "";
                $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, provinsi.kpuid, callback, "kabkotas");
            }
            this.setKabkota = function(kabkota) {
                $scope.$parent.$parent.user.kabkota = kabkota.nama;
                $scope.$parent.$parent.user.kabkotaId = kabkota.kpuid;
                $scope.$parent.$parent.user.kecamatan = "";
                $scope.$parent.$parent.user.kecamatanId = "";
                $scope.$parent.$parent.user.desa = "";
                $scope.$parent.$parent.user.desaId = "";
                this.searchWilayah3 = "";
                this.searchWilayah2 = "";
                $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, kabkota.kpuid, callback, "kecamatans");
            }
            this.setKecamatan = function(kecamatan) {
                $scope.$parent.$parent.user.kecamatan = kecamatan.nama;
                $scope.$parent.$parent.user.kecamatanId = kecamatan.kpuid;
                $scope.$parent.$parent.user.desa = "";
                $scope.$parent.$parent.user.desaId = "";
                this.searchWilayah3 = "";
                $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, kecamatan.kpuid, callback, "desas");
            }
            this.setDesa = function(desa) {
                $scope.$parent.$parent.user.desa = desa.nama;
                $scope.$parent.$parent.user.desaId = desa.kpuid;
            }
            this.dosubmit = function(user, selected) {
                selected.errorAlerts = [];
                selected.successAlerts = [];
                if (user.email.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Isi Email Anda"});
                    return;
                }
                if (user.nokontak.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Isi No Kontak Anda"});
                    return;
                }
                if (("" + user.userlevel).length < 0) {
                    selected.errorAlerts.push({"text": "Silahakan Pilih 'Bersedia menjadi Relawan untuk'"});
                    return;
                }
                if (user.provinsi.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Pilih Provinsi Anda"});
                    return;
                }
                if (user.kabkota.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Pilih Kabupaten / Kota Anda"});
                    return;
                }
                if (user.kecamatan.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Pilih Kecamatan Anda"});
                    return;
                }
                if (user.desa.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Pilih Kelurahan / Desa Anda"});
                    return;
                }

                selected.submitShow = false;
                $KawalService.itemyangsedangdiproses.setUser(true);
                $http.post('/getModelData?form_action=updateUser', user).
                        success(function(data, status, headers, config) {
                            user = data.user;
                            selected.submitShow = true;
                            selected.successAlerts.push({"text": "Perubahan Data sudah berhasil disimpan, terima kasih atas kerjasamanya."});
                            $KawalService.itemyangsedangdiproses.setUser(false);
                        }).
                        error(function(data, status, headers, config) {
                            selected.submitShow = true;
                        });

            };
            this.reset = function() {
                location.reload();
            };
            $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, "0", callback, "provinsis");
            try {
                if ($scope.$parent.$parent.user.provinsiId.length > 0) {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, $scope.$parent.$parent.user.provinsiId, callback, "kabkotas");
                }
                if ($scope.$parent.$parent.user.kabkotaId.length > 0) {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, $scope.$parent.$parent.user.kabkotaId, callback, "kecamatans");
                }
                if ($scope.$parent.$parent.user.kecamatanId.length > 0) {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, $scope.$parent.$parent.user.kecamatanId, callback, "desas");
                }
            } catch (e) {
            }
            $KawalService.sendToGa();
        }]);
    app.controller('verifiaksiController', ['$http', '$scope', '$KawalService', function($http, $scope, $KawalService) {
            this.sedangprocess = false;
            this.verifiaksi = {"NIK": "", "NAMA": ""};
            this.errorAlerts = [];
            this.successAlerts = [];
            this.sosial = "";
            this.submitShow = true;
            this.close = function(page) {
                $scope.$parent.selectedTemplate.hash = page;
                $KawalService.handleHash(page.substr(1), $scope.$parent);
            }
            switch ($scope.$parent.user.type) {
                case "fb":
                    this.sosial = "Facebook";
                    break;
                case "twit":
                    this.sosial = "Twitter";
                    break;
            }
            this.doverifiaksi = function() {
                this.errorAlerts = [];
                this.successAlerts = [];
                if (this.verifiaksi.NIK.replace(" ", "") === "") {
                    this.errorAlerts.push({"text": "Silahakan Isi NIK anda"});
                    return;
                }
                if (this.verifiaksi.NAMA.replace(" ", "") === "") {
                    this.errorAlerts.push({"text": "Silahakan Isi Nama anda"});
                    return;
                }
                this.submitShow = false;
                this.sedangprocess = true;
                var context = this;
                $http.post('/login?form_action=verifikasi', [this.verifiaksi.NIK, this.verifiaksi.NAMA]).
                        success(function(data, status, headers, config) {
                            context.sedangprocess = false;
                            var getFloat = function(input) {
                                if (isNaN(input)) {
                                    return -1;
                                }
                                return parseFloat(input);
                            }
                            if (getFloat(data.status) > 60) {
                                context.successAlerts.push({"text": "VERIFIKASI BERHASIL"});
                                context.successAlerts.push({"text": context.verifiaksi.NAMA + " memiliki " + data.status + "% kecocokan dengan nama di " + context.sosial + " Anda yaitu: " + $scope.user.nama});
                                $KawalService.setloged($http, data.user, "", $scope);
                                $scope.selectedTemplate.closeModal = "/pages/closeModal.html";
                            } else if (getFloat(data.status) >= 0 && getFloat(data.status) <= 60) {
                                context.errorAlerts.push({"text": context.verifiaksi.NAMA + " memiliki " + data.status + "% kecocokan dengan nama di " + context.sosial + " Anda yaitu: " + $scope.user.nama});
                                context.errorAlerts.push({"text": "Tingkat kecocokan harus diatas 60%. Silahkan rubah nama di " + context.sosial + " Anda."});
                                context.submitShow = true;
                            } else {
                                context.errorAlerts.push({"text": data.status});
                                context.submitShow = true;
                            }
                            if (getFloat(data.status) >= 0) {
                                for (var i = 0; i < data.matchs.length; i++) {
                                    var obj = data.matchs[i];
                                    context.successAlerts.push({"text": obj});
                                }
                            }
                            if (getFloat(data.status) > 60) {
                                context.successAlerts.push({"text": "Jangan rubah nama di " + context.sosial + " Anda. Karena setiap kali anda Login, Nama yang tertera di " + context.sosial + " Anda akan dibandingkan dengan dengan nama di Sistem KawalPilkada.id"});
                            }
                        }).
                        error(function(data, status, headers, config) {
                            context.submitShow = true;
                            context.sedangprocess = false;
                        });

                //this.verifiaksi = {};
            }
            $KawalService.sendToGa();
        }]);

    app.controller('komentarController', ['$window', '$http', '$scope', '$KawalService', function($window, $http, $scope, $KawalService) {
            this.limit = 20;
            this.offset = 0;
            this.showError = false;
            this.showFile = false;
            this.showPhoto = false;
            this.isi = "";
            this.photos = "";
            this.photosrc = "";
            this.files = "";
            this.filename = "";
            this.cursorStr = "";
            this.filter = "";
            this.filterBy = "";
            this.pesans = [];
            this.pesan = "";
            this.fileisrequired = false;
            var context = this;

            this.setInitPesan = function() {
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs.length >= 2) {
                    this.pesan = hashs[1] + hashs[2] + hashs[3] + hashs[5];
                } else {
                    this.pesan = "Pesan Untuk Semua";
                }
            }

            this.init = function() {
                this.showError = false;
                this.showFile = false;
                this.showPhoto = false;
                this.isi = "";
                this.photos = [];
                this.photosrc = "";
                this.files = [];
                this.filename = "";
                this.setInitPesan();
            };
            this.setJenisKomentar = function(selected) {
                this.pesan = selected.jenisPesan;
            };
            this.props = {
                target: '_blank',
                class: 'myLink'
            };
            this.pesanInitialization = function(selected, pesan, $index, user) {
                pesan.imageUrl = "";
                pesan.foundImageUrl = false;
                pesan.fileUrl = "";
                pesan.foundFileUrl = false;
                pesan.showTanggapi = false;
                pesan.showTanggapiError = false;
                pesan.fileName = "";
                pesan.tanggapan = "";
                pesan.tanggapanPesanShow = false;
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                pesan.blockbutton_active = "";
                pesan.showHapus = false;
                if (pesan.dari_id === user.uid || user.userlevel >= 500) {
                    pesan.showHapus = true;
                }


                angular.forEach(pesan.files, function(file, key) {
                    if (file.fileType.indexOf("image") >= 0) {
                        pesan.imageUrl = file.fileLink;
                        pesan.foundImageUrl = true;
                    } else {
                        pesan.fileUrl = file.fileLink;
                        pesan.foundFileUrl = true;
                        pesan.fileName = file.fileName;
                    }
                });
            };
            this.btnTanggapan = function(user, pesan) {
                pesan.showTanggapiError = false;
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                pesan.showTanggapi = user.logged && (pesan.showTanggapi ? pesan.showTanggapi = false : pesan.showTanggapi = true);
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                }
                pesan.blockbutton_active = "btnTanggapan";
            };
            this.hideandshowTanggapan = function(pesan) {
                pesan.showTanggapiError = false;
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                pesan.tanggapanPesanShow = (pesan.tanggapanPesanShow ? pesan.tanggapanPesanShow = false : pesan.tanggapanPesanShow = true);
                pesan.blockbutton_active = "hideandshowTanggapan";
                //$scope.data = ["tanggapan#" + pesan.id, "", "", "", $scope.limit, pesan.tanggapanPesan.length, $index];
            };
            this.hideandshowSetuju = function(pesan) {
                pesan.showTanggapiError = false;
                pesan.tanggapanPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                pesan.setujuPesanShow = (pesan.setujuPesanShow ? pesan.setujuPesanShow = false : pesan.setujuPesanShow = true);
                pesan.blockbutton_active = "hideandshowSetuju";
                //$scope.data = ["setuju#" + pesan.id, "", "", "", $scope.limit, pesan.tanggapanPesan.length, $index];
            };
            this.hideandshowTidakSetuju = function(pesan) {
                pesan.showTanggapiError = false;
                pesan.tanggapanPesanShow = false;
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = (pesan.tidakSetujuPesanShow ? pesan.tidakSetujuPesanShow = false : pesan.tidakSetujuPesanShow = true);
                pesan.blockbutton_active = "hideandshowTidakSetuju";
                //$scope.data = ["setuju#" + pesan.id, "", "", "", $scope.limit, pesan.tanggapanPesan.length, $index];
            };
            this.isSelected = function(pesan, selected) {
                return pesan.blockbutton_active === selected;
            }
            this.kirimTanggapan = function(selected, pesan, $index) {
                if (pesan.tanggapan.length <= 0) {
                    return;
                }
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#tanggapan#" + pesan.id, "", "", "", "", pesan.tanggapan, "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                var callback = function(pesan) {
                    pesan.tanggapanPesanShow = false;
                    context.hideandshowTanggapan(pesan);
                }
                $KawalService.submitMsg($http, selected, $index, callback);
                this.init();
            }
            this.kirimSetuju = function(user, selected, pesan, $index) {
                pesan.showTanggapiError = false;
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                    return;
                }
                pesan.tanggapanPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#setuju#" + pesan.id, "", "", "", "", "Setuju", "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                var callback = function(pesan) {

                }
                $KawalService.submitMsg($http, selected, $index, callback);
                pesan.blockbutton_active = "kirimSetuju";
            }
            this.kirimTidakSetuju = function(user, selected, pesan, $index) {
                pesan.showTanggapiError = false;
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                    return;
                }
                pesan.tanggapanPesanShow = false;
                pesan.setujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#tidaksetuju#" + pesan.id, "", "", "", "", "Tidak Setuju", "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                var callback = function(pesan) {

                }
                $KawalService.submitMsg($http, selected, $index, callback);
                pesan.blockbutton_active = "kirimTidakSetuju";
            }
            this.kirimHapus = function(user, selected, pesan, $index) {
                pesan.showTanggapiError = false;
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                    return;
                }
                pesan.tanggapanPesanShow = false;
                pesan.setujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#hide#" + pesan.id, "", "", "", "", "", "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                var callback = function(pesan) {
                    context.pesans.splice($index, 1);
                };
                $KawalService.submitMsg($http, selected, $index, callback);
            };
            this.photoChange = function(selected) {
                this.photos = selected.files;
                var contex = this;
                for (var i = 0, f; f = this.photos[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                        return function(e) {
                            $scope.$apply(function() {
                                contex.photosrc = e.target.result;
                                contex.showPhoto = true;
                            })
                        };
                    })(f);
                    reader.readAsDataURL(f);
                }
            };
            this.fileChange = function(selected) {
                this.files = selected.files
                var contex = this;
                for (var i = 0, f; f = this.files[i]; i++) {
                    if (!f.type.match('application/pdf')) {
                        continue;
                    }
                    $scope.$apply(function() {
                        contex.filename = f.name;
                        contex.showFile = true;
                    })
                }
                this.showFile = true;
            };
            this.setfileisrequired = function(val) {
                this.fileisrequired = val;
            }
            this.kirimPesan = function() {
                this.showError = false;
                if (this.isi.length <= 0) {
                    this.showError = true;
                    return;
                }
                if ((this.files.length === 0 && this.photos.length === 0) && this.fileisrequired) {
                    this.showError = true;
                    return;
                }
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                this.data = [this.pesan, "", "", "", "", this.isi, "", "", 1, 0, "0", ""];
                if (this.files.length > 0 || this.photos.length > 0) {
                    $KawalService.getUrlFile($http, this);
                } else {
                    this.data.push([]);
                    var callback = function(pesan) {

                    }
                    $KawalService.submitMsg($http, this, callback);
                }
            };
            this.getMoredata = function() {
                this.offset = this.pesans.length;
                this.data = [this.pesan, this.filter, this.filterBy, this.cursorStr, this.limit, this.offset];
                $KawalService.getPesans($http, this);
                $KawalService.sendToGa();
            }
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.$tahun, $scope.$parent.$parent, $window)
            };
            this.setInitPesan();
            this.data = [this.pesan, this.filter, this.filterBy, this.cursorStr, this.limit, this.offset];
            $KawalService.getPesans($http, this);
            $KawalService.sendToGa();
        }]);
})();
