$_ready(() => {

	// Login Form Functionality for Skrifa.xyz accounts
	$_("[data-form='login']").submit(function(event) {

		// Prevent the form to reload the page
		event.preventDefault();

		// Get the data from the form
		var inputs = {
			user: $_("[data-form='login'] input[name='user']").value().trim(),
			password: $_("[data-form='login'] input[name='password']").value()
		}

		// Serialize data into a url encoded format
		var str = [];
		for(var value in inputs) {
			str.push(encodeURIComponent(value) + "=" + encodeURIComponent(inputs[value]));
		}
		str = str.join("&");

		// Check if the user is online since it's needed to validate the data
		// and the key must be downloaded from the server
		if (navigator.onLine) {
			wait("Logging In");
			// Make the Post request to the server
			Request.post(`${base}/login`, str,
				{
					onload: function(data) {
						// Check if data was received
						if (data.response != null) {

							// Check if there was not any error
							if (typeof data.response.error == 'undefined') {

								// Save user data to localstorage
								Storage.set("User", data.response.User);
								Storage.set("PubKey", data.response.Public);
								Storage.set("PrivKey", data.response.Secret);

								// Check if a key was received
								if (data.response.Public != null && data.response.Public != "") {
									// Key was received and must be unencrypted
									show("decrypt");
								} else {
									// No key was received meaning that the user
									// has not created one yet, needs to do it
									// for the first time now.
									show("key");
								}
							} else {
								// Show error at login page
								$_("[data-form='login'] [data-content='status']").text(data.response.error);
								show("login");
							}
						} else {
							$_("[data-form='login'] [data-content='status']").text("An error ocurred, please try again.");
							show("login");
						}
					},
					error: function(error) {
						console.log(error);
						show("login");
					}
				}, "json"
			);
		} else {
			$_("[data-form='login'] [data-content='status']").text("You must be online to log in.");
		}
	});

	$_("[data-form='local-key']").submit(function(event) {
		event.preventDefault();
	});

	$_("[data-view='login'] [data-action='new-offline-key']").click(function() {
		show("offline-key");
	});

	// Import a previously owned PGP key, can be pretty much any PGP key created
	// with any other software, it must be in an asc file and armored.
	$_("[data-view='login'] [data-action='import-offline-key']").click(function() {

		dialog.showOpenDialog(
			{
				title: "Import Your Key",
				buttonLabel: "Import",
				filters: [
					// skk file extension is saved for the future and may be removed
					{name: 'Custom File Type', extensions: ['skk', 'asc']},
				],
				properties: ['openFile']
			},
			function(file) {
				if (file) {
					wait("Reading Key File");
					fs.readFile(file[0], 'utf8', function (error, data) {
						if (error) {
							dialog.showErrorBox("Error reading file", "There was an error reading the file, key was not imported.");
							show("login");
						} else {
							var extension = file[0].split(".").pop();

							// Check the extension of the imported key file
							switch(extension) {

								// skk files contain keys in an encrypted manner so
								// once saved, it just needs to be decrypted to use.
								case "skk":
									Storage.set("PrivKey", data);
									show("decrypt");
									break;

								// asc files are probably a PGP key created by other
								// application, they must be encrypted to be saved
								// in the Indexed DB
								case "asc":
									var importedKey = openpgp.key.readArmored(data).keys;

									// Check if the file actually had a key
									if (importedKey.length > 0) {

										// Check if the key is a private one and not
										// just a public key or a message.
										if (importedKey[0].isPrivate()) {
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
			}
		);
	});
});
