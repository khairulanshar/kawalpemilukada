var $kpuurl = "http://scanc1.kpu.go.id/viewp.php";
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
                    if (typeof value !== "undefined" && value !== null && value.length > 0)
                        element.html($autolinker.link(value.replace(/(?:\r\n|\r|\n)/g, '<br/>')));
                });
            }
        };
    });
    app.controller('tabulasiController', ['$scope', '$http', '$KawalService', '$window', function($scope, $http, $KawalService, $window) {
            this.numberDecimal = 4;
            this.KandidatWilayah0 = "";
            this.setTooltip = function() {
                try {
                    $('[data-toggle="tooltip"]').tooltip();
                } catch (e) {
                }
            }
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.tahun, $scope.$parent.$parent, $window)
            };
            this.jumlahTotalKandidat = 0;
            this.roundToTwo = function(num, a) {
                return $KawalService.roundToTwo(num, a);
            };
            this.setpercent = function(a, b) {
                return $KawalService.setpercent(a, b);
            };
            var context = this;
            this.save1 = function($event, dataSuara, type, $index) {
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var callback = function() {
                    target.html(orignalHtml);
                }
                $KawalService.submitSuara($http, $scope, dataSuara, type, $index, callback);
            };
            this.save = function($event, dataSuara, type, $index) {
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var callback = function() {
                    target.html(orignalHtml);
                }
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
                    if (dataSuara.suarasahHC.length === 0) {
                        dataSuara["errorAlertsHC"].push('Suara Sah tidak boleh kosong');
                    }
                    if (dataSuara.suaratidaksahHC.length === 0) {
                        dataSuara["errorAlertsHC"].push('Suara Tidak Sah tidak boleh kosong');
                    }
                    if (dataSuara["errorAlertsHC"].length > 0) {
                        callback();
                        dataSuara["sedangdisaveHC"] = false;
                        return;
                    }

                    if (dataSuara["tps_file"].length === 0) {
                        $KawalService.getUrlFileSuaraTPS($http, $scope, dataSuara, "save/" + type + "/withimage", $index, callback);
                    } else {
                        $KawalService.submitSuara($http, $scope, dataSuara, "save/" + type + "/noimage", $index, callback);
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
                            callback();
                            dataSuara["sedangdisave"] = false;
                            return;
                        }
                    }
                    $KawalService.submitSuara($http, $scope, dataSuara, "save/" + type, $index, callback);
                }
            };
            this.photoChange = function(selected) {
                var id = parseInt(selected.id.replace("photo", ""));
                for (var i = 0, f; f = selected.files[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    $scope.$apply(function(scope) {
                        scope.tabulasiCtrl.DataSuarasTPS[id].photos.push(f)
                        var reader = new FileReader();
                        reader.onload = (function(theFile) {
                            return function(e) {
                                $scope.$apply(function(scope) {
                                    scope.tabulasiCtrl.DataSuarasTPS[id].photosrc = e.target.result;
                                    scope.tabulasiCtrl.DataSuarasTPS[id].showPhoto = true;
                                    scope.tabulasiCtrl.DataSuarasTPS[id].errorAlerts = [];
                                    scope.tabulasiCtrl.DataSuarasTPS[id].tps_file = [];
                                    scope.tabulasiCtrl.initDivImg("HC" + id);
                                });
                            };
                        })(f);
                        reader.readAsDataURL(f);
                    });
                }
            };
            this.controlWilayahs = [
                {id: 1, kpuid: "0", nama: "Nasional", tingkat: "Nasional", showdiv: false}
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
            this.setPage = function(controlWilayah, $index) {
                if (this.controlWilayahs.length > $index + 1 && this.controlWilayahs.length > 1) {
                    this.controlWilayahs.splice($index + 1, (this.controlWilayahs.length));
                }
                var urlfilter = "";
                for (var i = 0; i < this.controlWilayahs.length; i++) {
                    if (i === 0) {
                        urlfilter = urlfilter + "/" + $scope.$parent.$parent.tahun;
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
                var currentPath = window.location.hash.substr(1).replace("/" + hashs[0] + "/", "");
                if (hashs[1] === "Kabupaten-Kota" && parentkpuid > 0) {
                    $KawalService.handleHash("/tabulasi.html/" + "/" + currentPath + "/" + kandidatWilayah.parentkpuid + "/" + kandidatWilayah.kpuid, $scope);
                } else {
                    $KawalService.handleHash("/tabulasi.html/" + "/" + currentPath + "/" + kandidatWilayah.kpuid, $scope);
                }
            };
            this.showTable = function(data) {
                if (data.length > 0) {
                    return true;
                } else {
                    return false;
                }
            };
            this.showTextBox = function(userlevel, user, dataSuara, attributeName, val, type) {
                if (user.logged && dataSuara[attributeName] === val && user.terverifikasi === "Y") {
                    if (user.userlevel >= 1000) {
                        return true;
                    } else {
                        if ((type === 'HC' && user.userlevel === userlevel)
                                || (type === 'HC' && user.userlevel === userlevel)
                                || (type === 'C1' && user.userlevel === userlevel)
                                || (type === 'C1' && user.userlevel === userlevel)) {
                            return true;
                        } else {
                            return false;
                        }
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
            this.countKandidat = function() {
                context.jumlahTotalKandidat = 0;
                angular.forEach(context.KandidatWilayahs, function(kandidatWilayah, key) {
                    context.jumlahTotalKandidat = context.jumlahTotalKandidat + kandidatWilayah.kandidat.length;
                });

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
                try {
                    if (!isNaN(dataSuara["nama"])) {
                        dataSuara["nama"] = parseInt(dataSuara["nama"])
                    }
                } catch (e) {
                }
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
                if (hashs[0] !== "tabulasi.html" && hashs[0] !== "dashboard.html") {
                    return;
                }
                context.jumlahTotalKandidat = 0;
                context.tingkat = hashs[1];
                context.KandidatWilayahs = [];
                context.DataSuaras = [];
                context.DataSuarasTPS = [];
                context.DataDesa = [];
                context.blmadaData = true;
                context.namas = [];
                context.uruts = [];
                context.controlWilayahs = [
                    {id: 1, kpuid: "0", nama: "Nasional", tingkat: "Nasional", showdiv: false}
                ];
                if (hashs.length >= 3) {
                    $scope.$parent.$parent.tahun = hashs[2];
                }
                $KawalService.itemyangsedangdiproses.setTabulasi(true);
                var search = false;
                if (hashs.length === 4) {
                    if (isNaN(hashs[hashs.length - 1])) {
                        search = true;
                        context.KandidatWilayah0 = hashs[hashs.length - 1];
                        context.KandidatWilayah0 = context.KandidatWilayah0.replace(new RegExp('-', 'g'), ' ')
                    }
                }
                if (hashs.length > 4) {
                    if (isNaN(hashs[3])) {
                        var text = hashs[3];
                        var texthash = window.location.hash;
                        texthash = texthash.replace(new RegExp('/' + text, 'g'), '')
                        search = false;
                        context.KandidatWilayah0 = "";
                        $KawalService.handleHash(texthash.substr(1), $scope);
                        hashs = window.location.hash.substr(2).split("/");
                    }
                }
                if (hashs.length > 3 && (!search)) {
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
                        $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + $scope.$parent.$parent.tahun, $scope);
                        hashs.push($scope.$parent.$parent.tahun);
                    }
                    $http.get('/kandidat/get/' + hashs[2] + '/' + hashs[1]).
                            success(function(data, status, headers, config) {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        context.blmadaData = false;
                                        context.KandidatWilayahs = data;
                                        context.countKandidat();
                                    }
                                }
                                $KawalService.itemyangsedangdiproses.setTabulasi(false);
                            }).
                            error(function(data, status, headers, config) {

                            });
                }
            };
            $KawalService.sendToGa();
            $scope.$watch(function() {
                return window.location.hash;
            }, function(value) {
                context.getData();
            });
        }]);
    app.controller('crowddataController', ['$scope', '$http', '$KawalService', '$window', function($scope, $http, $KawalService, $window) {
            var context = this;
            this.crowdatas = [];
            this.KandidatWilayah0 = "";
            this.updatedata = function($event, $index, val, crowdata) {
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var hashs = window.location.hash.substr(2).split("/");
                $http.post('/kandidat/update-profil-crowd/' + hashs[2] + '/' + hashs[1] + '/' + crowdata.kpu_paslon_id + '/' + val, []).
                        success(function(data, status, headers, config) {
                            context.crowdatas[$index] = data[0];
                            $("#collapse" + context.crowdatas[$index].kpu_paslon_id).addClass("in");
                            target.html(orignalHtml);
                        }).
                        error(function(data, status, headers, config) {
                            target.html(orignalHtml);
                        });
            }
            this.getData = function() {
                context.crowdatas = [];
                $KawalService.itemyangsedangdiproses.setTabulasi(true);
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs.length < 2) {
                    if (typeof $scope.$parent.$parent.tingkat === "undefined" || $scope.$parent.$parent.tingkat === "") {
                        $scope.$parent.$parent.tingkat = "Provinsi";
                    }
                    hashs.push($scope.$parent.$parent.tingkat)
                    $KawalService.handleHash("/" + hashs[0] + "/" + $scope.$parent.$parent.tingkat + "/" + $scope.$parent.$parent.tahun, $scope);
                }
                if (hashs.length < 3) {
                    $KawalService.handleHash("/" + hashs[0] + "/" + hashs[1] + "/" + $scope.$parent.$parent.tahun, $scope);
                }
                $http.get('/kandidat/get-profil-crowd/' + hashs[2] + '/' + hashs[1]).
                        success(function(data, status, headers, config) {
                            if (data.length > 0) {
                                data = data[0]
                                context.crowdatas = data;
                            }
                            $KawalService.itemyangsedangdiproses.setTabulasi(false);
                        }).
                        error(function(data, status, headers, config) {

                        });
            };
            $KawalService.sendToGa();
            $scope.$watch(function() {
                return window.location.hash;
            }, function(value) {
                context.getData();
            });
        }]);
    app.controller('profilKandidatController', ['$scope', '$http', '$KawalService', '$sce', function($scope, $http, $KawalService, $sce) {
            this.kandidat = $KawalService.getSelectedKandidat();
            this.props = {
                target: '_blank',
                class: 'myLink'
            };
            this.url = location.href;
            this.kandidatJSON = $KawalService.getSelectedKandidat();
            this.showSumber = false;
            this.wilayah = $KawalService.getSelectedWilayah();
            var context = this;
            this.dataCari = [];
            this.moreResult = {};
            this.trustAsHtml = function($index) {
                context.dataCari[$index].title = $sce.trustAsHtml(context.dataCari[$index].title);
                context.dataCari[$index].titleNoFormatting = $sce.trustAsHtml(context.dataCari[$index].titleNoFormatting);
                context.dataCari[$index].content = $sce.trustAsHtml(context.dataCari[$index].content);
            };
            this.getFromJSON = function() {
                context.dataCari = [];
                context.moreResult = {}
                $KawalService.itemyangsedangdiproses.setKandidat(true);
                var hashs = window.location.hash.substr(2).split("/");
                $http.get('/kandidat/get-profil-from-json/' + hashs[1] + '/dataKandidat/' + context.kandidat.kpu_id_peserta).
                        success(function(data, status, headers, config) {
                            try {
                                context.kandidatJSON = data[0];
                                context.kandidatHTML = $sce.trustAsHtml(data[1].substr(0, data[1].length - 10).replace(new RegExp('href="/', 'g'), 'href="http://infopilkada.kpu.go.id/'));
                                var callback = function(data) {
                                    try {
                                        var datax = data[0];
                                        context.moreResult = data[1];
                                        for (var i = 0; i < datax.length; i++) {
                                            var found = false;
                                            for (var ii = 0; ii < context.dataCari.length; ii++) {
                                                var tempCurrent = context.dataCari[ii];
                                                if (tempCurrent.url === datax[i].url) {
                                                    found = true;
                                                }
                                            }
                                            if (datax[i].visibleUrl !== 'infopilkada.kpu.go.id'
                                                    && datax[i].visibleUrl.indexOf("blogspot.com") < 0
                                                    && datax[i].visibleUrl.indexOf("facebook.com") < 0
                                                    && datax[i].url.indexOf("www.tribunnews.com/tag/") < 0
                                                    && (!found)) {
                                                context.dataCari.push(datax[i]);
                                            }
                                        }
                                    } catch (e) {
                                    }
                                }
                                $KawalService.getSentimentAnalysis($http, 0, context.kandidatJSON[1] + " " + context.kandidatJSON[4] + " pilkada " + context.wilayah.nama, callback);
                                $KawalService.getSentimentAnalysis($http, 4, context.kandidatJSON[1] + " " + context.kandidatJSON[4] + " pilkada " + context.wilayah.nama, callback);
                                $KawalService.getSentimentAnalysis($http, 8, context.kandidatJSON[1] + " " + context.kandidatJSON[4] + " pilkada " + context.wilayah.nama, callback);
                                $KawalService.getSentimentAnalysis($http, 12, context.kandidatJSON[1] + " " + context.kandidatJSON[4] + " pilkada " + context.wilayah.nama, callback);
                                $KawalService.getSentimentAnalysis($http, 16, context.kandidatJSON[1] + " " + context.kandidatJSON[4] + " pilkada " + context.wilayah.nama, callback);
                                //$KawalService.getSentimentAnalysis($http, " pilkada " + context.wilayah.nama, callback);
                                //$KawalService.getSentimentAnalysis($http, context.kandidatJSON[4] + " pilkada " + context.wilayah.nama, callback);
                            } catch (e) {
                            }
                            context.showSumber = true;
                            $('#twitter').sharrre({
                                share: {
                                    twitter: true
                                },
                                enableHover: false,
                                enableTracking: true,
                                buttons: {twitter: {via: 'kawalpilkada'}},
                                click: function(api, options) {
                                    api.simulateClick();
                                    api.openPopup('twitter');
                                }
                            });
                            $('#facebook').sharrre({
                                share: {
                                    facebook: true
                                },
                                enableHover: false,
                                enableTracking: true,
                                click: function(api, options) {
                                    api.simulateClick();
                                    api.openPopup('facebook');
                                }
                            });
                            $KawalService.itemyangsedangdiproses.setKandidat(false);
                        }).
                        error(function(data, status, headers, config) {

                        });
            };
            this.CrowdProfilData = {};
            this.CrowdProfilDataTemp = {};
            this.crowdEdit = false;
            this.setcrowdEdit = function(val) {
                context.getFromCrowd(val);
            };
            this.errorMsgNotAuthorize = "";
            this.getFromCrowd = function(edit) {
                if (typeof edit === "undefined") {
                    edit = false;
                }
                context.CrowdProfilData = {};
                context.errorMsgNotAuthorize = "";
                var hashs = window.location.hash.substr(2).split("/");
                var crowddata = {"nama": "",
                    "SD": "",
                    "SMP": "",
                    "SMA": "",
                    "S1": "",
                    "S2": "",
                    "S3": "",
                    "Karir_Politik_Birokrasi": "",
                    "Jejak_Bisnis": "",
                    "Jejaring_Keluarga": "",
                    "Aktivitas_Sosial": "",
                    "Prestasi_Karya": "",
                    "Riwayat_Kasus": ""};
                context.CrowdProfilData["ketua"] = $.extend({}, crowddata);
                context.CrowdProfilData["wakil"] = $.extend({}, crowddata);
                context.CrowdProfilData["main"] = {validated: "N", kpuid: hashs[3], nama: hashs[4], kpu_paslon_id: context.kandidat.kpu_id_peserta, parentkpuid: context.wilayah.parentkpuid, parentNama: context.wilayah.parentNama, visi: "", misi: "", program_pendidikan: "", program_hukum: "", program_ekonomi: "", dana_kampanye: ""};
                $KawalService.itemyangsedangdiproses.setKandidat(true);
                $http.get('/kandidat/get-profil-crowd-single/' + hashs[1] + '/' + hashs[2] + '/' + context.kandidat.kpu_id_peserta).
                        success(function(data, status, headers, config) {
                            try {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        data = data[0];
                                        if (data.validated === "Y" || (data.validated === "N" && $scope.$parent.$parent.user.logged) || (data.validated === "P" && $scope.$parent.$parent.user.uid === data.diupdate_id) || $scope.$parent.$parent.user.userlevel > 5000) {
                                            context.CrowdProfilData = data;
                                            context.CrowdProfilData["ketua"] = $.extend({}, data.profil.ketua);
                                            context.CrowdProfilData["wakil"] = $.extend({}, data.profil.wakil);
                                            context.CrowdProfilData["main"] = {validated: data.validated, kpuid: data.kpuid, nama: data.nama, kpu_paslon_id: data.kpu_id_peserta, parentkpuid: data.parentkpuid, parentNama: data.parentNama, visi: data.visi, misi: data.misi, program_pendidikan: data.program_pendidikan, program_hukum: data.program_hukum, program_ekonomi: data.program_ekonomi, dana_kampanye: data.dana_kampanye};
                                            if (data.validated === "P") {
                                                context.crowdEdit = edit;
                                            }
                                        } else {
                                            if (data.validated === "P") {
                                                context.errorMsgNotAuthorize = "Data sudah diisi dan sedang direview.";
                                            }
                                        }
                                    }
                                } else {
                                    context.crowdEdit = edit;
                                }

                            } catch (e) {
                            }

                            $KawalService.itemyangsedangdiproses.setKandidat(false);
                        }).
                        error(function(data, status, headers, config) {

                        });
            };
            this.showBtnEdit = function(user) {
                try {
                    return (!context.crowdEdit) && ((context.CrowdProfilData['main'].validated === 'N' && user.logged) || (context.CrowdProfilData['main'].validated === 'P' && user.uid === context.CrowdProfilData.diupdate_id) || $scope.$parent.$parent.user.userlevel > 5000);
                } catch (e) {
                    return false;
                }
            };
            this.saveit = function($event) {
                context.setValArray("ketua");
                context.setValArray("wakil");
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var hashs = window.location.hash.substr(2).split("/");
                $http.post('/kandidat/post-profil-crowd/' + hashs[1] + '/' + hashs[2] + '/' + context.kandidat.kpu_id_peserta, context.CrowdProfilData).
                        success(function(data, status, headers, config) {
                            data = data[0];
                            context.CrowdProfilData = data;
                            context.CrowdProfilData["ketua"] = $.extend({}, data.profil.ketua);
                            context.CrowdProfilData["wakil"] = $.extend({}, data.profil.wakil);
                            context.CrowdProfilData["main"] = {validated: data.validated, kpuid: data.kpuid, nama: data.nama, kpu_paslon_id: data.kpu_id_peserta, parentkpuid: data.parentkpuid, parentNama: data.parentNama, visi: data.visi, misi: data.misi, program_pendidikan: data.program_pendidikan, program_hukum: data.program_hukum, program_ekonomi: data.program_ekonomi, dana_kampanye: data.dana_kampanye};
                            target.html(orignalHtml);
                            context.crowdEdit = false;
                        }).
                        error(function(data, status, headers, config) {
                            target.html(orignalHtml);
                        });

            };
            this.setValArray = function(attribute) {
                context.CrowdProfilData[attribute + "Array"] = [];
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].nama);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].SD);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].SMP);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].SMA);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].S1);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].S2);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].S3);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].Karir_Politik_Birokrasi);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].Jejak_Bisnis);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].Jejaring_Keluarga);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].Aktivitas_Sosial);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].Prestasi_Karya);
                context.CrowdProfilData[attribute + "Array"].push(context.CrowdProfilData[attribute ].Riwayat_Kasus);
            };
            this.getData = function() {
                var test = 0;
                try {
                    test = context.wilayah.nama.length;
                } catch (e) {
                    test = 0;
                }
                var hashs = window.location.hash.substr(2).split("/");
                if (test === 0) {
                    $KawalService.itemyangsedangdiproses.setKandidat(true);
                    $http.get('/kandidat/single/' + hashs[1] + '/' + hashs[2] + '/' + hashs[3]).
                            success(function(data, status, headers, config) {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        context.wilayah = data[0];
                                        angular.forEach(context.wilayah.kandidat, function(value, key) {
                                            if ($KawalService.replaceSpecial(value.nama, '-') === hashs[6]) {
                                                context.kandidat = value;
                                                context.getFromJSON();
                                                context.getFromCrowd();
                                            }
                                        });
                                    }
                                }
                                $KawalService.itemyangsedangdiproses.setKandidat(false);
                            }).
                            error(function(data, status, headers, config) {

                            });
                } else {
                    context.getFromJSON();
                    context.getFromCrowd();
                }
            };
            $KawalService.sendToGa();
            $scope.$watch(function() {
                return location.hash;
            }, function(value) {
                context.getData();
            });
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
            var context = this;
            this.editKandiat = function(kandidat, wilayah) {
                context.showForm(context);
                context.showAddNewCandidate = true;
                if ($scope.$parent.$parent.user.userlevel >= 1000 && context.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, wilayah.parentkpuid, context.callback, "kabkotas");
                }
                context.kandidat.nama = kandidat.nama;
                context.kandidat.kpu_id_peserta = kandidat.kpu_id_peserta;
                context.kandidat.urut = kandidat.urut + "";
                if (context.kandidat.tingkat === "Provinsi") {
                    context.kandidat.provinsi = wilayah.nama;
                    context.kandidat.provinsiId = wilayah.kpuid;
                } else {
                    context.kandidat.kabupaten = wilayah.nama;
                    context.kandidat.kabupatenId = wilayah.kpuid;
                    context.kandidat.provinsi = wilayah.parentNama;
                    context.kandidat.provinsiId = wilayah.parentkpuid;
                }
            };
            $('.dropdown-menu').click(function(event) {
                var target = $(event.target);
                if (target.is("input") || target.is("i") || target.is("label") || target.is("div")) {
                    event.stopPropagation();
                }
            });
            this.photoChange = function(selected) {
                this.photos = selected.files;
                for (var i = 0, f; f = this.photos[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                        return function(e) {
                            $scope.$apply(function() {
                                context.photosrc = e.target.result;
                                context.showPhoto = true;
                                context.errorAlerts = []
                            })
                        };
                    })(f);
                    reader.readAsDataURL(f);
                }
            };

            this.callback = function(data, levelName) {
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
                img_url: "",
                kpu_id_peserta: ""
            }
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
                    kabupaten: "",
                    img_url: "",
                    kpu_id_peserta: ""
                }
                selected.showAddNewCandidate = !selected.showAddNewCandidate;
                if ($scope.$parent.$parent.user.userlevel >= 1000 && context["provinsis"].length === 0) {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, "0", context.callback, "provinsis");
                }
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
                var urlFilter = $scope.$parent.$parent.tahun + "/" + id;
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
                    var urlFilter = $scope.$parent.$parent.tahun + "/" + id;
                    $KawalService.getWilayah($http, this, urlFilter, callback, id);
                }
            };
            this.resetup = function(kandidatCtrl, wilayah, $index, user) {
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
                if (user.userlevel >= 5000) {
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
                    $scope.$parent.$parent.tahun = hashs[2];
                } else {
                    $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + $scope.$parent.$parent.tahun, $scope);
                    hashs.push($scope.$parent.$parent.tahun);
                }
                this.kandidat = {
                    nama: "",
                    tingkatId: "",
                    tingkat: hashs[1],
                    provinsiId: "",
                    provinsi: "",
                    kabupatenId: "",
                    kabupaten: "",
                    img_url: "",
                    kpu_id_peserta: ""
                }
                if (this.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                    this.showKabupaten = true;
                } else {
                    this.showKabupaten = false;
                }
                this.wilayahs = [];
                this.wilayah = {nama: "", kandidat: [], kpuid: "", dikunci: ""};
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, "0", context.callback, "provinsis");
                }
                $KawalService.itemyangsedangdiproses.setKandidat(true);
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
            this.dosubmit = function($event, user, selected) {
                selected.errorAlerts = [];
                selected.successAlerts = [];
                if (selected.kandidat.nama.replace(" ", "") === "") {
                    selected.errorAlerts.push({"text": "Silahakan Isi Nama Kandidat"});
                    return;
                }
                try {
                    if (selected.kandidat.kpu_id_peserta.replace(" ", "") === "") {
                        selected.errorAlerts.push({"text": "Silahakan Isi KPU Peserta ID"});
                        return;
                    }
                } catch (e) {
                    selected.errorAlerts.push({"text": "Silahakan Isi KPU Peserta ID"});
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
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var callback = function() {
                    target.html(orignalHtml);
                }
                $KawalService.getUrlFileKandidat($http, $scope, callback);
                return false;
            }
            this.setProvinsi = function(selected) {
                this.kandidat.provinsiId = selected.kpuid;
                this.kandidat.provinsi = selected.nama;
                if (this.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, selected.kpuid, context.callback, "kabkotas");
                }
            }
            this.setKabupaten = function(selected) {
                this.kandidat.kabupatenId = selected.kpuid;
                this.kandidat.kabupaten = selected.nama;
            }

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
                    $KawalService.handleHash(hashs[0] + "/" + $scope.$parent.$parent.tahun + "/0", $scope.$parent.$parent);
                    hashs.push($scope.$parent.$parent.tahun);
                    hashs.push("0");
                } else if (hashs.length === 2) {
                    $scope.$parent.$parent.tahun = hashs[1];
                    $KawalService.handleHash(hashs[0] + "/" + hashs[1] + "/0", $scope.$parent.$parent);
                    hashs.push("0");
                } else {
                    $scope.$parent.$parent.tahun = hashs[1];
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
            /*this.setTahun = function(selected) {
             $scope.$parent.$parent.tahun = selected.tahun;
             var hashs = window.location.hash.substr(2).split("/");
             $KawalService.handleHash(hashs[0] + "/" + selected.tahun + "/0", $scope.$parent.$parent);
             };*/
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

            this.setHash = function() {
                if (window.location.hash.substr(window.location.hash.length - 1) === "/") {
                    window.location.hash = window.location.hash.substr(0, window.location.hash.length - 1);
                }
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[0] !== "dashboard.html") {
                    return;
                }
                if (hashs.length <= 1) {
                    $KawalService.handleHash(hashs[0] + "/" + $scope.$parent.$parent.tingkat + "/" + $scope.$parent.$parent.tahun, $scope.$parent.$parent);
                } else if (hashs.length === 2) {
                    $scope.$parent.$parent.tingkat = hashs[1];
                    $KawalService.handleHash(hashs[0] + "/" + hashs[1] + "/" + $scope.$parent.$parent.tahun, $scope.$parent.$parent);
                } else {
                    $scope.$parent.$parent.tingkat = hashs[1];
                    $scope.$parent.$parent.tahun = hashs[2];
                }
                $KawalService.getDashboard($http, $scope.$parent.$parent);

            };
            var context = this;
            this.getUser = function() {
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    $scope.panelproprerty.users = "...";
                    $KawalService.getUser($http, $scope.$parent.$parent);
                }
            };
            $KawalService.sendToGa();
            $scope.$watch(function() {
                return window.location.hash;
            }, function(value) {
                context.setHash();
            });
        }]);
    app.controller('UserController', ['$scope', '$window', '$http', '$KawalService', function($scope, $window, $http, $KawalService) {
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.tahun, $scope.$parent, $window)
            };
            $KawalService.sendToGa();
        }]);
    app.controller('userProfileController', ['$scope', '$window', '$http', '$KawalService', function($scope, $window, $http, $KawalService) {
            $scope.$parent.$parent.tahun = '2015';
            this.searchWilayah3 = "";
            this.searchWilayah2 = "";
            this.searchWilayah1 = "";
            this.searchWilayah0 = "";
            var context = this;
            this.verifikasi = function() {
                $scope.$parent.$parent.selectedTemplate.pathmodal = "/pages/verifikasi.html";
                $('#myModal').modal();
            }
            $('.dropdown-menu').click(function(event) {
                var target = $(event.target);
                if (target.is("input") || target.is("i") || target.is("label") || target.is("div")) {
                    event.stopPropagation();
                }
            });
            this.submitShow = true;
            this.setUserlevelSelection = function(selected) {
                $scope.$parent.$parent.user.userlevel = selected[0];
                $scope.$parent.$parent.user.userlevelDesc = selected[1];
            }
            this.errorAlerts = [];
            this.successAlerts = [];
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.tahun, $scope.$parent.$parent, $window)
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
            this.dosubmit = function($event, user, selected) {
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
                /*if (("" + user.userlevel).length < 0) {
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
                 }*/

                //selected.submitShow = false;
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                $http.post('/getModelData?form_action=updateUser', user).
                        success(function(data, status, headers, config) {
                            user = data.user;
                            selected.submitShow = true;
                            selected.successAlerts.push({"text": "Perubahan Data sudah berhasil disimpan, terima kasih atas kerjasamanya."});
                            target.html(orignalHtml);
                        }).
                        error(function(data, status, headers, config) {
                            selected.submitShow = true;
                            target.html(orignalHtml);
                        });
                return false;
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
                $scope.$parent.$parent.selectedTemplate.hash = page;
                $KawalService.handleHash(page.substr(1), $scope.$parent.$parent);
            }
            switch ($scope.$parent.$parent.user.type) {
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
                                $KawalService.setloged($http, data.user, "", $scope.$parent.$parent);
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
                    this.pesan = hashs[1] + hashs[2] + hashs[3] + '#' + hashs[5];
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
                selected.callback = function(pesan) {
                    pesan.tanggapanPesanShow = false;
                    context.hideandshowTanggapan(pesan);
                }
                $KawalService.submitMsg($http, selected, $index);
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
                selected.callback = function(pesan) {

                }
                $KawalService.submitMsg($http, selected, $index);
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
                selected.callback = function(pesan) {

                }
                $KawalService.submitMsg($http, selected, $index);
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
                selected.callback = function(pesan) {
                    context.pesans.splice($index, 1);
                };
                $KawalService.submitMsg($http, selected, $index);
            };
            this.photoChange = function(selected) {
                this.photos = selected.files;
                for (var i = 0, f; f = this.photos[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                        return function(e) {
                            $scope.$apply(function() {
                                context.photosrc = e.target.result;
                                context.showPhoto = true;
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
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs.length > 2) {
                    this.data = [this.pesan, "", "", "", "", this.isi, "", "", 1, 0, "0", "", hashs[1], hashs[2], hashs[3], hashs[5]];
                } else {
                    this.data = [this.pesan, "", "", "", "", this.isi, "", "", 1, 0, "0", "", "", "", "", ""];
                }
                this.callback = function(data) {
                    try {
                        angular.forEach(data.kandidatWilayah.kandidat, function(value, key) {
                            if ($KawalService.replaceSpecial(value.nama, '-') === hashs[6]) {
                                $KawalService.setSelectedKandidat(value, data.kandidatWilayah);
                                $scope.$$prevSibling.profilKandidatCtrl.kandidat = $KawalService.getSelectedKandidat();
                                $scope.$$prevSibling.profilKandidatCtrl.wilayah = $KawalService.getSelectedWilayah();
                            }
                        });
                    } catch (e) {
                    }
                };
                if (this.files.length > 0 || this.photos.length > 0) {
                    $KawalService.getUrlFile($http, this);
                } else {
                    this.data.push([]);
                    $KawalService.submitMsg($http, this);
                }
            };
            this.getMoredata = function() {
                this.offset = this.pesans.length;
                this.data = [this.pesan, this.filter, this.filterBy, this.cursorStr, this.limit, this.offset];
                $KawalService.getPesans($http, this);
                $KawalService.sendToGa();
            };
            this.login = function(url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.tahun, $scope.$parent.$parent, $window);
            };
            this.setInitPesan();
            this.data = [this.pesan, this.filter, this.filterBy, this.cursorStr, this.limit, this.offset];
            $KawalService.getPesans($http, this);
            $KawalService.sendToGa();
        }]);
})();
