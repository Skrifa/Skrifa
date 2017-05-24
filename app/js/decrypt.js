$_ready(() => {

	// Listener for the submit button
	$_("[data-form='decrypt']").submit(function(event){
		event.preventDefault();
		var self = this;

		// Attempt to decrypt and set the key with the passphrase given
		try{
			// Decrypt the key from CryptoJS
			key = CryptoJS.AES.decrypt(Storage.get('PrivKey'), $_("[data-form='decrypt'] input[name='passphrase']").value()).toString(CryptoJS.enc.Utf8);
			key = openpgp.key.readArmored(key).keys[0];

			if (Storage.get("PubKey") == null) {
				Storage.set("PubKey", key.toPublic().armor());
			}

			if (Storage.get("User") == null) {
				Storage.set("User", key.getUserIds()[0].split("<")[1].replace(">", "").trim());
			}

			// Decrypt the Key from OpenPGP.js
			key.decrypt($_("[data-form='decrypt'] input[name='passphrase']").value());
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

			// Load notes and notebooks
			self.reset();
			loadContent();
		}catch(e){
			$_("[data-form='decrypt'] [data-content='status']").text("Incorrect decryption passphrase");
		}
		this.reset();
	});
});
