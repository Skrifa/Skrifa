$_ready(function(){
	$_("[data-form='decrypt']").submit(function(event){
		event.preventDefault();
		$_("[data-form='login'] input[name='password']").value("");

		try{
			key = CryptoJS.AES.decrypt(Storage.get('PrivKey'), $_("[data-form='decrypt'] input[name='passphrase']").value()).toString(CryptoJS.enc.Utf8);
			key = openpgp.key.readArmored(key).keys[0];



			key.decrypt($_("[data-form='decrypt'] input[name='passphrase']").value());
			key = key.armor();

			encryptOptions = {
				publicKeys: openpgp.key.readArmored(Storage.get("PubKey")).keys,
				privateKey: openpgp.key.readArmored(key).keys
			};

			decryptOptions = {
				publicKeys:  openpgp.key.readArmored(Storage.get("PubKey")).keys,
				privateKey: openpgp.key.readArmored(key).keys[0]
			};

			loadContent();
		}catch(e){
			$_("[data-form='decrypt'] [data-content='status']").text("Incorrect decryption passphrase");
		}

		$_("[data-form='decrypt'] input[name='passphrase']").value("");

	});
});