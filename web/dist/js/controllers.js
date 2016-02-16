var $kpuurl = "http://scanc1.kpu.go.id/viewp.php";
var $autolinker = new Autolinker({newWindow: true, className: "myLink"});
(function () {
    var app = angular.module('controllers', []);
    app.directive('myEnter', function () {
        return function (scope, element, attrs) {
            var ctrl = false;
            element.bind("keyup", function (event) {
                if (event.which === 17) {
                    ctrl = false;
                    event.preventDefault();
                }
            });
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myEnter);
                    });
                    event.preventDefault();
                }
                if (event.which === 17) {
                    ctrl = true;
                    event.preventDefault();
                }
                if (ctrl && event.which === 49 || ctrl && event.which === 97) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myCtrl1);
                    });
                    event.preventDefault();
                }
                if (ctrl && event.which === 50 || ctrl && event.which === 98) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myCtrl2);
                    });
                    event.preventDefault();
                }
                if (ctrl && event.which === 51 || ctrl && event.which === 99) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myCtrl3);
                    });
                    event.preventDefault();
                }
                if (ctrl && event.which === 52 || ctrl && event.which === 100) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myCtrl4);
                    });
                    event.preventDefault();
                }
                if (ctrl && event.which === 53 || ctrl && event.which === 101) {
                    scope.$apply(function () {
                        scope.$eval(attrs.myCtrl5);
                    });
                    event.preventDefault();
                }
            });
        };
    });
    app.directive('focus',
            function ($timeout) {
                return {
                    scope: {
                        trigger: '@focus'
                    },
                    link: function (scope, element) {
                        scope.$watch('trigger', function (value) {
                            if (value === "true") {
                                $timeout(function () {
                                    element[0].focus();
                                });
                            }
                        });
                    }
                };
            }
    );
    app.directive('eventFocus', function (focus) {
        return function (scope, elem, attr) {
            elem.on(attr.eventFocus, function () {
                focus(attr.eventFocusId);
            });

            // Removes bound events in the element itself
            // when the scope is destroyed
            scope.$on('$destroy', function () {
                elem.off(attr.eventFocus);
            });
        };
    });
    app.directive('parseUrl', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            replace: true,
            scope: {
                props: '=parseUwrl',
                ngModel: '=ngModel'
            },
            link: function compile(scope, element, attrs, controller) {
                scope.$watch('ngModel', function (value) {
                    if (typeof value !== "undefined" && value !== null && value.length > 0)
                        element.html($autolinker.link(value.replace(/(?:\r\n|\r|\n)/g, '<br/>')));
                });
            }
        };
    });
    app.controller('heroController', ['$scope', '$http', '$KawalService', '$window', 'focus', 'hotkeys', function ($scope, $http, $KawalService, $window, focus, hotkeys) {
            this.heros = [];
            this.limit = 100;
            var context = this;
            this.getData = function (input) {
                var hashs = window.location.hash.substr(2).split("/")
                if (hashs[0] !== "heroes.html") {
                    return;
                }
                if (typeof input === "undefined") {
                    input = "added";
                }

                $KawalService.itemyangsedangdiproses.setHeros(true);
                $http.get('/user/getall/' + context.heros.length + '/' + (context.limit)).
                        success(function (data, status, headers, config) {
                            try {
                                if (input === "init") {
                                    context.heros = [];
                                }
                            } catch (e) {
                            }
                            context.heros = context.heros.concat(data.user);
                            $KawalService.itemyangsedangdiproses.setHeros(false);
                        }).
                        error(function (data, status, headers, config) {
                            $KawalService.itemyangsedangdiproses.setHeros(false);
                        });
            };
            $KawalService.sendToGa();
            $scope.$watch(function () {
                return window.location.hash;
            }, function (value) {
                context.getData("init");
            });
        }]);
    app.controller('spasialController', ['$scope', '$http', '$KawalService', '$window', 'focus', 'hotkeys', '$filter', function ($scope, $http, $KawalService, $window, focus, hotkeys, $filter) {
            this.hashs = window.location.hash.substr(2).split("/");
            var context = this;
            this.predicate = 'nama';
            this.reverse = false;
            this.init = function () {
                var hashs = window.location.hash.substr(2).split("/")
                if (hashs[0] !== "spasial.html") {
                    return;
                }
                $KawalService.itemyangsedangdiproses.setTabulasi(true);
                if (typeof $scope.$parent.$parent.tingkat === "undefined" || $scope.$parent.$parent.tingkat.length === 0 || $scope.$parent.$parent.tingkat === "undefined") {
                    $scope.$parent.$parent.tingkat = "Provinsi";
                }
                if (typeof $scope.tahun === "undefined" || $scope.$parent.$parent.tahun.length === 0 || $scope.$parent.$parent.tahun === "undefined") {
                    $scope.$parent.$parent.tahun = "2015";
                }
                if (hashs.length < 3) {
                    context.report = "";
                    context.reportattribute = "";
                    context.reporttype = "";
                    context.partai = {}
                    context.koalisi = {}
                    $scope.$parent.$parent.selectedTemplate.hash = '#/spasial.html/' + $scope.$parent.$parent.tingkat + '/' + $scope.$parent.$parent.tahun;
                    $KawalService.handleHash($scope.$parent.$parent.selectedTemplate.hash.substr(1), $scope.$parent.$parent);
                } else {
                    $scope.$parent.$parent.tingkat = hashs[1];
                    $scope.$parent.$parent.tahun = hashs[2];
                    if (hashs.length < 4) {
                        context.report = "";
                        context.reportattribute = "";
                        context.reporttype = "";
                        context.partai = {};
                        context.koalisi = {};
                    }
                    if (hashs.length < 5) {
                        context.koalisi = {}
                    }
                    if (hashs.length > 3) {
                        angular.forEach(context.reports, function (item, attributekey) {
                            var val = $KawalService.replaceSpecial(item.text, "-");
                            if (hashs[3] === val) {
                                context.report = item.text;
                                context.reportattribute = item.attribute;
                                context.reporttype = item.type;
                            }
                        });
                    }
                    context.setmap();
                    context.KandidatWilayahs = [];
                    var callback = function () {
                        context.countKandidat();
                    };
                    $http.get('/kandidat/get/' + hashs[2] + '/' + hashs[1]).
                            success(function (data, status, headers, config) {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        context.KandidatWilayahs = data;
                                        callback();
                                    }
                                }
                                $KawalService.itemyangsedangdiproses.setTabulasi(false);
                            }).
                            error(function (data, status, headers, config) {

                            });
                }
            }
            context.KandidatWilayahs = [];
            context.palingkecil = {};
            context.palingbesar = {};
            context.report = "";
            context.reportattribute = "";
            context.reporttype = "";
            context.setReport = function (valx) {
                $KawalService.itemyangsedangdiproses.setTabulasi(true);
                context.partai = {};
                context.koalisi = {};
                context.report = valx.text;
                context.reportattribute = valx.attribute;
                context.reporttype = valx.type;
                var val = $KawalService.replaceSpecial(valx.text, "-");
                $scope.$parent.$parent.selectedTemplate.hash = '#/spasial.html/' + $scope.$parent.$parent.tingkat + '/' + $scope.$parent.$parent.tahun + '/' + val;
                $KawalService.handleHash($scope.$parent.$parent.selectedTemplate.hash.substr(1), $scope.$parent.$parent);
            };
            context.partai = {}
            context.koalisi = {}
            context.setPartai = function (valx) {
                $KawalService.itemyangsedangdiproses.setTabulasi(true);
                context.koalisi = {};
                context.partai = valx;
                var val = $KawalService.replaceSpecial(context.report, "-");
                $scope.$parent.$parent.selectedTemplate.hash = '#/spasial.html/' + $scope.$parent.$parent.tingkat + '/' + $scope.$parent.$parent.tahun + '/' + val + "/" + context.partai.text;
                $KawalService.handleHash($scope.$parent.$parent.selectedTemplate.hash.substr(1), $scope.$parent.$parent);
            };
            context.setKoalisi = function (valx) {
                context.koalisi = valx;
                var val = $KawalService.replaceSpecial(context.report, "-");
                $scope.$parent.$parent.selectedTemplate.hash = '#/spasial.html/' + $scope.$parent.$parent.tingkat + '/' + $scope.$parent.$parent.tahun + '/' + val + "/" + context.partai.text + "/" + context.koalisi.text;
                $KawalService.handleHash($scope.$parent.$parent.selectedTemplate.hash.substr(1), $scope.$parent.$parent);
            };
            context.attributes = ['suaraTPS', 'suaraVerifikasiC1', 'suaraKPU'];
            context.reports = [
                {text: "Jumlah Pemilih", attribute: "totalpemilih", type: 1},
                {text: "Jumlah yang Tidak Menggunakan Hak Pilih", attribute: "tidakmemilih", type: 1},
                {text: "Persentase yang Tidak Menggunakan Hak Pilih", attribute: "percenttidakmemilih", type: 1},
                {text: "Selisih Perolehan Suara", attribute: "selisih", type: 0},
                {text: "Selisih Persentase Perolehan Suara", attribute: "percentselisih", type: 0},
                {text: "Jumlah TPS", attribute: "jumlahTPS", type: 1},
                {text: "Jumlah TPS Yang ada Scan C1", attribute: "jumlahTPSdilock", type: 0},
                {text: "Persentase TPS Yang ada Scan C1", attribute: "percent", type: 0},
                {text: "Koalisi Pemenang Pilkada", attribute: "", type: -1},
                {text: "Kepemimpinan Perempuan", attribute: "", type: -1}
            ];
            context.partais = [];
            context.getindex = function (kandidatWilayah) {
                if ((context.palingbesar[context.reportattribute] - context.palingkecil[context.reportattribute]) <= 0) {
                    return 0;
                }
                var retval = 0;
                if (context.reporttype === 1) {
                    retval = context.roundToTwo((kandidatWilayah[context.reportattribute] - context.palingkecil[context.reportattribute]) / (context.palingbesar[context.reportattribute] - context.palingkecil[context.reportattribute]), context.numberDecimal);
                } else {
                    retval = context.roundToTwo((context.palingbesar[context.reportattribute] - kandidatWilayah[context.reportattribute]) / (context.palingbesar[context.reportattribute] - context.palingkecil[context.reportattribute]), context.numberDecimal);
                }
                if (retval > 1) {
                    return 1;
                } else {
                    return retval;
                }
            }
            context.formatnumber = function (number) {
                if (typeof number === "undefined") {
                    return '0';
                }
                if (isNaN(number)) {
                    return '0';
                }
                if (number === 0)
                    return '0';
                var numbers = ('' + number).split(".");
                var nres = '' + numbers[0];
                var res = '';
                for (var i = 0; i < nres.length; i++) {
                    if (i > 0 && i % 3 === 0) {
                        res = '.' + res;
                    }
                    res = nres[nres.length - i - 1] + res;
                }
                if (numbers.length > 1) {
                    res = res + "." + numbers[1]
                }
                ;
                return res;
            }
            context.jumlahgender = {"pemenang": {"l": 0, "p": 0, "w": 0}, "total": {"l": 0, "p": 0, "w": 0}};
            context.countKandidat = function () {
                context.palingkecil = {};
                context.palingbesar = {};
                context.jumlahgender = {"pemenang": {"l": 0, "p": 0, "w": 0}, "total": {"l": 0, "p": 0, "w": 0}};
                context.partais = [
                    {text: "PERORANGAN", color: {r: 102, g: 102, b: 102}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "PDIP", color: {r: 219, g: 15, b: 15}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "NASDEM", color: {r: 39, g: 39, b: 144}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "HANURA", color: {r: 191, g: 191, b: 43}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "PKB", color: {r: 61, g: 133, b: 74}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "PKPI", color: {r: 255, g: 0, b: 0}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "GOLKAR", color: {r: 232, g: 232, b: 27}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "GERINDRA", color: {r: 247, g: 124, b: 2}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "DEMOKRAT", color: {r: 8, g: 67, b: 213}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "PKS", color: {r: 0, g: 0, b: 40}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "PAN", color: {r: 26, g: 6, b: 100}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "PBB", color: {r: 0, g: 189, b: 35}, menang: 0, total: 0, persen: 0, koalisi: []},
                    {text: "PPP", color: {r: 0, g: 112, b: 21}, menang: 0, total: 0, persen: 0, koalisi: []}
                ];
                angular.forEach(context.KandidatWilayahs, function (kandidatWilayah, key) {
                    kandidatWilayah.tidakmemilih = kandidatWilayah.totalpemilih - (kandidatWilayah.suarasah + kandidatWilayah.suaratidaksah);
                    kandidatWilayah.percenttidakmemilih = context.roundToTwo(context.setpercent(kandidatWilayah.tidakmemilih, kandidatWilayah.totalpemilih), context.numberDecimal)
                    kandidatWilayah.percent = context.roundToTwo(context.setpercent(kandidatWilayah.jumlahTPSdilock, kandidatWilayah.jumlahTPS), context.numberDecimal)
                    kandidatWilayah.total = {suaraTPS: 0, suaraVerifikasiC1: 0, suaraKPU: 0};
                    kandidatWilayah.selisih = kandidatWilayah.kandidatPemenang.suaraVerifikasiC1;
                    angular.forEach(kandidatWilayah.kandidat, function (value, key) {
                        angular.forEach(context.attributes, function (attribute, attributekey) {
                            try {
                                kandidatWilayah.total[attribute] += value[attribute];
                            } catch (e) {
                            }
                        });
                        value.selisih = kandidatWilayah.kandidatPemenang.suaraVerifikasiC1 - value.suaraVerifikasiC1;
                        if (value.selisih > 0 && value.selisih < kandidatWilayah.selisih) {
                            kandidatWilayah.selisih = value.selisih;
                        }
                    });
                    angular.forEach(context.attributes, function (attribute, attributekey) {
                        try {
                            kandidatWilayah.kandidatPemenang['p' + attribute] = context.roundToTwo(context.setpercent(kandidatWilayah.kandidatPemenang[attribute], kandidatWilayah.total[attribute]), context.numberDecimal);
                        } catch (e) {
                        }
                    });
                    kandidatWilayah.percentselisih = kandidatWilayah.kandidatPemenang['psuaraVerifikasiC1'];
                    angular.forEach(kandidatWilayah.kandidat, function (value, key) {
                        angular.forEach(context.attributes, function (attribute, attributekey) {
                            try {
                                value['p' + attribute] = context.roundToTwo(context.setpercent(value[attribute], kandidatWilayah.total[attribute]), context.numberDecimal);
                            } catch (e) {
                            }
                        });
                        value.percentselisih = kandidatWilayah.kandidatPemenang['psuaraVerifikasiC1'] - value['psuaraVerifikasiC1'];
                        if (value.percentselisih > 0 && value.percentselisih < kandidatWilayah.percentselisih) {
                            kandidatWilayah.percentselisih = value.percentselisih;
                        }
                    });
                    if (kandidatWilayah.percent >= 80) {
                        context.jumlahgender.total.w += 1;
                        if (kandidatWilayah.kandidatPemenang.jeniskelamin1 === "P" || kandidatWilayah.kandidatPemenang.jeniskelamin2 === "P") {
                            context.jumlahgender.pemenang.w += 1;
                        }
                        if (kandidatWilayah.kandidatPemenang.jeniskelamin1 === "L") {
                            context.jumlahgender.pemenang.l += 1;
                        } else {
                            context.jumlahgender.pemenang.p += 1;
                        }
                        if (kandidatWilayah.kandidatPemenang.jeniskelamin2 === "L") {
                            context.jumlahgender.pemenang.l += 1;
                        } else {
                            context.jumlahgender.pemenang.p += 1;
                        }

                        angular.forEach(context.partais, function (partai, key) {
                            var foundpartai = false;
                            angular.forEach(kandidatWilayah.kandidat, function (value, key1) {
                                if (value.partaiPendukung.indexOf(partai.text) >= 0
                                        || value.jenisDukungan.indexOf(partai.text) >= 0) {
                                    foundpartai = true;
                                }
                            });
                            if (foundpartai) {
                                partai.total += 1;
                            }
                            if (kandidatWilayah.kandidatPemenang.partaiPendukung.indexOf(partai.text) >= 0
                                    || kandidatWilayah.kandidatPemenang.jenisDukungan.indexOf(partai.text) >= 0) {
                                partai.menang += 1;
                                if (kandidatWilayah.kandidatPemenang.jenisDukungan !== "PERORANGAN") {
                                    var partai_ = kandidatWilayah.kandidatPemenang.partaiPendukung.split(",");
                                    angular.forEach(partai_, function (partai__, key1) {
                                        partai__ = $KawalService.replaceSpecial(partai__, '');
                                        if (partai__ !== partai.text) {
                                            if (partai.koalisi.length === 0) {
                                                var color = {};
                                                angular.forEach(context.partais, function (partaix, keyx) {
                                                    if (partaix.text === partai__) {
                                                        color = partaix.color;
                                                    }
                                                })
                                                partai.koalisi.push({text: partai__, jumlah: 1, color: color})
                                            } else {
                                                var xfound = false;
                                                for (var i = 0; i < partai.koalisi.length; i++) {
                                                    if (partai__ === partai.koalisi[i].text) {
                                                        partai.koalisi[i].jumlah += 1;
                                                        xfound = true;
                                                    }
                                                }
                                                if (!xfound) {
                                                    var color = {};
                                                    angular.forEach(context.partais, function (partaix, keyx) {
                                                        if (partaix.text === partai__) {
                                                            color = partaix.color;
                                                        }
                                                    })
                                                    partai.koalisi.push({text: partai__, jumlah: 1, color: color})
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        });
                        if (key === 0) {
                            angular.forEach(context.reports, function (item, attributekey) {
                                var attribute = item.attribute;
                                if (attribute.length > 0) {
                                    context.palingkecil[attribute] = kandidatWilayah[attribute];
                                    context.palingbesar[attribute] = kandidatWilayah[attribute];
                                }
                            });
                        } else {
                            angular.forEach(context.reports, function (item, attributekey) {
                                var attribute = item.attribute;
                                if (attribute.length > 0) {
                                    if (kandidatWilayah[attribute] < context.palingkecil[attribute]) {
                                        context.palingkecil[attribute] = kandidatWilayah[attribute];
                                    }
                                    if (kandidatWilayah[attribute] > context.palingbesar[attribute]) {
                                        context.palingbesar[attribute] = kandidatWilayah[attribute];
                                    }
                                }
                            });
                        }
                    }
                });

                if (context.report.length > 0) {
                    if (context.report !== "Koalisi Pemenang Pilkada") {
                        context.runMap();
                    } else {
                        try {
                            var hashs = window.location.hash.substr(2).split("/");
                            if (hashs.length > 4) {
                                angular.forEach(context.partais, function (item, attributekey) {
                                    var val = $KawalService.replaceSpecial(item.text, "-");
                                    if (hashs[4] === val) {
                                        context.partai = item;
                                    }
                                });
                                if (hashs.length > 5) {
                                    angular.forEach(context.partai.koalisi, function (item, attributekey) {
                                        if (hashs[5] === item.text) {
                                            context.koalisi = item;
                                        }
                                    });
                                }
                            }

                        } catch (e) {
                        }
                        try {
                            if (context.partai.text.length > 0) {
                                context.runMap();
                            }
                        } catch (e) {
                        }
                    }
                }
            };
            context.numberDecimal = 2;
            context.roundToTwo = function (num, a) {
                return $KawalService.roundToTwo(num, a);
            };
            context.setpercent = function (a, b) {
                return $KawalService.setpercent(a, b);
            };
            context.layer = "";
            context.mapfilter = "";
            context.runMap = function () {
                context.hashs = window.location.hash.substr(2).split("/");
                angular.forEach(context.KandidatWilayahs, function (kandidatWilayah, key) {
                    if (kandidatWilayah.percent >= 80) {
                        var blmada = true;
                        var vector = null;
                        var opacity = 1;
                        var colors = {r: 240, g: 35, b: 22};
                        if (context.reportattribute.length > 0) {
                            opacity = context.getindex(kandidatWilayah);
                            opacity = opacity * 0.90;
                        } else {
                            if (context.report !== "Koalisi Pemenang Pilkada") {
                                if (kandidatWilayah.kandidatPemenang.jeniskelamin1 === 'P' || kandidatWilayah.kandidatPemenang.jeniskelamin2 === 'P') {
                                    colors.r = 255;
                                    colors.g = 0;
                                    colors.b = 255;
                                    opacity = 1;
                                } else {
                                    opacity = 0.001;
                                }
                            } else {
                                opacity = 0.1;
                                if (kandidatWilayah.kandidatPemenang.partaiPendukung.indexOf(context.partai.text) >= 0
                                        || kandidatWilayah.kandidatPemenang.jenisDukungan.indexOf(context.partai.text) >= 0) {
                                    opacity = 1;
                                    colors.r = context.partai.color.r;
                                    colors.g = context.partai.color.g;
                                    colors.b = context.partai.color.b;

                                    try {
                                        if (context.koalisi.text.length > 0) {
                                            if (kandidatWilayah.kandidatPemenang.partaiPendukung.indexOf(context.koalisi.text) >= 0
                                                    && kandidatWilayah.kandidatPemenang.jenisDukungan !== "PERORANGAN") {
                                                colors.r = context.koalisi.color.r;
                                                colors.g = context.koalisi.color.g;
                                                colors.b = context.koalisi.color.b;
                                            }
                                        }
                                    } catch (e) {
                                    }

                                } else {
                                    opacity = 0.001;
                                }
                            }
                        }
                        kandidatWilayah.opacity = opacity;
                        $.each(context.map.getLayers().getArray(), function (key11, layer) {
                            try {
                                if (layer.get("kpuid") === kandidatWilayah.kpuid) {
                                    vector = layer;
                                    blmada = false;
                                }
                            } catch (e) {
                            }
                        });
                        if (blmada) {
                            vector = new ol.layer.Vector({
                                kpuid: kandidatWilayah.kpuid,
                                source: new ol.source.Vector(),
                                style: function (feature, resolution) {
                                    var classify = new ol.style.Style({
                                        fill: new ol.style.Fill({
                                            color: [colors.r, colors.g, colors.b, opacity]
                                        }),
                                        stroke: new ol.style.Stroke({
                                            color: "#0843D5",
                                            width: 0.5
                                        })
                                    });
                                    return classify;
                                }
                            });
                            context.map.addLayer(vector);
                        }
                        if (context.hashs[1] === "Kabupaten-Kota") {
                            context.layer = "2";
                            context.mapfilter = "ID2013='" + kandidatWilayah.kode + "'";
                        } else {
                            context.layer = "3";
                            context.mapfilter = "No_prov=" + kandidatWilayah.kode;
                        }
                        context.mapfilter = encodeURIComponent(context.mapfilter);
                        function loadSource(vector, url, kandidatWilayah) {
                            $http.get(url).
                                    success(function (response, status, headers, config) {
                                        try {
                                            var features = context.esrijsonFormat.readFeatures(response, {
                                                featureProjection: context.map.getView().getProjection()
                                            });
                                            if (features.length > 0) {
                                                features[0]["kandidatWilayah"] = kandidatWilayah;
                                                vector.getSource().addFeatures(features);
                                            }
                                        } catch (e) {
                                        }
                                    }).
                                    error(function (data, status, headers, config) {

                                    });
                        }
                        vector.getSource().clear();
                        loadSource(vector, "/overhttps/" + $scope.$parent.$parent.tingkat + '/' + $scope.$parent.$parent.tahun + '/' + context.layer + "/" + context.mapfilter, kandidatWilayah);
                    }
                });
            }
            var osm = new ol.layer.Tile({
                name: 'Peta Dasar OSM',
                layer_type: 'OSM',
                source: new ol.source.OSM()
            });
            this.map = null;
            this.kandidatWilayahx = {};
            context.getChildLink = function (kandidatWilayah) {
                var hashs = window.location.hash.substr(2).split("/");
                return "/#/tabulasi.html/" + hashs[1] + "/" + hashs[2] + "/" + $KawalService.replaceSpecial(kandidatWilayah.nama, '-');
            };
            var displayFeatureInfo = function (evt) {
                //var pixel = context.map.getEventPixel(evt.originalEvent);
                var pixel = evt.pixel;
                var features = [];
                if (evt.type === "click") {
                    context.content.innerHTML = "";
                }
                context.formatNama = function (nama, index) {
                    try {
                        var namas = nama.split("-");
                        return namas[index];
                    } catch (e) {
                    }
                    return nama;
                }
                context.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                    features.push(feature);
                    if (evt.type === "click") {
                        if (context.report === "Koalisi Pemenang Pilkada") {
                            context.partai.persen = context.roundToTwo(context.setpercent(context.partai.menang, context.partai.total), context.numberDecimal)

                            context.content.innerHTML = '<div><i class="fa fa-map-marker"></i> <b>' + feature.kandidatWilayah.nama + '</b>, <b>' + feature.kandidatWilayah.parentNama + '</b></div>'
                                    + '<div><i class="fa fa-user"></i> <b>' + context.formatNama(feature.kandidatWilayah.kandidatPemenang.nama, 0) + '</b></div>'
                                    + '<div><i class="fa fa-user"></i> <b>' + context.formatNama(feature.kandidatWilayah.kandidatPemenang.nama, 1) + '</b></div>'
                                    + '<div>No Urut: <b>' + feature.kandidatWilayah.kandidatPemenang.urut + '</b></div>'
                                    + '<div>Jenis Dukungan: <b>' + feature.kandidatWilayah.kandidatPemenang.jenisDukungan + '</b></div>'
                                    + '<div><b>' + feature.kandidatWilayah.kandidatPemenang.partaiPendukung + '</b></div>';

                            if (feature.kandidatWilayah.kandidatPemenang.partaiPendukung.indexOf(context.partai.text) >= 0
                                    || feature.kandidatWilayah.kandidatPemenang.jenisDukungan.indexOf(context.partai.text) >= 0) {
                                context.content.innerHTML = context.content.innerHTML
                                        + '<div style="padding-top:10px;padding-bottom:10px;"><b>' + context.partai.text + '</b> menang di <b>' + context.partai.menang + '</b> wilayah, ikut di <b>' + context.partai.total + '</b> wilayah</div>'
                                        + '<center><div class="chart" id="g' + context.partai.text + '" data-percent="' + context.partai.persen + '"><div style="vertical-align:middle;display: inline-block;position: absolute;margin-top: 20px;margin-left: 7px;">' + context.partai.persen + '%<div></div></center>';
                                setTimeout(function () {
                                    $("#g" + context.partai.text).easyPieChart({size: 60, animate: true, barColor: "rgb(" + context.partai.color.r + "," + context.partai.color.g + "," + context.partai.color.b + ")", scaleColor: false, lineWidth: 3});
                                }, 500);
                                if (feature.kandidatWilayah.kandidatPemenang.jenisDukungan !== "PERORANGAN") {
                                    if (feature.kandidatWilayah.kandidatPemenang.partaiPendukung.indexOf(context.koalisi.text) >= 0) {
                                        context.koalisi.persen = context.roundToTwo(context.setpercent(context.koalisi.jumlah, context.partai.menang), context.numberDecimal)
                                        context.content.innerHTML = context.content.innerHTML
                                                + '<div style="padding-top:10px;">berkoalisi dengan <b>' + context.koalisi.text + '</b> di <b>' + context.koalisi.jumlah + '</b> wilayah (' + context.koalisi.persen + '%)</div>';
                                    }
                                }
                            }
                            context.content.innerHTML = context.content.innerHTML + '<div style="padding-top:10px;"><a href="' + context.getChildLink(feature.kandidatWilayah) + '" target="km">Tabulasi</a></div>';
                        } else if (context.report === "Kepemimpinan Perempuan") {
                            var warna1 = "", warna2 = "";

                            if (feature.kandidatWilayah.kandidatPemenang.jeniskelamin1 === "P") {
                                warna1 = "style='color:#FF00FF;'"
                            }
                            if (feature.kandidatWilayah.kandidatPemenang.jeniskelamin2 === "P") {
                                warna2 = "style='color:#FF00FF;'"
                            }

                            context.content.innerHTML = '<div><i class="fa fa-map-marker"></i> <b>' + feature.kandidatWilayah.nama + '</b>, <b>' + feature.kandidatWilayah.parentNama + '</b></div>'
                                    + '<div ' + warna1 + '><i class="fa fa-user"></i> <b>' + context.formatNama(feature.kandidatWilayah.kandidatPemenang.nama, 0) + '</b></div>'
                                    + '<div ' + warna2 + '><i class="fa fa-user"></i> <b>' + context.formatNama(feature.kandidatWilayah.kandidatPemenang.nama, 1) + '</b></div>'
                                    + '<div>No Urut: <b>' + feature.kandidatWilayah.kandidatPemenang.urut + '</b></div>';

                            if (feature.kandidatWilayah.kandidatPemenang.jeniskelamin1 === "P" || feature.kandidatWilayah.kandidatPemenang.jeniskelamin2 === "P") {
                                var persen = context.roundToTwo(context.setpercent(context.jumlahgender.pemenang.p, (context.jumlahgender.pemenang.p + context.jumlahgender.pemenang.l)), context.numberDecimal)

                                context.content.innerHTML = context.content.innerHTML
                                        + '<div style="padding-top:10px;padding-bottom:10px;">Ada <b>' + context.jumlahgender.pemenang.p + '</b> perempuan dan <b>' + context.jumlahgender.pemenang.l + '</b> laki-laki pemenang pilkada</div>'
                                        + '<center><div class="chart" id="g' + feature.kandidatWilayah.kandidatPemenang.urut + '" data-percent="' + persen + '"><div style="vertical-align:middle;display: inline-block;position: absolute;margin-top: 20px;margin-left: 7px;">' + persen + '%<div></div></center>';
                                setTimeout(function () {
                                    $("#g" + feature.kandidatWilayah.kandidatPemenang.urut).easyPieChart({size: 60, animate: true, barColor: "rgb(255,0,255)", scaleColor: false, lineWidth: 3});
                                }, 500);


                                var persen2 = context.roundToTwo(context.setpercent(context.jumlahgender.pemenang.w, (context.jumlahgender.total.w)), context.numberDecimal)

                                context.content.innerHTML = context.content.innerHTML
                                        + '<div style="padding-top:10px;padding-bottom:10px;">Tersebar di <b>' + context.jumlahgender.pemenang.w + '</b> wilayah dari total <b>' + context.jumlahgender.total.w + '</b> wilayah</div>'
                                        + '<center><div class="chart" id="gd' + feature.kandidatWilayah.kandidatPemenang.urut + '" data-percent="' + persen2 + '"><div style="vertical-align:middle;display: inline-block;position: absolute;margin-top: 20px;margin-left: 7px;">' + persen2 + '%<div></div></center>';
                                setTimeout(function () {
                                    $("#gd" + feature.kandidatWilayah.kandidatPemenang.urut).easyPieChart({size: 60, animate: true, barColor: "rgb(255,0,255)", scaleColor: false, lineWidth: 3});
                                }, 500);
                            }
                            context.content.innerHTML = context.content.innerHTML + '<div style="padding-top:10px;"><a href="' + context.getChildLink(feature.kandidatWilayah) + '" target="km">Tabulasi</a></div>';

                        } else {
                            context.content.innerHTML = '<div><i class="fa fa-map-marker"></i> <b>' + feature.kandidatWilayah.nama + '</b>, <b>' + feature.kandidatWilayah.parentNama + '</b></div>'
                                    + '<div>' + context.report + ': <b>' + context.formatnumber(feature.kandidatWilayah[context.reportattribute]) + '</b></div>'
                                    + '<div><a href="' + context.getChildLink(feature.kandidatWilayah) + '" target="km">Tabulasi</a></div>';
                        }

                    }
                });
                if (features.length > 0) {
                    context.map.getTarget().style.cursor = 'pointer';
                    if (evt.type === "click") {
                        var coordinate = evt.coordinate;
                        context.overlay.setPosition(coordinate);
                    }
                } else {
                    context.map.getTarget().style.cursor = '';
                    return false;
                }
            };

            this.container = document.getElementById('popup');
            this.content = document.getElementById('popup-content');
            this.closer = document.getElementById('popup-closer');
            this.closer.onclick = function () {
                context.overlay.setPosition(undefined);
                context.closer.blur();
                return false;
            }
            this.overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
                element: context.container,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            }));
            this.layer = '3';
            this.mapfilter = '';
            this.esrijsonFormat = new ol.format.EsriJSON();
            this.setmap = function () {
                if (context.map !== null) {
                    context.map.setTarget(null);
                    context.map = null;
                }
                $("#mapdiv").html("");
                context.map = new ol.Map({
                    interactions: ol.interaction.defaults({mouseWheelZoom: false}),
                    layers: [osm],
                    target: document.getElementById('mapdiv'),
                    overlays: [context.overlay],
                    view: new ol.View({
                        center: ol.proj.transform([118, -2], 'EPSG:4326', 'EPSG:900913'),
                        zoom: 5.2
                    })
                });
                context.map.on('pointermove', function (evt) {
                    if (evt.dragging) {
                        return;
                    }
                    displayFeatureInfo(evt);
                });
                context.map.on('click', function (evt) {
                    displayFeatureInfo(evt);

                });

            };


            $KawalService.sendToGa();
            $scope.$watch(function () {
                return window.location.hash;
            }, function (value) {
                context.init();
            });
        }]);
    app.controller('tabulasiController', ['$scope', '$http', '$KawalService', '$window', 'focus', 'hotkeys', '$filter', function ($scope, $http, $KawalService, $window, focus, hotkeys, $filter) {
            this.numberDecimal = 2;
            this.KandidatWilayah0 = "";
            var context = this;
            this.predicate = 'nama';
            this.reverse = false;
            this.sumall = function (dataSuara) {
                dataSuara.suarasah = 0;
                angular.forEach(dataSuara.uruts, function (value, key) {
                    dataSuara.suarasah += parseInt(dataSuara.suaraKandidat[value + ''].suaraVerifikasiC1);
                });
            };
            var osm = new ol.layer.Tile({
                name: 'Peta Dasar OSM',
                layer_type: 'OSM',
                source: new ol.source.OSM()
            });
            this.map = null;
            this.kandidatWilayahx = {};
            var displayFeatureInfo = function (evt) {
                //var pixel = context.map.getEventPixel(evt.originalEvent);
                var pixel = evt.pixel;
                var features = [];
                if (evt.type === "click") {
                    context.content.innerHTML = "";
                }
                context.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                    features.push(feature);
                    if (evt.type === "click") {
                        context.content.innerHTML = '<div>Nama: <b>' + feature.kandidatWilayah.nama + '</b></div>'
                                + '<div><b>' + feature.kandidatWilayah.parentNama + '</b></div>'
                                + '<div>Selisih Suara: <b>' + context.formatnumber(feature.kandidatWilayah.selisih) + '</b></div>'
                                + '<div>Index Selisih Suara: <b>' + context.getindex(feature.kandidatWilayah) + '</b></div>';
                    }
                });
                if (features.length > 0) {
                    context.map.getTarget().style.cursor = 'pointer';
                    if (evt.type === "click") {
                        var coordinate = evt.coordinate;
                        context.overlay.setPosition(coordinate);
                    }
                } else {
                    context.map.getTarget().style.cursor = '';
                    return false;
                }
            };

            this.container = document.getElementById('popup');
            this.content = document.getElementById('popup-content');
            this.closer = document.getElementById('popup-closer');
            this.closer.onclick = function () {
                context.overlay.setPosition(undefined);
                context.closer.blur();
                return false;
            }
            this.overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
                element: context.container,
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                }
            }));
            this.layer = '3';
            this.mapfilter = '';
            this.esrijsonFormat = new ol.format.EsriJSON();
            this.setmap = function () {
                if (context.map !== null) {
                    context.map.setTarget(null);
                    context.map = null;
                }
                $("#mapdiv").html("");
                context.map = new ol.Map({
                    interactions: ol.interaction.defaults({mouseWheelZoom: false}),
                    layers: [osm],
                    target: document.getElementById('mapdiv'),
                    overlays: [context.overlay],
                    view: new ol.View({
                        center: ol.proj.transform([118, -2], 'EPSG:4326', 'EPSG:900913'),
                        zoom: 4.4
                    })
                });
                context.map.on('pointermove', function (evt) {
                    if (evt.dragging) {
                        return;
                    }
                    displayFeatureInfo(evt);
                });
                context.map.on('click', function (evt) {
                    displayFeatureInfo(evt);

                });

            };


            this.showandhideimg = function ($index, klimitTo, kandidatWilayah) {
                if ($index <= klimitTo) {
                    setTimeout(function () {
                        angular.forEach(kandidatWilayah.kandidat, function (value, key) {
                            var url = $("#img_kandidat_" + value.kpu_id_peserta).attr("data-src");
                            $("#img_kandidat_" + value.kpu_id_peserta).attr("src", url);
                        });
                    }, 2000);
                    return true;
                } else {
                    return false;
                }
            }
            this.setSortType = function (sort) {
                $scope.$parent.$parent.sorttype = sort;
                context.predicate = sort.attribute;
            };
            this.sortKandidatWilayah = function (kandidatWilayah) {
                return kandidatWilayah.percent;
            }
            this.geturl = function (kandidatWilayah) {
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[1] === "Kabupaten-Kota") {
                    return window.location.href + "/" + kandidatWilayah.parentkpuid + "/" + kandidatWilayah.kpuid;
                } else {
                    return window.location.href + "/" + kandidatWilayah.kpuid;
                }
            };
            this.sites = {
                pinterest: {
                    url: 'http://pinterest.com/pin/create/button/?url={{url}}&media={{media}}&description={{description}}',
                    popup: {
                        width: 685,
                        height: 500
                    }
                },
                facebook: {
                    url: 'https://www.facebook.com/sharer/sharer.php?s=100&p[title]={{title}}&p[summary]={{description}}&p[url]={{url}}&p[images][0]={{media}}',
                    popup: {
                        width: 626,
                        height: 436
                    }
                },
                twitter: {
                    url: 'https://twitter.com/share?url={{url}}&via={{via}}&text={{description}}',
                    popup: {
                        width: 685,
                        height: 500
                    }
                },
                googleplus: {
                    url: 'https://plus.google.com/share?url={{url}}',
                    popup: {
                        width: 600,
                        height: 600
                    }
                },
                linkedin: {
                    url: 'https://www.linkedin.com/shareArticle?mini=true&url={{url}}&title={{title}}&summary={{description}}+&source={{via}}',
                    popup: {
                        width: 600,
                        height: 600
                    }
                }
            };
            this.linkFix = function (site, link) {
                var url = site.url.replace(/{{url}}/g, encodeURIComponent(link.url))
                        .replace(/{{title}}/g, encodeURIComponent(link.title))
                        .replace(/{{description}}/g, encodeURIComponent(link.description))
                        .replace(/{{media}}/g, encodeURIComponent(link.media))
                        .replace(/{{via}}/g, encodeURIComponent(link.via));
                return url;
            };
            this.popupWindow = function (site, url) {
                // center window
                var left = (window.innerWidth / 2) - (site.popup.width / 2);
                var top = (window.innerHeight / 2) - (site.popup.height / 2);

                // open a window
                return window.open(url, '', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + site.popup.width + ', height=' + site.popup.height + ', top=' + top + ', left=' + left);
            }
            this.share = function ($event) {
                var target = $($event.target);
                var type = target.attr("data-type");
                var site = context.sites[type] || null;
                var link = {
                    url: window.location.href || '',
                    title: target.attr("data-title") || '',
                    description: "Cek hasil #Pilkada2015 " + context.controlWilayahs[context.controlWilayahs.length - 1].nama + " di #kawalpilkada " || '',
                    media: target.attr("data-media") || '',
                    via: target.attr("data-via") || ''
                };
                var url = context.linkFix(site, link);
                context.popupWindow(site, url);
            };
            this.setshare2 = function (no) {
                setTimeout(function () {
                    if (context.DataSuaras.length > 0) {
                        var id = context.controlWilayahs[context.controlWilayahs.length - 1].kpuid;
                        $('#pst' + id + no)
                                .attr("data-url", window.location.href)
                                .attr("data-description", "Cek hasil #Pilkada2015 " + context.controlWilayahs[context.controlWilayahs.length - 1].nama + " di #kawalpilkada ")
                                .prettySocial();
                        $('#psf' + id + no)
                                .attr("data-url", window.location.href)
                                .attr("data-description", "Cek hasil #Pilkada2015 " + context.controlWilayahs[context.controlWilayahs.length - 1].nama + " di #kawalpilkada ")
                                .prettySocial();
                        $('#psg' + id + no)
                                .attr("data-url", window.location.href)
                                .attr("data-description", "Cek hasil #Pilkada2015 " + context.controlWilayahs[context.controlWilayahs.length - 1].nama + " di #kawalpilkada ")
                                .prettySocial();
                    }
                }, 4000);
            };
            this.setAllImage = function (image) {
                if (context.DataSuarasTPS.length > 0) {
                    angular.forEach(context.DataSuarasTPS, function (tps, key) {
                        tps["currentkpugambar"] = tps[image];
                    });
                    try {
                        focus("tidaksahC1_0");
                    } catch (e) {
                    }
                }
            }
            hotkeys.add({
                combo: 'ctrl+1',
                description: 'Gambar 1',
                callback: function (event, hotkey) {
                    context.setAllImage('kpugambar1');
                    event.preventDefault();
                }
            });
            hotkeys.add({
                combo: 'ctrl+2',
                description: 'Gambar 2',
                callback: function (event, hotkey) {
                    context.setAllImage("kpugambar2");
                    event.preventDefault();
                }
            });
            hotkeys.add({
                combo: 'ctrl+3',
                description: 'Gambar 3',
                callback: function (event, hotkey) {
                    context.setAllImage("kpugambar3");
                    event.preventDefault();
                }
            });
            hotkeys.add({
                combo: 'ctrl+4',
                description: 'Gambar 4',
                callback: function (event, hotkey) {
                    context.setAllImage("kpugambar4");
                    event.preventDefault();
                }
            });
            hotkeys.add({
                combo: 'ctrl+5',
                description: 'Gambar 5',
                callback: function (event, hotkey) {
                    context.setAllImage("kpugambar5");
                    event.preventDefault();
                }
            });
            hotkeys.add({
                combo: 'n',
                description: 'Desa Berikutnya',
                callback: function (event, hotkey) {
                    if (context.DataDesa.length > 0) {
                        context.setDesa(context.desaSelectedNext);
                    }
                    event.preventDefault();
                }
            });
            hotkeys.add({
                combo: 'p',
                description: 'Desa Sebelumnya',
                callback: function (event, hotkey) {
                    if (context.DataDesa.length > 0) {
                        context.setDesa(context.desaSelectedPrev);
                    }
                    event.preventDefault();
                }
            });


            this.setGraph = function (dataSuara, attribute) {
                if (typeof attribute === "undefined") {
                    attribute = "";
                }
                dataSuara["options" + attribute] = {size: 30, animate: false, barColor: '#F02316', scaleColor: false, lineWidth: 3};
                dataSuara["options" + attribute + "white"] = {size: 30, animate: false, barColor: 'white', scaleColor: false, lineWidth: 3};
                dataSuara["options" + attribute + "80"] = {size: 60, animate: false, barColor: '#F02316', scaleColor: false, lineWidth: 3};
                dataSuara["percent" + attribute] = context.roundToTwo(context.setpercent(dataSuara.jumlahTPSdilock, dataSuara.jumlahTPS), context.numberDecimal);
            }
            var context = this;
            this.initKandidatWilayah = function (kandidatWilayah) {
                kandidatWilayah.tidakmemilih = kandidatWilayah.totalpemilih - (kandidatWilayah.suarasah + kandidatWilayah.suaratidaksah);
                kandidatWilayah.percenttidakmemilih = context.roundToTwo(context.setpercent(kandidatWilayah.tidakmemilih, kandidatWilayah.totalpemilih), context.numberDecimal)
                kandidatWilayah.percent = context.roundToTwo(context.setpercent(kandidatWilayah.jumlahTPSdilock, kandidatWilayah.jumlahTPS), context.numberDecimal)
                kandidatWilayah.total = {suaraTPS: 0, suaraVerifikasiC1: 0, suaraKPU: 0};
                kandidatWilayah.ppercent = {};
                kandidatWilayah.menang = 0;
                kandidatWilayah.menangnourut = 0;
                kandidatWilayah.selisih = 0;
                angular.forEach(kandidatWilayah.kandidat, function (value, key) {
                    kandidatWilayah.total.suaraTPS += value.suaraTPS;
                    kandidatWilayah.total.suaraVerifikasiC1 += value.suaraVerifikasiC1;
                    kandidatWilayah.total.suaraKPU += value.suaraKPU;
                    if (value.suaraVerifikasiC1 > kandidatWilayah.menang) {
                        kandidatWilayah.menang = value.suaraVerifikasiC1;
                        kandidatWilayah.menangnourut = value.urut
                    }
                });
                kandidatWilayah.selisih = kandidatWilayah.menang;
                var attributes = ['suaraTPS', 'suaraVerifikasiC1', 'suaraKPU'];
                angular.forEach(attributes, function (attribute, attributekey) {
                    try {
                        kandidatWilayah.kandidatPemenang['p' + attribute] = context.roundToTwo(context.setpercent(kandidatWilayah.kandidatPemenang[attribute], kandidatWilayah.total[attribute]), context.numberDecimal);
                    } catch (e) {
                    }
                });
                kandidatWilayah.percentselisih = kandidatWilayah.kandidatPemenang['psuaraVerifikasiC1'];
                angular.forEach(kandidatWilayah.kandidat, function (value, key) {
                    value.selisih = kandidatWilayah.menang - value.suaraVerifikasiC1;
                    if (value.selisih > 0 && value.selisih < kandidatWilayah.selisih) {
                        kandidatWilayah.selisih = value.selisih;
                    }
                    angular.forEach(attributes, function (attribute, attributekey) {
                        try {
                            value['p' + attribute] = context.roundToTwo(context.setpercent(value[attribute], kandidatWilayah.total[attribute]), context.numberDecimal);
                        } catch (e) {
                        }
                    });
                    value.percentselisih = kandidatWilayah.kandidatPemenang['psuaraVerifikasiC1'] - value['psuaraVerifikasiC1'];
                    if (value.percentselisih > 0 && value.percentselisih < kandidatWilayah.percentselisih) {
                        kandidatWilayah.percentselisih = context.roundToTwo(value.percentselisih, context.numberDecimal);
                    }
                });

                kandidatWilayah.done = true;
                kandidatWilayah.donenumber = 1;
                if (context.showdoneonly) {
                    if (kandidatWilayah["percent"] >= context.numberbench) {
                        kandidatWilayah.done = true;
                        kandidatWilayah.donenumber = 1;
                    } else {
                        kandidatWilayah.done = false;
                        kandidatWilayah.donenumber = 0;
                    }
                }
                setTimeout(function () {
                    $('#pst' + kandidatWilayah.kpuid).prettySocial();
                    $('#psf' + kandidatWilayah.kpuid).prettySocial();
                    $('#psg' + kandidatWilayah.kpuid).prettySocial();
                    $('#ps' + kandidatWilayah.kpuid).show();
                }, 2000);
            }
            this.palingkecil = 0;
            this.palingbesar = 0;
            this.setpaling = function (kandidatWilayah) {
                kandidatWilayah.percent = context.roundToTwo(context.setpercent(kandidatWilayah.jumlahTPSdilock, kandidatWilayah.jumlahTPS), context.numberDecimal)
                if (kandidatWilayah.percent >= 80) {
                    if (context.palingkecil === 0) {
                        context.palingkecil = kandidatWilayah.selisih;
                    } else {
                        if (kandidatWilayah.selisih < context.palingkecil) {
                            context.palingkecil = kandidatWilayah.selisih;
                        }
                    }
                    if (kandidatWilayah.selisih > context.palingbesar) {
                        context.palingbesar = kandidatWilayah.selisih;
                    }
                }
            };
            this.options = {size: 30, animate: true, barColor: '#F02316', trackColor: 'white', scaleColor: false, lineWidth: 3};
            this.initDataSuara = function (dataSuara) {
                dataSuara.total = {suaraTPS: 0, suaraVerifikasiC1: 0, suaraKPU: 0};
                dataSuara.ppercent = {};
                angular.forEach(dataSuara.uruts, function (value, key) {
                    dataSuara.total.suaraTPS += dataSuara.suaraKandidat[value + ''].suaraTPS;
                    dataSuara.total.suaraVerifikasiC1 += dataSuara.suaraKandidat[value + ''].suaraVerifikasiC1;
                    dataSuara.total.suaraKPU += dataSuara.suaraKandidat[value + ''].suaraKPU;

                    context.totalsuara.suaraKandidat[value + ''].suaraTPS = context.totalsuara.suaraKandidat[value + ''].suaraTP + dataSuara.suaraKandidat[value + ''].suaraTPS;
                    context.totalsuara.suaraKandidat[value + ''].suaraVerifikasiC1 = context.totalsuara.suaraKandidat[value + ''].suaraVerifikasiC1 + dataSuara.suaraKandidat[value + ''].suaraVerifikasiC1;
                    context.totalsuara.suaraKandidat[value + ''].suaraKPU = context.totalsuara.suaraKandidat[value + ''].suaraKPU + dataSuara.suaraKandidat[value + ''].suaraKPU;
                });

                //context.totalsuara = {"c1": 0, "HC": 0, "KPU": 0, "sah": 0, "tidaksah": 0, "suaraKandidat": context.DataSuaras[0].suaraKandidat};
                context.totalsuara.suaraTPS += dataSuara.total.suaraTPS;
                context.totalsuara.suaraVerifikasiC1 += dataSuara.total.suaraVerifikasiC1;
                context.totalsuara.suaraKPU += dataSuara.total.suaraKPU;
                context.totalsuara.suarasah += dataSuara.suarasah;
                context.totalsuara.suaratidaksah += dataSuara.suaratidaksah;
                context.totalsuara.jumlahTPS += dataSuara.jumlahTPS;
                context.totalsuara.jumlahTPSdilock += dataSuara.jumlahTPSdilock;
                context.totalsuara.percent = context.roundToTwo(context.setpercent(context.totalsuara.jumlahTPSdilock, context.totalsuara.jumlahTPS), context.numberDecimal);

                var attributes = ['suaraTPS', 'suaraVerifikasiC1', 'suaraKPU'];
                angular.forEach(dataSuara.uruts, function (value, key) {
                    angular.forEach(attributes, function (attribute, attributekey) {
                        try {
                            dataSuara.suaraKandidat[value + '']['p' + attribute] = context.roundToTwo(context.setpercent(dataSuara.suaraKandidat[value + ''][attribute], dataSuara.total[attribute]), context.numberDecimal);
                        } catch (e) {
                        }
                        try {
                            context.totalsuara.suaraKandidat[value + '']['p' + attribute] = context.roundToTwo(context.setpercent(context.totalsuara.suaraKandidat[value + ''][attribute], context.totalsuara[attribute]), context.numberDecimal);
                        } catch (e) {
                        }
                    });
                });
            }
            this.formatnumber = function (number) {
                if (typeof number === "undefined") {
                    return '0';
                }
                if (isNaN(number)) {
                    return '0';
                }
                if (number === 0)
                    return '0';
                var numbers = ('' + number).split(".");
                var nres = '' + numbers[0];
                var res = '';
                for (var i = 0; i < nres.length; i++) {
                    if (i > 0 && i % 3 === 0) {
                        res = '.' + res;
                    }
                    res = nres[nres.length - i - 1] + res;
                }
                if (numbers.length > 1) {
                    res = res + "." + numbers[1]
                }
                return res;
            }
            this.formatNama = function (nama, index) {
                try {
                    var namas = nama.split("-");
                    return namas[index];
                } catch (e) {
                }
                return nama;
            }
            this.setGraphSuara = function (itemClass, urut) {
                setTimeout(function () {
                    var graphs = $(itemClass);
                    graphs.each(function () {
                        try {
                            var contexthis = this;
                            var vurut = $(contexthis).attr("urut");
                            if (typeof vurut === "undefined") {
                                vurut = "";
                            }
                            if (parseInt(vurut) === urut) {
                                $(contexthis).easyPieChart({size: 30, animate: true, barColor: '#F02316', trackColor: 'white', scaleColor: false, lineWidth: 3});
                            }
                        } catch (e) {
                        }
                    });
                }, 2000);
            }
            this.getTingkatChild = function (dataSuara) {
                if (dataSuara.tingkat === "Kecamatan") {
                    return "Desa"
                } else if (dataSuara.tingkat === "Kabupaten-Kota") {
                    return "Kecamatan"
                } else if (dataSuara.tingkat === "Provinsi") {
                    return "Kabupaten"
                } else if (dataSuara.tingkat === "Desa") {
                    return "TPS"
                }
            }
            this.setTooltip = function () {
                try {
                    $('[data-toggle="tooltip"]').tooltip();
                } catch (e) {
                }
            }
            this.login = function (url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.tahun, $scope.$parent.$parent, $window)
            };
            this.numberbench = 80;
            this.refreshall = function () {
                angular.forEach(context.KandidatWilayahs, function (kandidatWilayah, $index) {
                    context.refreshAgregasi(kandidatWilayah, kandidatWilayah.kpuid, $index)
                });
            };
            this.getindex = function (kandidatWilayah) {
                if ((context.palingbesar - context.palingkecil) <= 0) {
                    return 0;
                }
                var retval = context.roundToTwo((context.palingbesar - kandidatWilayah.selisih) / (context.palingbesar - context.palingkecil), context.numberDecimal);
                if (retval > 1) {
                    return 1;
                } else {
                    return retval;
                }
            }
            this.hashs = window.location.hash.substr(2).split("/");
            this.countKandidat = function (scope) {
                if (typeof scope === "undefined") {
                    scope = $scope.$parent.$parent;
                }
                context.jumlahTotalKandidat = 0;
                scope.klimitTo = context.KandidatWilayahs.length;
                if (context.showdoneonly) {
                    context.jumlahwilayah = 0;
                    scope.klimitTo = context.KandidatWilayahs.length;
                } else {
                    context.jumlahwilayah = context.KandidatWilayahs.length;
                    scope.klimitTo = 3;
                }
                angular.forEach(context.KandidatWilayahs, function (kandidatWilayah, key) {
                    context.initKandidatWilayah(kandidatWilayah)
                    if (context.showdoneonly) {
                        if (kandidatWilayah["percent"] >= context.numberbench) {
                            kandidatWilayah.done = true;
                            kandidatWilayah.donenumber = 1;
                            context.jumlahTotalKandidat += kandidatWilayah.kandidat.length;
                            context.jumlahwilayah += kandidatWilayah.donenumber;
                        } else {
                            kandidatWilayah.done = false;
                            kandidatWilayah.donenumber = 0;
                        }
                    } else {
                        context.jumlahTotalKandidat += kandidatWilayah.kandidat.length;
                        kandidatWilayah.done = true;
                    }
                    context.setpaling(kandidatWilayah);
                });
            };
            this.showmap = false;
            this.runMap = function () {
                context.showmap = true;
                context.hashs = window.location.hash.substr(2).split("/");
                setTimeout(function () {
                    context.setmap();
                    angular.forEach(context.KandidatWilayahs, function (kandidatWilayah, key) {
                        if (kandidatWilayah.percent >= 80) {
                            var blmada = true;
                            var vector = null;
                            var opacity = context.getindex(kandidatWilayah);
                            $.each(context.map.getLayers().getArray(), function (key11, layer) {
                                try {
                                    if (layer.get("kpuid") === kandidatWilayah.kpuid) {
                                        vector = layer;
                                        blmada = false;
                                    }
                                } catch (e) {
                                }
                            });
                            if (blmada) {
                                vector = new ol.layer.Vector({
                                    kpuid: kandidatWilayah.kpuid,
                                    source: new ol.source.Vector(),
                                    style: function (feature, resolution) {
                                        var classify = new ol.style.Style({
                                            fill: new ol.style.Fill({
                                                color: [240, 35, 22, opacity]
                                            }),
                                            stroke: new ol.style.Stroke({
                                                color: [240, 35, 22, 1],
                                                width: 0.4
                                            })
                                        });
                                        return classify;
                                    }
                                });
                                context.map.addLayer(vector);
                            }
                            if (context.hashs[1] === "Kabupaten-Kota") {
                                context.layer = "2";
                                context.mapfilter = "ID2013='" + kandidatWilayah.kode + "'";
                            } else {
                                context.layer = "3";
                                context.mapfilter = "No_prov=" + kandidatWilayah.kode;
                            }
                            context.mapfilter = encodeURIComponent(context.mapfilter);
                            function loadSource(vector, url, kandidatWilayah) {
                                $http.get(url).
                                        success(function (response, status, headers, config) {
                                            try {
                                                var features = context.esrijsonFormat.readFeatures(response, {
                                                    featureProjection: context.map.getView().getProjection()
                                                });
                                                if (features.length > 0) {
                                                    features[0]["kandidatWilayah"] = kandidatWilayah;
                                                    vector.getSource().addFeatures(features);
                                                }
                                            } catch (e) {
                                            }
                                        }).
                                        error(function (data, status, headers, config) {

                                        });
                            }
                            vector.getSource().clear();

                            loadSource(vector, "/overhttps/" + context.layer + "/" + context.mapfilter, kandidatWilayah);

                        }
                    });
                }, 2000);
            }
            this.roundToTwo = function (num, a) {
                return $KawalService.roundToTwo(num, a);
            };
            this.setpercent = function (a, b) {
                return $KawalService.setpercent(a, b);
            };
            this.save1 = function ($event, dataSuara, type, $index) {
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var callback = function () {
                    target.html(orignalHtml);
                }
                $KawalService.submitSuara($http, $scope, dataSuara, type, callback);
            };
            this.save = function ($event, dataSuara, type, $index) {
                try {
                    var target = $($event.target);
                } catch (e) {
                    var target = $("#" + type + "_" + dataSuara.kpuid);
                }
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var callback = function () {
                    target.html(orignalHtml);
                }
                if (type === "HC") {
                    dataSuara["errorAlertsHC"] = [];
                    dataSuara["sedangdisaveHC"] = true;
                    if (dataSuara.photosrc.length === 0 && dataSuara["tps_file"].length === 0) {
                        dataSuara["errorAlertsHC"].push('Foto C1 tidak boleh kosong');
                    }
                    angular.forEach(context.uruts, function (value, key) {
                        if (dataSuara.suaraKandidat[value + ''].suaraTPS.length === 0) {
                            dataSuara["errorAlertsHC"].push('Suara ' + dataSuara.suaraKandidat[value + ''].nama + ' tidak boleh kosong');
                        }
                        if (isNaN(dataSuara.suaraKandidat[value + ''].suaraTPS)) {
                            dataSuara["errorAlertsHC"].push('Suara ' + dataSuara.suaraKandidat[value + ''].nama + ' harus angka');
                        }
                    });
                    if (dataSuara.suarasahHC.length === 0) {
                        dataSuara["errorAlertsHC"].push('Suara Sah tidak boleh kosong');
                    }
                    if (dataSuara.suaratidaksahHC.length === 0) {
                        dataSuara["errorAlertsHC"].push('Suara Tidak Sah tidak boleh kosong');
                    }
                    if (isNaN(dataSuara.suaratidaksahHC)) {
                        dataSuara["errorAlertsHC"].push('Suara Tidak Sah harus angka');
                    }
                    if (isNaN(dataSuara.suarasahHC)) {
                        dataSuara["errorAlertsHC"].push('Suara Sah harus angka');
                    }
                    if (dataSuara["errorAlertsHC"].length > 0) {
                        callback();
                        dataSuara["sedangdisaveHC"] = false;
                        try {
                            focus("tidaksah" + type + "_" + dataSuara.kpuid);
                        } catch (e) {
                        }
                        return;
                    }
                    if (dataSuara["tps_file"].length === 0) {
                        $KawalService.getUrlFileSuaraTPS($http, $scope, dataSuara, "save/" + type + "/withimage", callback);
                    } else {
                        $KawalService.submitSuara($http, $scope, dataSuara, "save/" + type + "/noimage", callback);
                    }
                } else {
                    dataSuara["errorAlerts"] = [];
                    dataSuara["sedangdisave"] = true;
                    if (type === "C1") {
                        angular.forEach(context.uruts, function (value, key) {
                            if (dataSuara.suaraKandidat[value + ''].suaraVerifikasiC1.length === 0) {
                                dataSuara["errorAlerts"].push('Suara ' + dataSuara.suaraKandidat[value + ''].nama + ' tidak boleh kosong');
                            }
                            if (isNaN(dataSuara.suaraKandidat[value + ''].suaraVerifikasiC1)) {
                                dataSuara["errorAlerts"].push('Suara ' + dataSuara.suaraKandidat[value + ''].nama + ' harus angka');
                            }

                        });
                        if (dataSuara.suarasah.length === 0) {
                            dataSuara["errorAlerts"].push('Suara Sah tidak boleh kosong');
                        }
                        if (dataSuara.suaratidaksah.length === 0) {
                            dataSuara["errorAlerts"].push('Suara Tidak Sah tidak boleh kosong');
                        }
                        if (isNaN(dataSuara.suarasah)) {
                            dataSuara["errorAlerts"].push('Suara Sah harus angka');
                        }
                        if (isNaN(dataSuara.suaratidaksah)) {
                            dataSuara["errorAlerts"].push('Suara Tidak Sah harus angka');
                        }
                        if (dataSuara["errorAlerts"].length > 0) {
                            callback();
                            dataSuara["sedangdisave"] = false;
                            try {
                                focus("tidaksah" + type + "_" + dataSuara.kpuid);
                            } catch (e) {
                            }
                            return;
                        }
                        dataSuara["dilock"] = "P";
                    }
                    $KawalService.submitSuara($http, $scope, dataSuara, "save/" + type, callback);
                }
                try {
                    var found = false;
                    var id;
                    angular.forEach(context.DataSuarasTPS, function (value, key) {
                        if (parseInt(value.kpuid) > parseInt(dataSuara.kpuid) && (!found) && value.dilock === "N" && value.tidakadaC1 === "N") {
                            id = value.kpuid;
                            found = true;
                            if ($scope.$parent.$parent.klimitTo <= key) {
                                $scope.$parent.$parent.klimitTo = key + 3;
                            }
                        }
                    });
                    if (!found) {
                        angular.forEach(context.DataSuarasTPS, function (value, key) {
                            if (value.kpuid !== dataSuara.kpuid && (!found) && value.dilock === "N" && value.tidakadaC1 === "N") {
                                id = value.kpuid;
                                found = true;
                                if ($scope.$parent.$parent.klimitTo <= key) {
                                    $scope.$parent.$parent.klimitTo = key + 3;
                                }
                            }
                        });
                    }
                    if (!found) {
                        angular.forEach(context.DataSuarasTPS, function (value, key) {
                            if (value.kpuid !== dataSuara.kpuid && (!found) && value.dilock === "N") {
                                id = value.kpuid;
                                found = true;
                                if ($scope.$parent.$parent.klimitTo <= key) {
                                    $scope.$parent.$parent.klimitTo = key + 3;
                                }
                            }
                        });
                    }
                    if (!found) {
                        id = context.DataSuarasTPS[$index + 1].kpuid;
                    }
                    focus("tidaksah" + type + "_" + id);
                } catch (e) {
                }
            };
            var context2 = $scope;
            this.photoChange = function (selected) {
                var idphotoChange = (selected.id.replace("photo", ""));
                for (var i = 0, f; f = selected.files[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    $scope.$apply(function (scope) {
                        for (var ii = 0; ii < context2.tabulasiCtrl.DataSuarasTPS.length; ii++) {
                            if (idphotoChange === context2.tabulasiCtrl.DataSuarasTPS[ii].kpuid) {
                                context2.tabulasiCtrl.DataSuarasTPS[ii].photos.push(f);
                            }
                        }
                        var reader = new FileReader();
                        reader.onload = (function (theFile) {
                            return function (e) {
                                $scope.$apply(function (scope) {
                                    for (var ii = 0; ii < context2.tabulasiCtrl.DataSuarasTPS.length; ii++) {
                                        if (idphotoChange === context2.tabulasiCtrl.DataSuarasTPS[ii].kpuid) {
                                            context2.tabulasiCtrl.DataSuarasTPS[ii].photosrc = e.target.result;
                                            context2.tabulasiCtrl.DataSuarasTPS[ii].showPhoto = true;
                                            context2.tabulasiCtrl.DataSuarasTPS[ii].errorAlerts = [];
                                            context2.tabulasiCtrl.DataSuarasTPS[ii].tps_file = [];
                                            context2.tabulasiCtrl.initDivImg("HC" + idphotoChange);
                                        }
                                    }

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
            this.alltps = false;
            this.DataDesa = [];
            this.namas = [];
            this.uruts = [];
            this.showHitungCepat = false;
            this.showC1 = true;
            this.showKPU = true;
            this.belumdiisi = true;
            this.kpuurls = ["http://scanc1.kpu.go.id/viewp.php", "http://103.21.228.33/viewc12.php", "http://103.21.228.33/viewc11.php"];
            this.totalsuara = {"jumlahTPSdilock": 0, "jumlahTPS": 0, "suaraVerifikasiC1": 0, "suaraTPS": 0, "suaraKPU": 0, "suarasah": 0, "suaratidaksah": 0, "suaraKandidat": {}};
            this.setPage = function (controlWilayah, $index) {
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
            this.refreshAgregasi = function (kandidatWilayah, kpuid, $index) {
                var hashs = window.location.hash.substr(2).split("/");
                $http.post('/kandidat/refreshagregasi/' + hashs[2] + '/' + hashs[1] + '/' + kpuid, [kandidatWilayah]).
                        success(function (data, status, headers, config) {
                            if (data.length > 0) {
                                try {
                                    data = data[0];
                                    for (var ii = 0; ii < context.KandidatWilayahs.length; ii++) {
                                        try {
                                            if (kpuid === context.KandidatWilayahs[ii].kpuid) {
                                                context.KandidatWilayahs[ii] = data[0];
                                                context.initKandidatWilayah(context.KandidatWilayahs[ii]);
                                            }
                                        } catch (e) {
                                        }
                                    }
                                } catch (e) {
                                }
                            }
                        }).
                        error(function (data, status, headers, config) {

                        });
            }
            this.getRobot = function (dataSuara, kpuid, $index) {
                var hashs = window.location.hash.substr(2).split("/");
                var wil = hashs[3];
                if (hashs[1] !== "Provinsi") {
                    wil = hashs[4];
                }
                $http.post('/suara/getkpudata/' + hashs[2] + '/' + wil, [dataSuara]).
                        success(function (data, status, headers, config) {
                            if (data.length > 0) {
                                try {
                                    for (var iii = 0; iii < context.uruts.length; iii++) {
                                        context.DataSuaras.total.suaraKandidat[context.uruts[iii] + ''].suaraKPU = 0;
                                    }
                                    context.DataSuaras.total.TotalsuaraKPU = 0;
                                    for (var ii = 0; ii < context.DataSuaras.length; ii++) {
                                        try {
                                            if (kpuid === context.DataSuaras[ii].kpuid) {
                                                context.DataSuaras[ii].suaraKandidat = data[0].suaraKandidat;
                                            }
                                            for (var iii = 0; iii < context.uruts.length; iii++) {
                                                context.DataSuaras.total.TotalsuaraKPU += context.DataSuaras[ii].suaraKandidat[context.uruts[iii] + ''].suaraKPU;
                                                context.DataSuaras.total.suaraKandidat[context.uruts[iii] + ''].suaraKPU += context.DataSuaras[ii].suaraKandidat[context.uruts[iii] + ''].suaraKPU;
                                            }
                                        } catch (e) {
                                        }
                                    }
                                } catch (e) {
                                }
                            }
                        }).
                        error(function (data, status, headers, config) {

                        });
            }
            this.getChild = function (kandidatWilayah, all) {
                if (kandidatWilayah.tingkat === "TPS") {
                    return;
                }
                if (typeof all === "undefined") {
                    all = "";
                }
                var hashs = window.location.hash.substr(2).split("/");
                var parentkpuid = 0;
                try {
                    parentkpuid = kandidatWilayah.parentkpuid.length;
                } catch (e) {
                    parentkpuid = 0;
                }
                var currentPath = window.location.hash.substr(1).replace("/" + hashs[0] + "/", "");
                if (all.length > 0) {
                    if (hashs[1] === "Kabupaten-Kota" && parentkpuid > 0) {
                        $KawalService.handleHash("/tabulasi.html/" + currentPath + "/" + kandidatWilayah.parentkpuid + "/" + kandidatWilayah.kpuid + "/all", $scope);
                    } else {
                        $KawalService.handleHash("/tabulasi.html/" + currentPath + "/" + kandidatWilayah.kpuid + "/all", $scope);
                    }
                } else {
                    if (hashs[1] === "Kabupaten-Kota" && parentkpuid > 0) {
                        $KawalService.handleHash("/tabulasi.html/" + currentPath + "/" + kandidatWilayah.parentkpuid + "/" + kandidatWilayah.kpuid, $scope);
                    } else {
                        $KawalService.handleHash("/tabulasi.html/" + currentPath + "/" + kandidatWilayah.kpuid, $scope);
                    }
                }
            };
            this.getChildLink = function (kandidatWilayah, all) {
                if (kandidatWilayah.tingkat === "TPS") {
                    return "javascript:";
                }
                if (typeof all === "undefined") {
                    all = "";
                }
                var hashs = window.location.hash.substr(2).split("/");
                var parentkpuid = 0;
                try {
                    parentkpuid = kandidatWilayah.parentkpuid.length;
                } catch (e) {
                    parentkpuid = 0;
                }
                var currentPath = window.location.hash.substr(1).replace("/" + hashs[0] + "/", "");
                if (all.length > 0) {
                    if (hashs[1] === "Kabupaten-Kota" && parentkpuid > 0 && kandidatWilayah.parentkpuid !== hashs[hashs.length - 1]) {
                        return "/#/tabulasi.html/" + currentPath + "/" + kandidatWilayah.parentkpuid + "/" + kandidatWilayah.kpuid + "/all";
                    } else {
                        return"/#/tabulasi.html/" + currentPath + "/" + kandidatWilayah.kpuid + "/all";
                    }
                } else {
                    if (hashs[1] === "Kabupaten-Kota" && parentkpuid > 0 && kandidatWilayah.parentkpuid !== hashs[hashs.length - 1]) {
                        return "/#/tabulasi.html/" + currentPath + "/" + kandidatWilayah.parentkpuid + "/" + kandidatWilayah.kpuid;
                    } else {
                        return "/#/tabulasi.html/" + currentPath + "/" + kandidatWilayah.kpuid;
                    }
                }
            };
            this.showTable = function (data) {
                if (data.length > 0) {
                    return true;
                } else {
                    return false;
                }
            };
            this.showTextBox = function (userlevel, user, dataSuara, attributeName, val, type) {
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
            this.showKPULink = function (kpuurl, dataSuara) {
                var parents = dataSuara.key.raw.name.split("#");
                function pad(num, size) {
                    var s = "000000000" + num;
                    return s.substr(s.length - size);
                }
                var parent = pad(parents[2], 7) + pad(dataSuara.nama, 3);
                dataSuara["kpugambar1"] = kpuurl + "?f=" + parent + "01.jpg";
                dataSuara["kpugambar2"] = kpuurl + "?f=" + parent + "02.jpg";
                dataSuara["kpugambar3"] = kpuurl + "?f=" + parent + "03.jpg";
                dataSuara["kpugambar4"] = kpuurl + "?f=" + parent + "04.jpg";
                dataSuara["kpugambar5"] = kpuurl + "?f=" + parent + "05.jpg";
                dataSuara["currentkpugambar"] = dataSuara["kpugambar3"];
            };

            this.showGambar = function (dataSuara, data, $index) {
                dataSuara["currentkpugambar"] = dataSuara[data];
                $("#img" + dataSuara.kpuid).attr("src", dataSuara["currentkpugambar"]);
                try {
                    focus("tidaksahC1_" + dataSuara.kpuid);
                } catch (e) {
                }
            };
            this.resizeGambar = function (dataSuara, $index, val) {
                $('#modal-content-img').html('<img src="' + dataSuara[val] + '" style="width: 100%;">');
                $('#modal-content-div').modal('show');
                try {
                    focus("tidaksahC1_" + dataSuara.kpuid);
                } catch (e) {
                }
            }
            this.putarGambar = function (dataSuara, id, value) {
                dataSuara["currentRotate"] = dataSuara["currentRotate"] + value;
                $("#img" + id).attr("style", "width:600px;-ms-transform: rotate(" + dataSuara['currentRotate'] + "deg);-webkit-transform: rotate(" + dataSuara['currentRotate'] + "deg);transform: rotate(" + dataSuara['currentRotate'] + "deg);");
                $("#divimg" + id).scrollLeft(600);
                try {
                    focus("tidaksahC1_" + dataSuara.kpuid);
                } catch (e) {
                }
            }
            this.putarGambar2 = function (value) {
                var datarot = $('#modal-content-img').attr('data-rot');
                datarot = parseInt(datarot) + parseInt(value);
                $('#modal-content-img').attr('data-rot', datarot);
                $('#modal-content-img').children().attr("style", "width:100%;-ms-transform: rotate(" + datarot + "deg);-webkit-transform: rotate(" + datarot + "deg);transform: rotate(" + datarot + "deg);");
            }
            this.initDivImg = function (id) {
                setTimeout(function () {
                    $("#divimg" + id).scrollLeft(600);
                    $("#divimg" + id).scrollTop(120);
                }, 1000);
            }
            this.setcolor = function (dataSuara, $index) {
                if (dataSuara.tidakadaC1 === "N") {
                    dataSuara["tidakadaC1_"] = false;
                    dataSuara["color"] = "transparent";
                } else {
                    dataSuara["tidakadaC1_"] = true;
                    dataSuara["color"] = "pink";
                }
            }

            this.init = function (tabulasiCtrl, dataSuara, $index) {
                var parents = "";
                try {
                    parents = dataSuara.key.raw.name.split("#");
                } catch (e) {
                    parents = "";
                }

                if (parents.length === 0) {
                    return;
                }
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
                dataSuara["currentkpugambar"] = dataSuara["kpugambar3"];
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
                        context.initDivImg("HC" + dataSuara.kpuid);
                    }
                } else {
                    if (dataSuara["tps_file"].length > 0) {
                        dataSuara.photosrc = dataSuara["tps_file"][dataSuara["tps_file"].length - 1]["fileLink"];
                        dataSuara["showPhoto"] = true;
                        context.initDivImg("HC" + dataSuara.kpuid);
                    }
                }
                dataSuara["getSuaraRobot"] = true;
                dataSuara["showrecord"] = true;
                dataSuara["sedangmengambilsuararobot"] = false;
            };
            this.getSuaraRobot = function (dataSuara) {
                var hashs = window.location.hash.substr(2).split("/");
                var wil = hashs[3];
                if (hashs[1] !== "Provinsi") {
                    wil = hashs[4];
                }
                dataSuara["sedangmengambilsuararobot"] = true;
                if (dataSuara.dilock === "N" && dataSuara["getSuaraRobot"]) {
                    $http.post('/suara/getkpudataTPS/' + hashs[2] + '/' + wil, [dataSuara]).
                            success(function (data, status, headers, config) {
                                if (data.length > 0) {
                                        for (var ii = 0; ii < context.DataSuarasTPS.length; ii++) {
                                            try {
                                                if (dataSuara.kpuid === context.DataSuarasTPS[ii].kpuid) {
                                                    context.DataSuarasTPS[ii].getSuaraRobot = false;
                                                    context.DataSuarasTPS[ii].sedangmengambilsuararobot = false;
                                                    context.DataSuarasTPS[ii].suaraKandidat = data[0].suaraKandidat;
                                                    context.DataSuarasTPS[ii].suarasah = data[0].suarasah;
                                                }
                                            } catch (e) {
                                            }
                                        }
                                } else {
                                    dataSuara["sedangmengambilsuararobot"] = false;
                                }
                            }).
                            error(function (data, status, headers, config) {
                                dataSuara["sedangmengambilsuararobot"] = false;
                            });
                }
            }
            this.foundrecord = false;
            this.tpsshowhide = function (dataSuara, $index) {
                var showImage = function (dataSuara) {
                    var id = dataSuara.kpuid;
                    if ($("#img" + id).attr("src") !== $("#img" + id).attr("data-src")) {
                        $("#img" + id).attr("src", $("#img" + id).attr("data-src"));
                        context.initDivImg(id);
                        context.getSuaraRobot(dataSuara);
                    }
                };
                var addklimit = function () {
                    if (!context.foundrecord) {
                        $scope.$parent.$parent.klimitTo = $index + 1;
                    }
                }
                if (context.belumdiisi) {
                    if (dataSuara.dilock !== "N") {
                        $("#img" + dataSuara.kpuid).attr("src", "");
                        addklimit();
                        return (dataSuara["showrecord"] && false);
                    } else {
                        if ($index <= $scope.$parent.$parent.klimitTo) {
                            context.foundrecord = true;
                            showImage(dataSuara);
                            return (dataSuara["showrecord"] && true);
                        } else {
                            $("#img" + dataSuara.kpuid).attr("src", "");
                            addklimit();
                            return (dataSuara["showrecord"] && false);
                        }
                    }
                } else {
                    if ($index <= $scope.$parent.$parent.klimitTo) {
                        showImage(dataSuara);
                        return (dataSuara["showrecord"] && true);
                    } else {
                        $("#img" + dataSuara.kpuid).attr("src", "");
                        addklimit();
                        return (dataSuara["showrecord"] && false);
                    }
                }
            }
            this.setshowrecord = function (dataSuara) {
                dataSuara["showrecord"] = false;
            }
            this.init2 = function (tabulasiCtrl, dataSuara, urut, $index) {
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
            this.setDesa = function (datadesa) {
                if (typeof datadesa === "undefined") {
                    return;
                }
                try {
                    context.desaSelected = datadesa;
                    var hashs = window.location.hash.substr(2).split("/");
                    $KawalService.handleHash(hashs[0] + "/" + hashs[1] + "/" + hashs[2] + "/" + hashs[3] + "/" + hashs[4] + "/" + hashs[5] + "/" + datadesa.kpuid, $scope.$parent.$parent);
                } catch (e) {
                }
            };
            this.setPrevandNext = function () {
                angular.forEach(context.DataDesa, function (value, key) {
                    if (context.desaSelected.kpuid === value.kpuid) {
                        context.desaSelectedPrev = context.DataDesa[key - 1];
                        context.desaSelectedNext = context.DataDesa[key + 1];
                    }
                });
            };
            this.tingkat = "";
            this.getData = function () {
                if (window.location.hash.substr(window.location.hash.length - 1) === "/") {
                    window.location.hash = window.location.hash.substr(0, window.location.hash.length - 1);
                }
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs[0] !== "tabulasi.html" && hashs[0] !== "dashboard.html") {
                    return;
                }
                $scope.$parent.$parent.klimitTo = 3;
                if (context.map !== null) {
                    context.map.setTarget(null);
                    context.map = null;
                }
                context.showmap = false;
                $("#mapdiv").html("");
                context.tingkat = hashs[1];
                context.KandidatWilayahs = [];
                context.DataSuaras = [];
                context.DataSuarasTPS = [];
                context.alltps = false;
                context.DataDesa = [];
                context.blmadaData = true;
                context.namas = [];
                context.uruts = [];
                context.showdoneonly = false;
                context.totalsuara = {"jumlahTPSdilock": 0, "jumlahTPS": 0, "suaraVerifikasiC1": 0, "suaraTPS": 0, "suaraKPU": 0, "suarasah": 0, "suaratidaksah": 0, "suaraKandidat": {}};
                context.controlWilayahs = [
                    {id: 1, kpuid: "0", nama: "Nasional", tingkat: "Nasional", showdiv: false}
                ];
                if (hashs.length >= 3) {
                    $scope.$parent.$parent.tahun = hashs[2];
                }
                if (hashs.length >= 2) {
                    $scope.$parent.$parent.tingkat = hashs[1];
                }

                if ($scope.$parent.$parent.tahun === "2014") {
                    context.kpuurls = ["http://scanc1.kpu.go.id/viewp.php"];
                    $kpuurl = "http://scanc1.kpu.go.id/viewp.php";
                }
                if ($scope.$parent.$parent.tahun === "2015") {
                    if ($scope.$parent.$parent.tingkat === "Provinsi") {
                        context.kpuurls = ["http://103.21.228.33/viewc11.php"];
                        $kpuurl = "http://103.21.228.33/viewc11.php";
                    } else {
                        context.kpuurls = ["http://103.21.228.33/viewc12.php"];
                        $kpuurl = "http://103.21.228.33/viewc12.php";
                    }
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

                        var callback = function (data, id) {
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
                    var lastid = hashs[hashs.length - 1];
                    var lastid0 = hashs[hashs.length - 2];
                    var action = "get";
                    if (hashs[hashs.length - 1] === 'all') {
                        lastid = hashs[hashs.length - 2];
                        lastid0 = hashs[hashs.length - 3];
                        action = 'getalltps';
                        context.alltps = true;
                    }
                    $http.get('/suara/' + action + '/' + hashs[2] + '/' + hashs[1] + '/' + lastid).
                            success(function (xdata, status, headers, config) {
                                $scope.$parent.$parent.klimitTo = 3;
                                if (xdata.length > 0) {
                                    $kpuurl = xdata[3];
                                    var data = xdata[0];
                                    if (data.length > 0) {
                                        if (action === 'getalltps') {
                                            context.DataSuarasTPS = xdata[4];
                                            context.namas = context.DataSuarasTPS[0].namas;
                                            context.uruts = context.DataSuarasTPS[0].uruts;
                                            context.blmadaData = false;
                                        } else {
                                            if (data[0].tingkat === "TPS") {
                                                context.blmadaData = false;
                                                context.DataSuarasTPS = data;
                                                $http.get('/suara/get/' + hashs[2] + '/' + hashs[1] + '/' + lastid0).
                                                        success(function (data, status, headers, config) {
                                                            var sortnama = function (a, b) {
                                                                if (a.nama < b.nama)
                                                                    return -1;
                                                                if (a.nama > b.nama)
                                                                    return 1;
                                                                return 0;
                                                            }
                                                            context.DataDesa = data[0].sort(sortnama);
                                                            context.setPrevandNext();
                                                        }).
                                                        error(function (data, status, headers, config) {

                                                        });
                                            } else {
                                                context.blmadaData = false;
                                                context.DataSuaras = data;
                                                context.setshare2('_1');
                                                context.setshare2('_2');
                                                //context.totalsuara.suaraKandidat = context.DataSuaras[0].suaraKandidat;
                                            }
                                            context.namas = data[0].namas;
                                            context.uruts = data[0].uruts;
                                            if (context.DataSuaras.length > 0) {
                                                angular.forEach(context.uruts, function (value, key) {
                                                    context.totalsuara.suaraKandidat[value + ""] = {}
                                                    context.totalsuara.suaraKandidat[value + ""].urut = context.DataSuaras[0].suaraKandidat[value + ''].urut;
                                                    context.totalsuara.suaraKandidat[value + ""].nama = context.DataSuaras[0].suaraKandidat[value + ''].nama;
                                                    context.totalsuara.suaraKandidat[value + ""].img_url = context.DataSuaras[0].suaraKandidat[value + ''].img_url;
                                                    context.totalsuara.suaraKandidat[value + ""].suaraTPS = 0;
                                                    context.totalsuara.suaraKandidat[value + ""].suaraVerifikasiC1 = 0;
                                                    context.totalsuara.suaraKandidat[value + ""].suaraKPU = 0;
                                                });
                                            }
                                        }
                                    }
                                }
                                $KawalService.itemyangsedangdiproses.setTabulasi(false);
                            }).
                            error(function (data, status, headers, config) {

                            });

                } else {
                    if (hashs.length <= 2) {
                        $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + $scope.$parent.$parent.tahun, $scope);
                        hashs.push($scope.$parent.$parent.tahun);
                    }
                    var xscope = $scope.$parent.$parent;
                    var callback = function () {
                        context.blmadaData = false;
                        context.palingkecil = 0;
                        context.palingbesar = 0;
                        context.countKandidat(xscope);
                    };
                    $http.get('/kandidat/get/' + hashs[2] + '/' + hashs[1]).
                            success(function (data, status, headers, config) {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        context.KandidatWilayahs = data;
                                        callback();
                                    }
                                }
                                $KawalService.itemyangsedangdiproses.setTabulasi(false);
                            }).
                            error(function (data, status, headers, config) {

                            });
                }
            };
            $KawalService.sendToGa();
            $scope.$watch(function () {
                return window.location.hash;
            }, function (value) {
                context.getData();
            });
        }]);
    app.controller('crowddataController', ['$scope', '$http', '$KawalService', '$window', function ($scope, $http, $KawalService, $window) {
            var context = this;
            this.crowdatas = [];
            this.KandidatWilayah0 = "";
            this.updatedata = function ($event, $index, val, crowdata) {
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var hashs = window.location.hash.substr(2).split("/");
                $http.post('/kandidat/update-profil-crowd/' + hashs[2] + '/' + hashs[1] + '/' + crowdata.kpu_paslon_id + '/' + val, []).
                        success(function (data, status, headers, config) {
                            context.crowdatas[$index] = data[0];
                            $("#collapse" + context.crowdatas[$index].kpu_paslon_id).addClass("in");
                            target.html(orignalHtml);
                        }).
                        error(function (data, status, headers, config) {
                            target.html(orignalHtml);
                        });
            }
            this.getData = function () {
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
                        success(function (data, status, headers, config) {
                            if (data.length > 0) {
                                data = data[0]
                                context.crowdatas = data;
                            }
                            $KawalService.itemyangsedangdiproses.setTabulasi(false);
                        }).
                        error(function (data, status, headers, config) {

                        });
            };
            $KawalService.sendToGa();
            $scope.$watch(function () {
                return window.location.hash;
            }, function (value) {
                context.getData();
            });
        }]);
    app.controller('profilKandidatController', ['$scope', '$http', '$KawalService', '$sce', function ($scope, $http, $KawalService, $sce) {
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
            this.trustAsHtml = function ($index) {
                context.dataCari[$index].title = $sce.trustAsHtml(context.dataCari[$index].title);
                context.dataCari[$index].titleNoFormatting = $sce.trustAsHtml(context.dataCari[$index].titleNoFormatting);
                context.dataCari[$index].content = $sce.trustAsHtml(context.dataCari[$index].content);
            };
            this.getFromJSON = function () {
                context.dataCari = [];
                context.moreResult = {}
                $KawalService.itemyangsedangdiproses.setKandidat(true);
                var hashs = window.location.hash.substr(2).split("/");
                $http.get('/kandidat/get-profil-from-json/' + hashs[1] + '/dataKandidat/' + context.kandidat.kpu_id_peserta).
                        success(function (data, status, headers, config) {
                            try {
                                context.kandidatJSON = data[0];
                                context.kandidatHTML = $sce.trustAsHtml(data[1].substr(0, data[1].length - 10).replace(new RegExp('href="/', 'g'), 'href="http://infopilkada.kpu.go.id/'));
                                var callback = function (data) {
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
                                click: function (api, options) {
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
                                click: function (api, options) {
                                    api.simulateClick();
                                    api.openPopup('facebook');
                                }
                            });
                            $KawalService.itemyangsedangdiproses.setKandidat(false);
                        }).
                        error(function (data, status, headers, config) {

                        });
            };
            this.CrowdProfilData = {};
            this.CrowdProfilDataTemp = {};
            this.crowdEdit = false;
            this.setcrowdEdit = function (val) {
                context.getFromCrowd(val);
            };
            this.errorMsgNotAuthorize = "";
            this.getFromCrowd = function (edit) {
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
                        success(function (data, status, headers, config) {
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
                        error(function (data, status, headers, config) {

                        });
            };
            this.showBtnEdit = function (user) {
                try {
                    return (!context.crowdEdit) && ((context.CrowdProfilData['main'].validated === 'N' && user.logged) || (context.CrowdProfilData['main'].validated === 'P' && user.uid === context.CrowdProfilData.diupdate_id) || $scope.$parent.$parent.user.userlevel > 5000);
                } catch (e) {
                    return false;
                }
            };
            this.saveit = function ($event) {
                context.setValArray("ketua");
                context.setValArray("wakil");
                var target = $($event.target);
                var orignalHtml = target.html();
                target.html('<i class="fa fa-spinner fa-pulse"></i>');
                var hashs = window.location.hash.substr(2).split("/");
                $http.post('/kandidat/post-profil-crowd/' + hashs[1] + '/' + hashs[2] + '/' + context.kandidat.kpu_id_peserta, context.CrowdProfilData).
                        success(function (data, status, headers, config) {
                            data = data[0];
                            context.CrowdProfilData = data;
                            context.CrowdProfilData["ketua"] = $.extend({}, data.profil.ketua);
                            context.CrowdProfilData["wakil"] = $.extend({}, data.profil.wakil);
                            context.CrowdProfilData["main"] = {validated: data.validated, kpuid: data.kpuid, nama: data.nama, kpu_paslon_id: data.kpu_id_peserta, parentkpuid: data.parentkpuid, parentNama: data.parentNama, visi: data.visi, misi: data.misi, program_pendidikan: data.program_pendidikan, program_hukum: data.program_hukum, program_ekonomi: data.program_ekonomi, dana_kampanye: data.dana_kampanye};
                            target.html(orignalHtml);
                            context.crowdEdit = false;
                        }).
                        error(function (data, status, headers, config) {
                            target.html(orignalHtml);
                        });

            };
            this.setValArray = function (attribute) {
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
            this.getData = function () {
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
                            success(function (data, status, headers, config) {
                                if (data.length > 0) {
                                    data = data[0];
                                    if (data.length > 0) {
                                        context.wilayah = data[0];
                                        angular.forEach(context.wilayah.kandidat, function (value, key) {
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
                            error(function (data, status, headers, config) {

                            });
                } else {
                    context.getFromJSON();
                    context.getFromCrowd();
                }
            };
            $KawalService.sendToGa();
            $scope.$watch(function () {
                return location.hash;
            }, function (value) {
                context.getData();
            });
        }]);

    app.controller('kandidatController', ['$scope', '$http', '$KawalService', function ($scope, $http, $KawalService) {
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
            this.editKandiat = function (kandidat, wilayah) {
                context.showForm(context);
                context.showAddNewCandidate = true;
                if ($scope.$parent.$parent.user.userlevel >= 1000 && context.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, wilayah.parentkpuid, context.callback, "kabkotas");
                }
                context.kandidat.nama = kandidat.nama;
                context.kandidat.kpu_id_peserta = kandidat.kpu_id_peserta;
                context.kandidat.urut = kandidat.urut + "";
                context.photosrc = kandidat.img_url;
                context.kandidat.img_url = kandidat.img_url;
                context.showPhoto = true;
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
            $('.dropdown-menu').click(function (event) {
                var target = $(event.target);
                if (target.is("input") || target.is("i") || target.is("label") || target.is("div")) {
                    event.stopPropagation();
                }
            });
            this.photoChange = function (selected) {
                context.photos = selected.files;
                for (var i = 0, f; f = context.photos[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            $scope.$apply(function () {
                                context.photosrc = e.target.result;
                                context.showPhoto = true;
                                context.errorAlerts = [];
                                context.kandidat.img_url = "";
                            })
                        };
                    })(f);
                    reader.readAsDataURL(f);
                }
            };

            this.callback = function (data, levelName) {
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
                kpu_id_peserta: "",
                photosrc: "",
                showPhoto: false
            };
            this.showForm = function (selected) {
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
                    kpu_id_peserta: "",
                    photosrc: "",
                    showPhoto: false
                }
                selected.showAddNewCandidate = !selected.showAddNewCandidate;
                if ($scope.$parent.$parent.user.userlevel >= 1000 && context["provinsis"].length === 0) {
                    $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, "0", context.callback, "provinsis");
                }
            }
            this.provinsis = [];
            this.fromSetWilayah = false;
            this.setWilayah = function (scope, selected) {
                scope.fromSetWilayah = true;
                scope.wilayah = selected;
                scope.childWilayahs = [];
                var hashs = window.location.hash.substr(2).split("/");
                $KawalService.handleHash("#/" + hashs[0] + "/" + hashs[1] + "/" + hashs[2] + "/" + selected.kpuid, $scope.$parent.$parent);
                var callback = function (data, id) {
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
            this.isDikunci = function () {
                if (this.wilayah.dikunci === "N") {
                    return false;
                } else if (this.wilayah.dikunci === "Y") {
                    return true;
                }
            };
            this.showStatusSetup = function (StatusWilayahSetup) {
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
            this.setLock = function () {
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    this.wilayah.dikunci = 'Y';
                    this.fromSetWilayah = false;
                    var context = this;
                    context.childWilayahs = [];
                    var callback = function (data, id) {
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
            this.resetup = function (kandidatCtrl, wilayah, $index, user) {
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
                    var callback = function (data) {
                        if (data[0] === "OK") {
                            kandidatCtrl.childWilayahs[$index] = data[1];
                        }
                    }
                    $KawalService.setupSuaraWilayah($http, {data: [hashs[1], wilayah, this.wilayah]}, callback, "setup");
                }
            };
            this.init = function (kandidatCtrl, wilayah, $index) {
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
                        angular.forEach(context.wilayahs, function (value, key) {
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
                        var callback = function (data) {
                            if (data[0] === "OK") {
                                kandidatCtrl.childWilayahs[$index] = data[1];
                            }
                        }
                        $KawalService.setupSuaraWilayah($http, arg, callback, "setup");
                    }
                }
            }
            this.getData = function () {
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
                    kpu_id_peserta: "",
                    photosrc: "",
                    showPhoto: false
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
                        success(function (data, status, headers, config) {
                            if (data.length > 0) {
                                data = data[0];
                                if (data.length > 0) {
                                    context.wilayahs = data;
                                    if (hashs.length === 4) {
                                        angular.forEach(context.wilayahs, function (value, key) {
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
                        error(function (data, status, headers, config) {
                            context.showAll = true;
                        });
            }
            this.photos = [];
            this.files = [];
            this.dosubmit = function ($event, user, selected) {
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
                var callback = function () {
                    try {
                        //target.html(orignalHtml);
                        location.reload();
                    } catch (e) {
                    }
                }
                if (selected.kandidat.img_url.length === 0) {
                    $KawalService.getUrlFileKandidat($http, $scope, callback);
                } else {
                    $KawalService.submitKandidat($http, $scope, "", callback);
                }
                return false;
            }
            this.setProvinsi = function (selected) {
                this.kandidat.provinsiId = selected.kpuid;
                this.kandidat.provinsi = selected.nama;
                //if (this.kandidat.tingkat.toLowerCase() === "kabupaten-kota") {
                $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, selected.kpuid, context.callback, "kabkotas");
                //}
            }
            this.setKabupaten = function (selected) {
                this.kandidat.kabupatenId = selected.kpuid;
                this.kandidat.kabupaten = selected.nama;
            }

            $scope.$watch(function () {
                return location.hash;
            }, function (value) {
                context.getData();
            });
        }]);
    app.controller('wilayahController', ['$http', '$scope', '$KawalService', function ($http, $scope, $KawalService) {
            this.blmadaData = false;
            /*this.map = L.map('map').setView([-2.2, 118], 4.4);
             this.nkri = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
             layers: 'BatasWilayah:propinsi_shp',
             format: 'image/png',
             transparent: true,
             attribution: "<a href='http://geoserver.apps.kawaldesa.id/geoserver/web/?wicket:bookmarkablePage=:org.geoserver.web.demo.MapPreviewPage' target='_kawaldesa'>geoserver.apps.kawaldesa.id</a>"
             }).addTo(this.map);
             // Disable drag and zoom handlers.
             //this.map.dragging.disable();
             this.map.touchZoom.disable();
             //this.map.doubleClickZoom.disable();
             this.map.scrollWheelZoom.disable();*/
            this.kabupaten = null;
            this.controlWilayahs = [
                {id: 1, kpuid: "0", nama: "Nasional", tingkat: "Nasional", showdiv: false}
            ];
            this.wilayahs = [];
            this.provinsis = [];
            this.kabkotas = [];
            this.kecamatans = [];
            this.desas = [];
            this.getData = function () {
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
                        var callback = function (data, id) {
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
                var callback = function (data) {
                    if (data.length > 0) {
                        if (data[0].length > 0) {
                            var sortid = function (a, b) {
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
                    //context.clearChildMap(context);
                    //context.map.setView([-2.2, 118], 4.4);
                } else {
                    //context.clearChildMap(context);
                    if (hashs.length === 4) {
                        /*context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                         layers: 'BatasWilayah:kabupaten_shp',
                         format: 'image/png',
                         transparent: true,
                         cql_filter: "(kpu_prop_id='" + parentId + "')"
                         }).addTo(context.map);*/
                    } else if (hashs.length === 5) {
                        /*context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                         layers: 'BatasWilayah:kabupaten_shp',
                         format: 'image/png',
                         transparent: true,
                         cql_filter: "(kpu_kab_id='" + hashs[hashs.length - 1] + "')"
                         }).addTo(context.map);*/
                    }
                }
                $KawalService.sendToGa();
            };
            /*this.setTahun = function(selected) {
             $scope.$parent.$parent.tahun = selected.tahun;
             var hashs = window.location.hash.substr(2).split("/");
             $KawalService.handleHash(hashs[0] + "/" + selected.tahun + "/0", $scope.$parent.$parent);
             };*/

            this.getChild = function (wilayah) {
                if (wilayah.tingkat === "TPS") {
                    return;
                }
                $KawalService.handleHash(window.location.hash.substr(1) + "/" + wilayah.kpuid, $scope.$parent.$parent);
            };
            this.setPage = function (controlWilayah, $index) {
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
            this.getChildMap = function (selected) {
                var hashs = window.location.hash.substr(2).replace("wilayah.html/", "").split("/");
                var context = this;
                if (hashs.length === 2) {
                    /*context.clearChildMap(context);
                     context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                     layers: 'BatasWilayah:kabupaten_shp',
                     format: 'image/png',
                     transparent: true,
                     cql_filter: "(kpu_prop_id='" + selected.kpuid + "')"
                     }).addTo(context.map);*/
                } else if (hashs.length === 3) {
                    /*context.clearChildMap(context);
                     context.kabupaten = L.tileLayer.wms("http://geoserver.apps.kawaldesa.id/geoserver/BatasWilayah/wms", {
                     layers: 'BatasWilayah:kabupaten_shp',
                     format: 'image/png',
                     transparent: true,
                     cql_filter: "(kpu_kab_id='" + selected.kpuid + "')"
                     }).addTo(context.map);*/
                }
            };
            /*this.clearChildMap = function(context) {
             try {
             context.map.eachLayer(function(layer) {
             if (layer.options.layers !== "BatasWilayah:propinsi_shp") {
             context.map.removeLayer(layer);
             }
             });
             } catch (e) {
             }
             };*/
            var context = this;
            $scope.$watch(function () {
                return location.hash;
            }, function (value) {
                context.getData();
            });
        }]);
    app.controller('dashboardController', ['$scope', '$http', '$KawalService', function ($scope, $http, $KawalService) {

            this.setHash = function () {
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
            this.getUser = function () {
                if ($scope.$parent.$parent.user.userlevel >= 1000) {
                    $scope.panelproprerty.users = "...";
                    $KawalService.getUser($http, $scope.$parent.$parent);
                }
            };
            $KawalService.sendToGa();
            $scope.$watch(function () {
                return window.location.hash;
            }, function (value) {
                context.setHash();
            });
        }]);
    app.controller('UserController', ['$scope', '$window', '$http', '$KawalService', function ($scope, $window, $http, $KawalService) {
            this.login = function (url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.tahun, $scope.$parent, $window)
            };
            $KawalService.sendToGa();
        }]);
    app.controller('userProfileController', ['$scope', '$window', '$http', '$KawalService', function ($scope, $window, $http, $KawalService) {
            $scope.$parent.$parent.tahun = '2015';
            this.searchWilayah3 = "";
            this.searchWilayah2 = "";
            this.searchWilayah1 = "";
            this.searchWilayah0 = "";
            var context = this;
            this.verifikasi = function () {
                $scope.$parent.$parent.selectedTemplate.pathmodal = "/pages/verifikasi.html";
                $('#myModal').modal();
            }
            $('.dropdown-menu').click(function (event) {
                var target = $(event.target);
                if (target.is("input") || target.is("i") || target.is("label") || target.is("div")) {
                    event.stopPropagation();
                }
            });
            this.submitShow = true;
            this.setUserlevelSelection = function (selected) {
                $scope.$parent.$parent.user.userlevel = selected[0];
                $scope.$parent.$parent.user.userlevelDesc = selected[1];
            }
            this.errorAlerts = [];
            this.successAlerts = [];
            this.login = function (url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.tahun, $scope.$parent.$parent, $window)
            };
            this.provinsis = [];
            this.kabkotas = [];
            this.kecamatans = [];
            this.desas = [];
            var context = this;
            var callback = function (data, levelName) {
                context[levelName] = data[0];
            };

            this.setProvinsi = function (provinsi) {
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
            this.setKabkota = function (kabkota) {
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
            this.setKecamatan = function (kecamatan) {
                $scope.$parent.$parent.user.kecamatan = kecamatan.nama;
                $scope.$parent.$parent.user.kecamatanId = kecamatan.kpuid;
                $scope.$parent.$parent.user.desa = "";
                $scope.$parent.$parent.user.desaId = "";
                this.searchWilayah3 = "";
                $KawalService.getWilayahDropdown($http, $scope.$parent.$parent, kecamatan.kpuid, callback, "desas");
            }
            this.setDesa = function (desa) {
                $scope.$parent.$parent.user.desa = desa.nama;
                $scope.$parent.$parent.user.desaId = desa.kpuid;
            }
            this.dosubmit = function ($event, user, selected) {
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
                        success(function (data, status, headers, config) {
                            user = data.user;
                            selected.submitShow = true;
                            selected.successAlerts.push({"text": "Perubahan Data sudah berhasil disimpan, terima kasih atas kerjasamanya."});
                            target.html(orignalHtml);
                        }).
                        error(function (data, status, headers, config) {
                            selected.submitShow = true;
                            target.html(orignalHtml);
                        });
                return false;
            };
            this.reset = function () {
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
    app.controller('verifiaksiController', ['$http', '$scope', '$KawalService', function ($http, $scope, $KawalService) {
            this.sedangprocess = false;
            this.verifiaksi = {"NIK": "", "NAMA": ""};
            this.errorAlerts = [];
            this.successAlerts = [];
            this.sosial = "";
            this.submitShow = true;
            this.close = function (page) {
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
            this.doverifiaksi = function () {
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
                        success(function (data, status, headers, config) {
                            context.sedangprocess = false;
                            var getFloat = function (input) {
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
                        error(function (data, status, headers, config) {
                            context.submitShow = true;
                            context.sedangprocess = false;
                        });

                //this.verifiaksi = {};
            }
            $KawalService.sendToGa();
        }]);

    app.controller('komentarController', ['$window', '$http', '$scope', '$KawalService', function ($window, $http, $scope, $KawalService) {
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

            this.setInitPesan = function () {
                var hashs = window.location.hash.substr(2).split("/");
                if (hashs.length >= 2) {
                    this.pesan = hashs[1] + hashs[2] + hashs[3] + '#' + hashs[5];
                } else {
                    this.pesan = "Pesan Untuk Semua";
                }
            }

            this.init = function () {
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
            this.setJenisKomentar = function (selected) {
                this.pesan = selected.jenisPesan;
            };
            this.props = {
                target: '_blank',
                class: 'myLink'
            };
            this.pesanInitialization = function (selected, pesan, $index, user) {
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


                angular.forEach(pesan.files, function (file, key) {
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
            this.btnTanggapan = function (user, pesan) {
                pesan.showTanggapiError = false;
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                pesan.showTanggapi = user.logged && (pesan.showTanggapi ? pesan.showTanggapi = false : pesan.showTanggapi = true);
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                }
                pesan.blockbutton_active = "btnTanggapan";
            };
            this.hideandshowTanggapan = function (pesan) {
                pesan.showTanggapiError = false;
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                pesan.tanggapanPesanShow = (pesan.tanggapanPesanShow ? pesan.tanggapanPesanShow = false : pesan.tanggapanPesanShow = true);
                pesan.blockbutton_active = "hideandshowTanggapan";
                //$scope.data = ["tanggapan#" + pesan.id, "", "", "", $scope.limit, pesan.tanggapanPesan.length, $index];
            };
            this.hideandshowSetuju = function (pesan) {
                pesan.showTanggapiError = false;
                pesan.tanggapanPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                pesan.setujuPesanShow = (pesan.setujuPesanShow ? pesan.setujuPesanShow = false : pesan.setujuPesanShow = true);
                pesan.blockbutton_active = "hideandshowSetuju";
                //$scope.data = ["setuju#" + pesan.id, "", "", "", $scope.limit, pesan.tanggapanPesan.length, $index];
            };
            this.hideandshowTidakSetuju = function (pesan) {
                pesan.showTanggapiError = false;
                pesan.tanggapanPesanShow = false;
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = (pesan.tidakSetujuPesanShow ? pesan.tidakSetujuPesanShow = false : pesan.tidakSetujuPesanShow = true);
                pesan.blockbutton_active = "hideandshowTidakSetuju";
                //$scope.data = ["setuju#" + pesan.id, "", "", "", $scope.limit, pesan.tanggapanPesan.length, $index];
            };
            this.isSelected = function (pesan, selected) {
                return pesan.blockbutton_active === selected;
            }
            this.kirimTanggapan = function (selected, pesan, $index) {
                if (pesan.tanggapan.length <= 0) {
                    return;
                }
                pesan.setujuPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#tanggapan#" + pesan.id, "", "", "", "", pesan.tanggapan, "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                selected.callback = function (pesan) {
                    pesan.tanggapanPesanShow = false;
                    context.hideandshowTanggapan(pesan);
                }
                $KawalService.submitMsg($http, selected, $index);
                this.init();
            }
            this.kirimSetuju = function (user, selected, pesan, $index) {
                pesan.showTanggapiError = false;
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                    return;
                }
                pesan.tanggapanPesanShow = false;
                pesan.tidakSetujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#setuju#" + pesan.id, "", "", "", "", "Setuju", "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                selected.callback = function (pesan) {

                }
                $KawalService.submitMsg($http, selected, $index);
                pesan.blockbutton_active = "kirimSetuju";
            }
            this.kirimTidakSetuju = function (user, selected, pesan, $index) {
                pesan.showTanggapiError = false;
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                    return;
                }
                pesan.tanggapanPesanShow = false;
                pesan.setujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#tidaksetuju#" + pesan.id, "", "", "", "", "Tidak Setuju", "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                selected.callback = function (pesan) {

                }
                $KawalService.submitMsg($http, selected, $index);
                pesan.blockbutton_active = "kirimTidakSetuju";
            }
            this.kirimHapus = function (user, selected, pesan, $index) {
                pesan.showTanggapiError = false;
                if (!user.logged) {
                    pesan.showTanggapiError = true;
                    return;
                }
                pesan.tanggapanPesanShow = false;
                pesan.setujuPesanShow = false;
                $KawalService.itemyangsedangdiproses.setKomentar(true);
                selected.data = ["#hide#" + pesan.id, "", "", "", "", "", "", "", 1, 0, pesan.id, pesan.key.raw.name, []];
                selected.callback = function (pesan) {
                    context.pesans.splice($index, 1);
                };
                $KawalService.submitMsg($http, selected, $index);
            };
            this.photoChange = function (selected) {
                this.photos = selected.files;
                for (var i = 0, f; f = this.photos[i]; i++) {
                    if (!f.type.match('image.*')) {
                        continue;
                    }
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            $scope.$apply(function () {
                                context.photosrc = e.target.result;
                                context.showPhoto = true;
                            })
                        };
                    })(f);
                    reader.readAsDataURL(f);
                }
            };
            this.fileChange = function (selected) {
                this.files = selected.files
                var contex = this;
                for (var i = 0, f; f = this.files[i]; i++) {
                    if (!f.type.match('application/pdf')) {
                        continue;
                    }
                    $scope.$apply(function () {
                        contex.filename = f.name;
                        contex.showFile = true;
                    })
                }
                this.showFile = true;
            };
            this.setfileisrequired = function (val) {
                this.fileisrequired = val;
            }
            this.kirimPesan = function () {
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
                this.callback = function (data) {
                    try {
                        angular.forEach(data.kandidatWilayah.kandidat, function (value, key) {
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
            this.getMoredata = function () {
                this.offset = this.pesans.length;
                this.data = [this.pesan, this.filter, this.filterBy, this.cursorStr, this.limit, this.offset];
                $KawalService.getPesans($http, this);
                $KawalService.sendToGa();
            };
            this.login = function (url) {
                var rurl = encodeURIComponent(window.location.hash.substr(1));
                $KawalService.openPopupLogin($http, url + rurl + "&tahun=" + $scope.$parent.$parent.tahun, $scope.$parent.$parent, $window);
            };
            this.setInitPesan();
            this.data = [this.pesan, this.filter, this.filterBy, this.cursorStr, this.limit, this.offset];
            $KawalService.getPesans($http, this);
            $KawalService.sendToGa();
        }]);
})();
