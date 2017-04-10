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

		// Check if the user is online
		if(navigator.onLine){
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
						show("login");
					}
				}, "json"
			);
		}else{
			$_("[data-form='login'] [data-content='status']").text("You must be online to login.");
		}

	});

	$_("[data-form='local-key']").submit(function(event){
		event.preventDefault();
	});

	$_("[data-view='login'] [data-action='new-offline-key']").click(function(){
		show("offline-key");
	});

	$_("[data-view='login'] [data-action='import-offline-key']").click(function(){
		dialog.showOpenDialog({
			title: "Import Your Key",
			buttonLabel: "Import",
			filters: [
			    {name: 'Custom File Type', extensions: ['skk', 'asc']},
			],
			properties: ['openFile']
		},
		function(file){
			if(file){
				wait("Reading Key File");
				fs.readFile(file[0], 'utf8', function (error, data) {
					if(error){
						dialog.showErrorBox("Error reading file", "There was an error reading the file, key was not imported.");
						show("login");
					}else{
						var extension = file[0].split(".").pop();

						switch(extension){
							case "skk":
								Storage.set("PrivKey", data);
								show("decrypt");
								break;
							case "asc":
								var importedKey = openpgp.key.readArmored(data).keys;
								if (importedKey.length > 0) {
									if(importedKey[0].isPrivate()){
										Storage.set("TempKey", data);
										show("encrypt-key");
									} else {
										dialog.showErrorBox("Error parsing Key", "No private key was found, make sure you are trying to import a private key.");
										show("login");
									}

								} else {
									dialog.showErrorBox("Error parsing Key", "There was an error reading your key, make sure it is a valid PGP key to import it.");
									show("login");
								}
								break;
						}
					}

				});

			}
		});
	});

});
