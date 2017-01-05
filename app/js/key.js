$_ready(function(){
	$_("[data-form='key']").submit(function(event){
		event.preventDefault();

		if($_("[data-form='key'] input[name='passphrase']").value() == $_("[data-form='key'] input[name='rpassphrase']").value()){
			var options = {
				userIds: [{
					name: Storage.get("User"),
					email: Storage.get("User") + "@skrifa.xyz"
				}],
				numBits: 4096,
				passphrase: $_("[data-form='key'] input[name='passphrase']").value()         // protects the private key
			};

			wait("Generating new Key Pair");

			openpgp.generateKey(options).then(function(key) {
				var privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
				var pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '

				var inputs = {
					"user": Storage.get("User"),
					"key": CryptoJS.AES.encrypt(privkey, $_("[data-form='key'] input[name='passphrase']").value()).toString(),
					"pub": pubkey,
					"password": $_("[data-form='login'] input[name='password']").value()
				};

				var str = [];
				for(var value in inputs){
					str.push(encodeURIComponent(value) + "=" + encodeURIComponent(inputs[value]));
				}

				Request.post(base + "/key", str.join("&"), {
					onload: function(data){
						if(typeof data.response.status != 'undefined'){
							$_("[data-form='login'] input[name='password']").value("");

							Storage.set("PubKey", pubkey);
							Storage.set("PrivKey", inputs.key);

							key = CryptoJS.AES.decrypt(inputs.key, $_("[data-form='key'] input[name='passphrase']").value()).toString(CryptoJS.enc.Utf8);
							key = openpgp.key.readArmored(key).keys[0];
							key.decrypt($_("[data-form='key'] input[name='passphrase']").value());

							key = key.armor();

							encryptOptions = {
								publicKeys: openpgp.key.readArmored(Storage.get("PubKey")).keys,
								privateKeys: openpgp.key.readArmored(key).keys
							};

							decryptOptions = {
								publicKeys:  openpgp.key.readArmored(Storage.get("PubKey")).keys,
								privateKey: openpgp.key.readArmored(key).keys[0]
							};

							show("notes");

						}else{

						}
					},

					error: function(data){

					}

				}, "json");
			});
		}else{
			$_("[data-form='key'] [data-content='status']").text("Passphrases does not match");
		}
	});
});