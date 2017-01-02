/**
 * Login Form Functionality
 */

$_ready(function(){
	$_("[data-form='login']").submit(function(event){

		// Prevent the form to reload the page
		event.preventDefault();

		// Get the data from the form
		var inputs = {
			user: $_("[data-form='login'] input[name='user']").value(),
			password: $_("[data-form='login'] input[name='password']").value()
		}

		// Serialize data into a url encoded format
		var str = [];
        for(var value in inputs){
			str.push(encodeURIComponent(value) + "=" + encodeURIComponent(inputs[value]));
		}
		str = str.join("&");

		// Show loading screen while the request is done
		$("[data-view]").removeClass("active");
		$("[data-view='loading']").addClass("active");

		wait("Logging In");

		// Make the Post request to the server
		Request.post(base + "/login", str,
			{
				onload: function(data){
					// Check if data was received
					if(data.response != null){

						// Check if there was not any error
						if(typeof data.response.error == 'undefined'){

							// Save user data to localstorage
							Storage.set("User", data.response.User);
							Storage.set("PubKey", data.response.Public);
							Storage.set("PrivKey", data.response.Secret);
							logged = true;

							// Check if a key was received
							if(data.response.Public != null){
								show("decrypt");
							}else{
								show("key");
							}
						}else{
							// Show error at login page
							$_("[data-form='login'] [data-content='status']").text(data.response.error);
							show("login");
						}

					}
				},
				error: function(error){
					console.log(error);
				}
			}, "json"
		);
	});
});