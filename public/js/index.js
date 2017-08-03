firebase.auth().onAuthStateChanged(function(user) {
	if(user){
		loggedInState(user);
	}else{
		loggedOutState();
	}
});


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
				visiting_wall_url: wall_url,
 				username: user_name,
   				email: user_email,
   				user_id: user_id,
   				profile_picture : user_profile_photo_url,
   				wall_url: wall_url,
	     		followers_counter: 0,
	     		following_counter: 0,
	     		ice_received_counter: 0,
	     		fire_received_counter: 0,
	     		ice_given_counter: 0,
	     		fire_given_counter: 0
			});
			firebase.database().ref('wall_url_collection/'+wall_url).set({
				user_id: user_id
			});
			firebase.database().ref('messages/'+wall_url).set({
				total_messages_counter: 0
			});
				location.reload();
		}

		firebase.database().ref('/users/' + user_id).once('value', function(snapshot){
			//User login succesfully.
			if(snapshot.val()!=null){
				console.log(user);
				loggedInState(user);

			//User is not registered.
			} else {
				registerState();
				$("#splash_send_button").click(function(){
					var wall_url = $("#splash_input_create_wall_url").val();

					//Wall url validation.
					if(wall_url==''){
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
						firebase.database().ref('wall_url_collection/'+wall_url).once('value', function(snapshot) {

							//Wall url is taken.
    						if(snapshot.val() != null){
    							$("#splash_error_message").replaceWith("<div class=splash_error_message id=splash_error_message>Esa dirección no está disponible. Intente otra.</div>");
								$("#splash_error_message").fadeOut(5000);

    						//Wall url is valid. User account is created.
    						} else if(snapshot.val() == null){
    							writeUserData(wall_url, user_id, user_name, user_email, user_profile_photo_url);
    							loggedInState(user);	
    						}
						});
					}
				});
    		}
		});
	});
}, false);


$("#input_search_wall").on('keyup', function (e) {
    if (e.keyCode == 13) {
    	console.log("HERE B1");
    	var wall_url = $("#input_search_wall").val();
        firebase.database().ref('wall_url_collection/'+wall_url).once('value', function(wall_url_reference) {
			//Wall url is taken.
    		if(wall_url_reference.val()!= null){
    			console.log("HERE B3");
    			var user_loggedin = firebase.auth().currentUser;
    			firebase.database().ref('users/'+user_loggedin.uid).set({
    				visiting_wall_url: wall_url
    			});
    			var user_reference=wall_url_reference.child("user_id").val();
    			firebase.database().ref('users/'+user_reference).once('value', function(user){
    				console.log(user.val());
    				fillWallWithOtherUserData(user.val());
    			});

    		} else{
    			alert("El canal que intenta buscar no existe.");
    		}
		});
    }
});

function loggedInState(user){
    fillWallWithUserData(user);
    $("#splash_request_wall_url").hide();
	$("#splash_login").hide();
}

function loggedOutState(){
	$("#splash_login").show();
	$("#splash_request_wall_url").hide();
}

function registerState(){
  	$("#splash_request_wall_url").show();
	$("#splash_login").hide();
}

function fillWallWithUserData(user){
    firebase.database().ref('users/'+user.uid).once('value', function(snapshot){
    	var username_to_display = snapshot.child('username').val(),
    	    followers_counter_to_display = snapshot.child('following_counter').val(),
    		ice_received_counter_to_display = snapshot.child('ice_received_counter').val(),
    		fire_received_counter_to_display = snapshot.child('fire_received_counter').val(),
    		user_profile_photo_url_to_display = snapshot.child('profile_picture').val(),
    		wall_url_to_display = snapshot.child('wall_url').val();

    	$("#username").replaceWith("<p id=username>"+username_to_display+"</p>");
    	$("#wall_followers_counter_to_display").replaceWith("<p id=wall_followers_counter_to_display>"+followers_counter_to_display+" seguidores</p>");
    	$("#wall_ice_received_counter_to_display").replaceWith("<p id=wall_ice_received_counter_to_display>"+ice_received_counter_to_display+" fríos</p>");
    	$("#wall_fire_received_counter_to_display").replaceWith("<p id=wall_fire_received_counter_to_display>"+fire_received_counter_to_display+" fuegos</p>");
    	$("#profile_picture_to_display").replaceWith("<img id=profile_picture_to_display src="+user_profile_photo_url_to_display+">");
    
    	displayWallMessages(wall_url_to_display);
    });

}

