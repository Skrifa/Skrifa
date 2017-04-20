$_ready(function(){

	// Listener for the submit button
	$_("[data-form='offline-key']").submit(function(event){
		event.preventDefault();
		var self = this;
		// Check if the passphrases match
		if($_("[data-form='offline-key'] input[name='passphrase']").value() == $_("[data-form='offline-key'] input[name='rpassphrase']").value() && $_("[data-form='offline-key'] input[name='passphrase']").value().trim() != ""){

			// Set options for key generation
			var options = {
				userIds: [{
					name:  $_("[data-form='offline-key'] input[name='user']").value().trim().split("@")[0],
					email: $_("[data-form='offline-key'] input[name='user']").value().trim()
				}],
				numBits: 4096,
				passphrase: $_("[data-form='offline-key'] input[name='passphrase']").value()         // protects the private key
			};

			wait("Generating new Key Pair");



			// Generate key
			openpgp.generateKey(options).then(function(key) {
				var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
				var pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '

				var privateKey =  CryptoJS.AES.encrypt(privkey, $_("[data-form='offline-key'] input[name='passphrase']").value()).toString();

				dialog.showSaveDialog(
					{
						title: "Choose Directory to Save your Key",
						buttonLabel: "Save",
						defaultPath: $_("[data-form='offline-key'] input[name='user']").value().trim().split("@")[0] + '.asc'
					},
					function(directory){
						if(directory){

							fs.writeFile(directory, privkey, 'utf8', function (error) {
								if(error){
									dialog.showErrorBox("Error saving your key", "There was an error saving your key, file was not created.");
									show("login");
								}else{
									Storage.set("PubKey", pubkey);
									Storage.set("PrivKey", privateKey);

									// Decrypt the key from CryptoJS
									key = CryptoJS.AES.decrypt(privateKey, $_("[data-form='offline-key'] input[name='passphrase']").value()).toString(CryptoJS.enc.Utf8);
									key = openpgp.key.readArmored(key).keys[0];

									// Decrypt the Key from OpenPGP.js
									key.decrypt($_("[data-form='offline-key'] input[name='passphrase']").value());
									key = key.armor();

									// Set option values for the encryption function
									encryptOptions = {
										publicKeys: openpgp.key.readArmored(Storage.get("PubKey")).keys,
										privateKeys: openpgp.key.readArmored(key).keys
									};

									// Set option values for the decryption function
									decryptOptions = {
										publicKeys:  openpgp.key.readArmored(Storage.get("PubKey")).keys,
										privateKey: openpgp.key.readArmored(key).keys[0]
									};

									privateKey = null;
									self.reset();
									show("notes");
								}
							});

						}
					});
				});
		}else{
			$_("[data-form='offline-key'] [data-content='status']").text("Passphrases does not match");
		}
	});
});
