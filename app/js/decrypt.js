$_ready(() => {

	// Listener for the submit button
	$_("[data-form='decrypt']").submit(function(event){
		event.preventDefault();

		// Decrypt the key from CryptoJS
		Storage.get ('PrivKey').then ((privKey) => {

				// Attempt to decrypt and set the key with the passphrase given
				try {
					key = CryptoJS.AES.decrypt(privKey, $_("[data-form='decrypt'] input[name='passphrase']").value ()).toString (CryptoJS.enc.Utf8);
					key = openpgp.key.readArmored (key).keys[0];

					Storage.get("PubKey").then ((pubKey) => {

						// Decrypt the Key from OpenPGP.js
						key.decrypt($_("[data-form='decrypt'] input[name='passphrase']").value());
						key = key.armor();


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
						// Load notes and notebooks
						this.reset();
						loadContent();
					}).catch ((e) => {
						Storage.set ("PubKey", key.toPublic().armor()).then (({key, value}) => {
							// Decrypt the Key from OpenPGP.js
							key.decrypt($_("[data-form='decrypt'] input[name='passphrase']").value());
							key = key.armor();


							// Set option values for the encryption function
							encryptOptions = {
								publicKeys: openpgp.key.readArmored(value).keys,
								privateKeys: openpgp.key.readArmored(key).keys
							};

							// Set option values for the decryption function
							decryptOptions = {
								publicKeys:  openpgp.key.readArmored(value).keys,
								privateKey: openpgp.key.readArmored(key).keys[0]
							};
							// Load notes and notebooks
							this.reset();
							loadContent();
						});
					});

					Storage.get("User").catch (() => {
						Storage.set ("User", key.getUserIds()[0].split("<")[1].replace(">", "").trim());
					});

					// Clear the login form
					$_("[data-form='login'] input[name='password']").value("");
					$_("[data-form='login'] input[name='user']").value("");
			} catch (e) {
				$_("[data-form='decrypt'] [data-content='status']").text("Incorrect decryption passphrase");
				this.reset ();
			}
		});
	});
});
