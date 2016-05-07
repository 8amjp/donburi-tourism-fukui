/*
 * 丼ツーリズムマップ in ふくい
 *
 * Copyright 2015 8am.
 * http://8am.jp/
 *
 * 丼ツーリズムマップ
 */

$(function() {
    var map;
    var marker;
    var directionsDisplay;
    var directionsService;
    var infowindow;
    var data = {};
    var list = [];
    var origin = {lat:36.062128, lng:136.223321}; // 福井駅
    var $infowindow = $("<div><h1/><p/></div>").addClass("infowindow");
    $infowindow.find("h1").eq(0).addClass("title");
    $infowindow.find("p").eq(0).addClass("address");
    var $_dt = $("<dt><span><a/></span><span/></dt>");
    $_dt.find("span").eq(0).addClass("title");
    $_dt.find("span").eq(1).addClass("distance");
    var $_dd = $("<dd><p/><img/><p/><p/></dd>");
    $_dd.find("p").eq(0).addClass("subtitle");
    $_dd.find("p").eq(1).addClass("explanation");
    $_dd.find("p").eq(2).addClass("tel");
    $_dd.find("img").eq(0).addClass("photo");

    $(window).on("load orientationchange resize", function() {
        adjust();
    });

    init();

    function adjust() {
        var h = $(window).height() - $("#header").outerHeight();
        $("#map").height(h);
        $("#list").height(h);
    }

    function getData() {
        var deferred = new $.Deferred;
        $.ajax(
            "./json.php",
            {
                dataType: "jsonp",
                jsonpCallback: "donburi_tourism_in_fukui"
            }
        )
        .done(function( json ) {
            data = json;
            deferred.resolve();
        });
        return deferred.promise();
    }

    function setList() {
        $.each( list, function(i, e) {
            e.distance = 6378.137 * Math.acos(Math.sin(origin.lat * Math.PI / 180) * Math.sin(e.lat * Math.PI / 180) + Math.cos(origin.lat * Math.PI / 180) * Math.cos(e.lat * Math.PI / 180) * Math.cos(e.lng * Math.PI / 180 - origin.lng * Math.PI / 180));
        });
        list.sort(function(a, b) {
            return (a.distance < b.distance) ? -1 : 1;
        });
        $("#list").empty();
        var $dl = $("<dl/>");
        $.each( list, function(i, e) {
            var $dt = $_dt.clone();
            var $dd = $_dd.clone().hide();
            $dt.find(".title").text(e.title);
            $dt.find(".distance").text( (e.distance < 1) ? e.distance.toFixed(3) * 1000 + "m" : e.distance.toFixed(3) + "km" );
            $.each( ["subtitle", "explanation", "tel"], function(i, c) {
                $dd.find("." + c).text(e[c]);
            });

            $dt.click(function () {
                var request = {
                    origin:    new google.maps.LatLng(origin.lat, origin.lng),
                    destination:    new google.maps.LatLng(e.lat, e.lng),
                    travelMode: google.maps.TravelMode.WALKING
                };
                directionsService.route(request, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(result);
                    }
                });

                marker = new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(e.lat, e.lng),
                    visible: false
                });

                $.each( ["title", "address"], function(i, c) {
                    $infowindow.find("." + c).text(e[c]);
                });
                infowindow.setContent($infowindow.html());
                infowindow.open(map, marker);

                $dd.find("img").eq(0).attr("src", "//8am.jp/opendata/donburi-tourism-fukui/" + e.id + ".jpg");
                $dd.slideDown();
                $dd.siblings("dd").slideUp();
            });
            $dl.append($dt, $dd);
        });
        $("#list").append($dl);
    }

    function init() {
        getData()
        .done(function() {
            map = new google.maps.Map($("#map")[0], {
                zoom: 8,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer({
                map: map
            });
            infowindow = new google.maps.InfoWindow({
                maxWidth: 300
            });
            $.each( data, function(i, e) {
                switch (e.genre) {
                    case "丼店舗":
                        var marker = new google.maps.Marker({
                            map: map,
                            position: new google.maps.LatLng(e.lat, e.lng)
                        });
                        list.push(e);
                        break;
                    default:
                        break;
                }
            });
            navigator.geolocation.getCurrentPosition( function (p) {
                origin = {lat:p.coords.latitude, lng:p.coords.longitude};
                setList();
            });
            map.setCenter(new google.maps.LatLng(origin.lat, origin.lng)); // 現在位置が取得できればそれを中心に、できなければ福井駅を中心に
        });
        adjust();
    }
});