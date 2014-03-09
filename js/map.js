(function(){


    var forEach = Array.prototype.forEach;

    //elements
    var mapEl = document.getElementById('map-canvas'),
    nameEl = document.getElementById('name'),
    messageEl = document.getElementById('message'),
    scrollBtnEl = document.getElementById('scrollBtn'),
    addBtnEl = document.getElementById('addBtn'),
    userListEl = document.getElementById('user-list');

    var map,
        markers = [],
        mapOptions = {
          center: new google.maps.LatLng(42.9876432, -81.2516959),
          zoom: 15
        };


    /* Event handlers for Firebase endpoints*/
    var firebaseHandlers = {
        root:'https://info3069-map.firebaseio.com/',
        connect: function(snapshot) {
            var name = snapshot.name(),
                loc = snapshot.val();

            //create marker, add to map.
            userListEl.appendChild(createUserListNode(name));
            createUserMarker(name,loc);
            console.log('name: '+ name + ' lat: ' + loc.lat + ' long:' +loc.lon + ' msg: '+loc.msg);
        },
        remove: function(snapshot) {
            var name = snapshot.name(),
                loc = snapshot.val();
            removeUserListNode(name);
            removeUserMarker(name,loc);
        },
        add: function(name,pos,msg) {
            var ref = new Firebase(this.root+'people/'+nameEl.value+'/');
            ref.child('lat').set(pos.latitude);
            ref.child('lon').set(pos.longitude);
            ref.child('msg').set(msg);
        }
    };


    /* Adds a user to the user list on connect*/
    function createUserListNode(name) {
        var nameEl = document.createElement('li');
        nameEl.innerText = name;
        return nameEl;
    }

    /* Adds users marker to map on connect */
    function createUserMarker(name, pos) {
        var position = new google.maps.LatLng(pos.lat, pos.lon)
        markers.push(new google.maps.Marker({
            position:position,
            map:map,
          }));
    }

    //remove all markers from the map
    function clearMarkers() {
      for(var i=0;i < markers.length;i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }

    /* Removes a user from list on disconnect */
    function removeUserListNode(name) {
        forEach.call(userListEl.children,function(el) {
            if(el.innerText === name)
                userListEl.removeChild(el);
        });
    }


    /*Remove users marker from map on disconnect*/
    function removeUserMarker(name,pos) {
        forEach.call(markers,function(el,i){
            //d = lat e = long
            var ep = el.position;
            if(ep.d === pos.lat && ep.e === pos.lon) {
                console.log('found!');
                el.setMap(null);
                markers.splice(i,1);
            }
            console.log('name: '+ name + ' pos: ' + el.position);
        });
    }



    //helper function to only allow the add button to be pressed once.
    function once(fn) {
        var o=true;
        return function() {
            (o) ? (o=false,fn.call(arguments)): void 0;
        };
    }

    //Get current geolocation
    function geolocation() {

      if(nameEl.value === '' || messageEl.value === '') return;
      scrollBtnEl.classList.add('disabled');
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var currentLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
          console.log(position);

          //add user to firebase
          firebaseHandlers.add(nameEl.value,position.coords,messageEl.value);

          //add marker
          map.setCenter(currentLocation);
        },null);
      }
    }

    function mapInit(el,options) {
        return function() {
            map = new google.maps.Map(el,options);
            /* Create firebase for people data */
            var peopleRef = new Firebase(firebaseHandlers.root + '/people');
            peopleRef.on('child_added',firebaseHandlers.connect);
            peopleRef.on('child_removed',firebaseHandlers.remove);

        };
    }

    function scrollButtonClick(e){
        window.scrollTo(0,340);
    }

    //events
    google.maps.event.addDomListener(window, 'load',mapInit(mapEl,mapOptions));
    scrollBtnEl.addEventListener('click',scrollButtonClick);
    addBtnEl.addEventListener('click',once(geolocation));
}).call(this);
