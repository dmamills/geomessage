var app = angular.module("geomsg", ["firebase"]);
app.controller('GeoCtrl',function($scope,$firebase) {

    /* Google map stuff */
    var mapEl = document.getElementById('map-canvas'),
        map,marker,infoBox,
        mapOptions = {
          center: new google.maps.LatLng(42.9876432, -81.2516959),
          zoom: 15
        };

    google.maps.event.addDomListener(window, 'load',function(){
        map = new google.maps.Map(mapEl,mapOptions);
    });

    var ref = 'https://info3069-map.firebaseio.com/';
    $scope.people = $firebase(new Firebase(ref));
    $scope.nick = '';
    $scope.msg = '';
    $scope.number = 0;

    /* Event for when a person's name is clicked*/
    $scope.userClick = function(idx) {

        //clear marker and infobox
        if(marker) marker.setMap(null);
        if(infoBox) infoBox = null;

        //get person and their information
        var person = $scope.people.$getIndex(idx)[idx];
        var p = $scope.people[person];

        //add new marker
        var latLng = new google.maps.LatLng(p.lat,p.lon);
        marker = new google.maps.Marker({
            position:latLng,
            map:map,
        });

        //create info box
        infoBox = new google.maps.InfoWindow({
          content:'<div class="info-wrap"><div class="head"><h1>'+p.nick+'</h1></div><div class="content"><p>'+p.msg+'</p></div></div>'
        });

        //zoom to marker
        map.setCenter(latLng);
        infoBox.open(map,marker);
    };

    /* Add a person's geomessage */
    $scope.add = function() {
        if($scope.nick === '' && $scope.msg === '') return;
        if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var currentLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

            //add user to firebase
            $scope.people.$add({ nick:$scope.nick,
                                 msg:$scope.msg,
                                 lat:position.coords.latitude,
                                 lon:position.coords.longitude
                              });
            //add marker
            map.setCenter(currentLocation);
          },null);
        }
    };

    $scope.top = function() { window.scrollTo(0,0); };
});
