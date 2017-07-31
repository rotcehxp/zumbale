/*Splash Screen Code*/
var provider = new firebase.auth.FacebookAuthProvider();

    var fb_button = document.querySelector("#splash_fb_button");
    fb_button.addEventListener('click', function(e){
		firebase.auth().signInWithPopup(provider).then(function(result) {
	 		// This gives you a Facebook Access Token. You can use it to access the Facebook API.
	  		var token = result.credential.accessToken;
	  		// The signed-in user info.
	  		var user = result.user,
	     		user_name = user.displayName,
	      		user_email = user.email,
	     		user_profile_photo_url = user.photoURL,
	     		user_id = user.uid;
	 		
	 		//Function to write user data
   			function writeUserData(user_id, user_name, user_email, user_profile_photo_url) {
				firebase.database().ref('users/' + user_id).set({
	  				username: user_name,
	   				email: user_email,
	   				profile_picture : user_profile_photo_url
				});
			}

			firebase.database().ref('/users/' + user_id).once('value', function(snapshot){
				if(snapshot.val()!==null){
					console.log("User account have been previously created.");
					$("#splash_background").hide();
				} else {
					writeUserData(user_id, user_name, user_email, user_profile_photo_url);
	 				console.log("User account just have been created.");
	 				//add show another splash
    			}
			});
		});
	}, false);

/*User wall code*/