 var app = new Vue({
   el: "#app",
   data: {
     games: [],
     box: [],
     teams: [],
     locations: [],
     filter: [],
     filterLocations: [],
     filterMaps: [],
     teamInfo: [],
     count: 3,
     selected: "All",
     selectedLocation: "AJ Katzenmaier",
     selectedInfo: "U1",
     page: "schedule",
     title: "",
     chat: [],
     user: false,
     userName: "",

   },
   created: function () {

     this.landscape();
     this.getData();
     this.getPosts();
     this.checkUser();

   },

   methods: {

     direct: function (a) {

       for (var i = 0; i < app.teams.length; i++) {
         if (a == app.teams[i].teamLogo && app.page == "schedule" || a == app.teams[i].name && app.page == "schedule") {
           app.teamInfo = [];
           app.teamInfo.push(app.teams[i])
           app.selectedInfo = app.teams[i].name;
           app.page = "information";
         } else if (app.page == "schedule") {
           app.teamInfo = [];
         }
       }

     },

     login: function () {

       var provider = new firebase.auth.GoogleAuthProvider();
       var token, user;
       firebase
         .auth()
         .signInWithPopup(provider)
         .then(res => {
           if (res.user.displayName) {
             token = res.credential.accessToken;
             user = res.user;
             if (token) {
               app.page = "main-chat";
               app.user = true;

             }
             console.log(user.displayName)
           }

         });

       console.log("login");

     },


     logout: function () {

       firebase
         .auth()
         .signOut()
         .then(function () {
           app.page = "chat";
           app.userName = "";
         })
         .catch(function (error) {
           console.log(error)
         });
       console.log("logout");
     },

     checkUser: function () {

       firebase.auth().onAuthStateChanged(function (user) {
         if (user) {
           app.userName = user.displayName;
           app.user = true;
         } else {
           app.user = false;
         }
       });

     },

     checkStatus: function () {

       if (app.user == true) {
         app.page = "main-chat";
       } else {
         app.page = "chat";
       }

     },

     writeNewPost: function () {

       var text = document.getElementById("textInput").value;
       var name = firebase.auth().currentUser.displayName;
       var photo = firebase.auth().currentUser.photoURL;
       var err = document.getElementById("err");
       var date = new Date();

       date = date.toUTCString();

       if (text != "") {
         var message = {
           msg: text,
           user: name,
           image: photo,
           time: date
         }
         err.innerHTML = "";
       } else {
         err.innerHTML = "You cannot send an empty message *";
       }


       firebase
         .database()
         .ref("myChat")
         .push(message)
         .on("value", function () {
           var textInput = document.getElementById("textInput");
           textInput.value = "";
         });

     },

     getPosts: function () {



       firebase
         .database()
         .ref("myChat")
         .on("value", function (data) {

           app.chat = [];
           var messages = data.val();

           for (var key in messages) {
             var everyMessage = messages[key];
             app.chat.push(everyMessage)
           }

         });

     },

     getData: async function () {

       var data =
         await fetch("https://api.myjson.com/bins/m0tr5", {
           method: 'GET',
         })
         .then(response => response.json())
         .then(json => json)
         .catch(err => console.error(err))

       for (var i = 0; i < data.gamesInfo.games.length; i++) {
         app.games.push(data.gamesInfo.games[i]);
         app.filterLocations.push(data.gamesInfo.games[i].location);
         app.locations.push(({
           "location": data.gamesInfo.games[i].location,
           "address": data.gamesInfo.games[i].address,
           "iframe": data.gamesInfo.games[i].iframe
         }));

       }

       for (var j = 0; j < data.teams.length; j++) {
         app.teams.push(data.teams[j]);
       }

       this.sortArrayUniq(app.filterLocations);
       this.hideLoad();
       this.chooseLocation();
       this.filterTeams();
       this.filterInfo();
       this.sortObject(app.locations, "address");

     },

     filterTeams: function () {

       app.filter = [];

       for (var i = 0; i < app.games.length; i++) {
         if (app.selected == "All") {
           app.filter.push(app.games[i]);
         } else {
           if (app.selected == app.games[i].firstTeam || app.selected == app.games[i].SecondTeam) {
             app.filter.push(app.games[i]);
           }

         }
       }
       if (screen.orientation.angle == 0) {
         app.filter = app.filter.slice(0, app.count);
       } else {
         if (app.count == 3) {
           app.count = 4;
           app.filter = app.filter.slice(0, app.count);
         } else {
           app.filter = app.filter.slice(0, app.count);
         }
       }

     },

     chooseLocation: function () {

       app.filterMaps = [];
       for (var i = 0; i < app.locations.length; i++) {

         if (app.selectedLocation == "AJ Katzenmaier") {
           app.filterMaps.push(app.locations[i]);
         } else if (app.selectedLocation == app.locations[i].location) {
           app.filterMaps.push(app.locations[i]);
         }
       }
       app.filterMaps = app.filterMaps.slice(0, 1);
     },

     filterInfo: function () {

       app.teamInfo = [];

       for (var i = 0; i < app.teams.length; i++) {
         if (app.page == "information") {
           if (app.selectedInfo == app.teams[i].name) {
             app.teamInfo.push(app.teams[i]);
           }
         } else {
           if (app.selectedInfo == app.teams[i].name) {
             app.teamInfo.push(app.teams[i]);
           }
         }
       }
     },

     showLess: function () {

       if (screen.orientation.angle == 0) {
         if (app.count != 3) {
           app.count = app.count - 3;
         }
       } else {
         if (app.count > 4) {
           app.count = app.count - 4;
         }

       }

     },

     showMore: function () {

       if (screen.orientation.angle == 0) {
         if (app.count >= 3) {
           app.count = app.count + 3;
         }
       } else {
         app.count = app.count + 4;
       }

     },

     hideLoad: function () {

       var load = document.getElementById("load");
       load.style.display = "none";

     },

     sortArrayUniq: function (arr) {

       arr.sort();
       var last;
       for (var i = 0; i < arr.length; i++)
         if ((last = arr.lastIndexOf(arr[i])) !== i)
           arr.splice(i + 1, last - i);
       return arr;

     },

     sortObject: function (arr, comp) {

       const unique = arr
         .map(e => e[comp])
         .map((e, i, final) => final.indexOf(e) === i && i)
         .filter(e => arr[e]).map(e => arr[e]);
       app.locations = [];
       for (var j = 0; j < unique.length; j++) {
         app.locations.push(unique[j]);
       }

     },

     landscape: function () {

       window.addEventListener("orientationchange", function () {
         if (screen.orientation.angle != 0) {
           if (app.count == 3) {
             app.count = 4;
             app.filterTeams();
           }
         } else if (app.count <= 4) {
           app.count = 3;
           app.filterTeams();
         }
       });

     },

     scrollToBottom: function () {

       setTimeout(function () {
       var element = document.getElementById("content");
       element.scrollTop = element.scrollHeight;
       }, 300);


     },




   }

 })
