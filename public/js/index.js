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
   			function writeUserData(wall_url, user_id, user_name, user_email, user_profile_photo_url) {
				firebase.database().ref('users/' + user_id).set({
	  				username: user_name,
	   				email: user_email,
	   				profile_picture : user_profile_photo_url,
	   				wall_url: wall_url
				});
				firebase.database().ref('wall_url_collection/'+wall_url).set({
					user_id: user_id
				});
			}

			firebase.database().ref('/users/' + user_id).once('value', function(snapshot){
				console.log("HERE A1");
				//User login succesfully.
				if(snapshot.val()!=null){
					console.log("HERE A2");
					$("#splash_request_wall_url").hide();
					$("#splash_login").hide();
				} else {
					console.log("HERE A3");
					//User is not registered.
					$("#splash_login").hide();
					$("#splash_send_button").click(function(){
						console.log("HERE A4");
						var wall_url = $("#splash_input_create_wall_url").val();
						//User do not entered a wall url.
						if(wall_url==''){
							console.log("HERE A5");
							$("#splash_error_message").replaceWith("<div class=splash_error_message id=splash_error_message>No has ingresado una dirección para tu muro.</div>");
							$("#splash_error_message").fadeOut(5000);
						} else if((/^[a-zA-Z0-9]*$/.test(wall_url) == false)||wall_url.indexOf(' ') >= 0){
							$("#splash_error_message").replaceWith("<div class=splash_error_message id=splash_error_message>No puedes usar caracteres especiales o espacios.</div>");
							$("#splash_error_message").fadeOut(5000);
						}else if(wall_url.length>15){
							$("#splash_error_message").replaceWith("<div class=splash_error_message id=splash_error_message>No puedes usar más de 15 caracteres.</div>");
							$("#splash_error_message").fadeOut(5000);
						}else if(wall_url.length<4){
							$("#splash_error_message").replaceWith("<div class=splash_error_message id=splash_error_message>No puedes usar menos de 4 caracteres.</div>");
							$("#splash_error_message").fadeOut(5000);
						}else{
							console.log("HERE A6");
							firebase.database().ref('wall_url_collection/'+wall_url).once('value', function(snapshot) {
								//Wall url is taken.
    							if(snapshot.val() != null){
    								console.log("HERE A7");
    								$("#splash_error_message").replaceWith("<div class=splash_error_message id=splash_error_message>Esa dirección no está disponible. Intente otra.</div>");
									$("#splash_error_message").fadeOut(5000);
    							} else if(snapshot.val() == null){
    								console.log("HERE A8");
    								//Wall url is valid. User account is created.
    								writeUserData(wall_url, user_id, user_name, user_email, user_profile_photo_url);
    								$("#splash_request_wall_url").hide();		
    							}
							});
						}
					});
    			}
			});
		});
	}, false);

/*User wall code*/

