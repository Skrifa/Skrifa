$_ready(() => {

	// Listener for the submit button
	$_("[data-form='key']").submit(function(event){
		event.preventDefault();
		var self = this;

		// Check if the user is online
		if(navigator.onLine){
			// Check if the passphrases match
			if($_("[data-form='key'] input[name='passphrase']").value() == $_("[data-form='key'] input[name='rpassphrase']").value() && $_("[data-form='key'] input[name='passphrase']").value().trim() != ""){

				if ($_("[data-form='key'] input[name='passphrase']").value().length >= 8) {

					Storage.get("User").then ((user) => {
						// Set options for key generation
						var options = {
							userIds: [{
								name:user.trim().split("@")[0],
								email: user
							}],
							numBits: 4096,
							passphrase: $_("[data-form='key'] input[name='passphrase']").value()         // protects the private key
						};

						wait("Generating new Key Pair");

						// Generate key
						openpgp.generateKey(options).then(function(key) {
							var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
							var pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '

							// Build the data that will be sent to the server
							var inputs = {
								"user": user.trim().split("@")[0],
								// Encrypt the key using CryptoJS
								"key": CryptoJS.AES.encrypt(privkey, $_("[data-form='key'] input[name='passphrase']").value()).toString(),
								"pub": pubkey,
								"password": $_("[data-form='login'] input[name='password']").value()
							};

							var str = [];
							for(var value in inputs){
								str.push(encodeURIComponent(value) + "=" + encodeURIComponent(inputs[value]));
							}

							// Make post request to the server to save the key
							Request.post(base + "/key", str.join("&"), {
								onload: function(data){
									if(typeof data.response.status != 'undefined'){
										// Clear the login form
										$_("[data-form='login'] input[name='password']").value("");
										$_("[data-form='login'] input[name='user']").value("");


										Storage.set("PrivKey", inputs.key);

										// Decrypt the key from CryptoJS
										key = CryptoJS.AES.decrypt(inputs.key, $_("[data-form='key'] input[name='passphrase']").value()).toString(CryptoJS.enc.Utf8);
										key = openpgp.key.readArmored(key).keys[0];

										// Decrypt the Key from OpenPGP.js
										key.decrypt($_("[data-form='key'] input[name='passphrase']").value());
										key = key.armor();

										// Save the keys locally
										Storage.set("PubKey", pubkey).then (({key, value: pubKey}) => {
											// Set option values for the encryption function
											encryptOptions = {
												publicKeys: openpgp.key.readArmored(pubKey).keys,
												privateKeys: openpgp.key.readArmored(key).keys
											};

											// Set option values for the decryption function
											decryptOptions = {
												publicKeys:  openpgp.key.readArmored(pubKey).keys,
												privateKey: openpgp.key.readArmored(key).keys[0]
											};
										});

										self.reset();
										$_("[data-form='key'] [data-content='status']").text("");

										show("notes");

									} else {
										$_("[data-form='key'] [data-content='status']").text("An error has ocurred, please try again.");
										show("key");
									}
								},

								onerror: function(data){
									$_("[data-form='key'] [data-content='status']").text("An error has ocurred, please try again.");
									show("key");
								}

							}, "json");
						});
					});


				} else {
					$_("[data-form='key'] [data-content='status']").text("Passphrase too short, must be at least 8 characters long.");
				}
			} else {
				$_("[data-form='key'] [data-content='status']").text("Passphrases does not match");
			}
		} else {
			$_("[data-form='key'] [data-content='status']").text("You need to be online so that we can save your keys.");
		}

	});
});
