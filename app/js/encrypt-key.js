$_ready(function(){

	// Listener for the submit button
	$_("[data-form='encrypt-key']").submit(function(event){
		event.preventDefault();
		var self = this;
		// Check if the passphrases match
		if($_("[data-form='encrypt-key'] input[name='passphrase']").value() == $_("[data-form='encrypt-key'] input[name='rpassphrase']").value() && $_("[data-form='encrypt-key'] input[name='passphrase']").value().trim() != ""){

			// Set options for key generation
			wait("Saving your key securely");

			key = openpgp.key.readArmored(Storage.get("TempKey")).keys[0];

			if(key.decrypt($_("[data-form='encrypt-key'] input[name='passphrase']").value())) {

				Storage.set("PrivKey", CryptoJS.AES.encrypt(key.armor(), $_("[data-form='encrypt-key'] input[name='passphrase']").value()).toString());


				Storage.remove ("TempKey");

				if (Storage.get("PubKey") == null) {
					Storage.set("PubKey", key.toPublic().armor());
				}

				if (Storage.get("User") == null) {
					Storage.set("User", key.getUserIds()[0].split("<")[0].trim());
				}

				// Decrypt the key from CryptoJS
				key = CryptoJS.AES.decrypt(Storage.get("PrivKey"), $_("[data-form='encrypt-key'] input[name='passphrase']").value()).toString(CryptoJS.enc.Utf8);
				key = openpgp.key.readArmored(key).keys[0];

				// Decrypt the Key from OpenPGP.js
				key.decrypt($_("[data-form='encrypt-key'] input[name='passphrase']").value());
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
				self.reset();
				show("notes");

			} else {
				$_("[data-form='encrypt-key'] [data-content='status']").text("Wrong Passphrase for Key");
				show("encrypt-key");
			}


		}else{
			$_("[data-form='offline-key'] [data-content='status']").text("Passphrases does not match");
		}
	});

	$_("[data-view='encrypt-key'] [type='reset']").click(function(){
		show("login");
	});
});