function fillWallWithOtherUserData(user){
	var user_loggedin = firebase.auth().currentUser;
	if(user_loggedin.uid==user.user_id){
		fillWallWithUserData(user_loggedin);
	}else{
		firebase.database().ref('users/'+user.user_id).once('value', function(snapshot){
    	var username_to_display = snapshot.child('username').val(),
    	    followers_counter_to_display = snapshot.child('following_counter').val(),
    		ice_received_counter_to_display = snapshot.child('ice_received_counter').val(),
    		fire_received_counter_to_display = snapshot.child('fire_received_counter').val(),
    		 user_profile_photo_url_to_display = snapshot.child('profile_picture').val();

    	$("#username").replaceWith("<p id=username>"+username_to_display+"</p>");
    	$("#wall_followers_counter_to_display").replaceWith("<p id=wall_followers_counter_to_display>"+followers_counter_to_display+" seguidores</p>");
    	$("#wall_ice_received_counter_to_display").replaceWith("<p id=wall_ice_received_counter_to_display>"+ice_received_counter_to_display+" fríos</p>");
    	$("#wall_fire_received_counter_to_display").replaceWith("<p id=wall_fire_received_counter_to_display>"+fire_received_counter_to_display+" fuegos</p>");
    	$("#profile_picture_to_display").replaceWith("<img id=profile_picture_to_display src="+user_profile_photo_url_to_display+">");
    	});
	}
}

function displayWallMessages(wall_url){
	console.log("HERE");
	firebase.database().ref('messages/'+wall_url).once('value', function(snapshot){
		var total_messages_to_display = snapshot.child('total_messages_counter').val();
		console.log("total messages to display ="+total_messages_to_display);
		var message_to_display, fire_counter_to_display, ice_counter_to_display,
			message_timestamp, message_content_to_display, message_type;
		for(i=total_messages_to_display-1; i>=0; i--){
			message_to_display = "message"+i;
			fire_counter_to_display = snapshot.child(message_to_display).child('fire_counter').val();
			ice_counter_to_display = snapshot.child(message_to_display).child('ice_counter').val();
			message_content_to_display = snapshot.child(message_to_display).child('message_content').val();

			if(fire_counter_to_display>ice_counter_to_display){
				message_type = "fire_message";
			} else if(ice_counter_to_display>fire_counter_to_display){
				message_type = "ice_message";
			} else{
				message_type = "neutral_message"
			}

			$("#wall_content").append("<div class='"+message_type+" message'><p class=message_text>"+message_content_to_display+"</p><div class=message_menu><img class='message_fireandice_icon message_fire_icon' src=img/fire_icon.png><p class=message_score>"+fire_counter_to_display+"</p><img class= 'message_fireandice_icon message_ice_icon' src=img/ice_icon.png><p class=message_score>"+ice_counter_to_display+"</p></div></div>");
		}
	});
}

function postMessage(wall_url){

	firebase.database().ref('messages/'+wall_url).once('value', function(snapshot){
		var total_messages_counter=snapshot.child('total_messages_counter').val();
		console.log("total message counter = "+total_messages_counter);
		var message_content = $("#message_form").val();
		console.log("message content = "+message_content);

		firebase.database().ref('messages/' + wall_url +'/'+'message'+total_messages_counter).set({
			  				fire_counter: 0,
			  				ice_counter: 0,
			  				timestamp: $.now(),
			  				wall_url: wall_url,
			  				message_content: message_content
		});

		console.log("HERE X1");
		firebase.database().ref('messages/' + wall_url).update({
			  				total_messages_counter: total_messages_counter+1
		});

		location.reload();
	});


}

//Check if message is sent
$("#message_send_button").click(function(){
		var user_loggedin = firebase.auth().currentUser;
		firebase.database().ref('users/'+user_loggedin.uid).once('value',function(snapshot){
			postMessage(snapshot.child('visiting_wall_url').val());
		});
});

//Check logout button
$("#logout_button").click(function(){
		console.log("HERE A12");
		firebase.auth().signOut();
		location.reload();
});
