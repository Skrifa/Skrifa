$_ready(() => {

	// Listener for the submit button
	$_("[data-form='share']").submit(function(event){
		event.preventDefault();
		var self = this;
		// Get user from the input field
		var user = $_("[data-form='share'] input").value().trim();

		var promise = new Promise((resolve, reject) => {

			// Check if the key of the requested user is already locally stored
			if(Storage.get("pubKey_" + user) != null){
				resolve(Storage.get("pubKey_" + user));
			}else{
				// Check if the user is online
				if(navigator.onLine){
					// Make request to obtain the key of the requested user
					Request.json(base + "/key/" + user, {
						onload: function(data){
							// Check if server returned any error
							if(!data.response.error){
								// Save the key locally
								Storage.set("pubKey_" + user, data.response.key);
								resolve(data.response.key);
							}else{
								reject(data.response.error);
							}
						},
						onerror: function(error){
							reject(error);
						}
					});
				}else{
					reject("Unable to retrieve public key, you must be online.");
				}
			}
		}).then((shareKey) => {

			// Options for encrypting the shared note
			var options = {
				publicKeys: openpgp.key.readArmored(shareKey).keys,
				privateKeys: encryptOptions.privateKeys
			};

			var content;

			// Ask where the note should be saved
			dialog.showSaveDialog({
				title: "Choose Directory to Save the Note",
				buttonLabel: "Save",
				defaultPath: $_("#preview h1").first().text()+ '.' + user + '.skf'
			},
			function(directory){
				if(directory){
					wait("Exporting Note to File");

					db.note.where("id").equals(parseInt(id)).first(function(note){
						delete note.Notebook;
						delete note.SyncDate;
						// Decrypt note content
						decrypt(note.Content).then((plaintext) => {
							note.Content = plaintext.data;
							decrypt(note.Title).then((plaintext2) => {
								note.Title = plaintext2.data;

								// Encrypt note content with the user's public key
								encrypt(note.Content, options).then((cipher) => {
									encrypt(note.Title, options).then((cipher2) => {
										note.Content = cipher.data;
										note.Title = cipher2.data;
										// Write data to file
										fs.writeFile(directory, JSON.stringify(note), 'utf8', function (error) {
											if(error){
												dialog.showErrorBox("Error exporting note", "There was an error exporting the note, file was not created.");
												show("preview");
											}else{
												self.reset();
												$_("[data-view='share'] span").text("");
												show("preview");
											}
										});
									});
								});
							});
						});
					});


				}else{
					self.reset();
					show("preview");
				}
			});
		}).catch(function(error){
			$_("[data-view='share'] span").text(error);
		});
	});

	$_("[data-view='share'] [data-action='pgp-plain']").click(function(){
		dialog.showOpenDialog({
			title: "Select Public Key",
			buttonLabel: "Select",
			filters: [
			    {name: 'Custom File Type', extensions: ['asc']},
			],
			properties: ['openFile']
		},
		function(file){
			if(file){
				wait("Reading File");
				fs.readFile(file[0], 'utf8', function (error, data) {
					if(error){
						dialog.showErrorBox("Error reading file", "There was an error reading the file.");
					}else{
						var extension = file[0].split(".").pop();

						switch(extension){
							case "asc":
								try {
									var publicKey = openpgp.key.readArmored(data).keys;
									if (publicKey.length > 0) {
										if(publicKey[0].isPublic()){
											var options = {
												publicKeys: openpgp.key.readArmored(data).keys,
												privateKeys: encryptOptions.privateKeys
											};

											var content;
											// Ask where the note should be saved

											db.note.where("id").equals(parseInt(id)).first(function(note){
												decrypt(note.Content).then((plaintext) => {
													note.Content = "";
													$(plaintext.data).each(function(){
														if (this.innerText.trim() != "") {
															note.Content += this.innerText + "\n";
														}

													});
													// Encrypt note content with the user's public key
													encrypt(note.Content, options).then((cipher) => {
															$_("[data-view='pgp-message'] [data-content='message']").text(cipher.data);
															show("pgp-message");
													});
												});
											});
										} else {
											dialog.showErrorBox("Error parsing Key", "No public key was found, make sure you are trying to share to a public key.");
											show("share");
										}

									} else {
										dialog.showErrorBox("Error parsing Key", "There was an error reading your key, make sure it is a valid PGP public key.");
										show("share");
									}

								} catch(e) {
									$_("[data-view='share'] span").text("You must enter a valid key to share this note.");
								}
								break;
						}
					}

				});

			}
		});
	});

	$_("[data-view='share'] [data-action='pgp-skrifa']").click(function(){

		dialog.showOpenDialog({
			title: "Select Public Key",
			buttonLabel: "Select",
			filters: [
			    {name: 'Custom File Type', extensions: ['asc']},
			],
			properties: ['openFile']
		},
		function(file){
			if(file){
				wait("Reading File");
				fs.readFile(file[0], 'utf8', function (error, data) {
					if(error){
						dialog.showErrorBox("Error reading file", "There was an error reading the file.");
						show("share");
					}else{
						var extension = file[0].split(".").pop();

						switch(extension){
							case "asc":
								try{
									var publicKey = openpgp.key.readArmored(data).keys;
									if (publicKey.length > 0) {
										if(publicKey[0].isPublic()){
											var options = {
												publicKeys: openpgp.key.readArmored(data).keys,
												privateKeys: encryptOptions.privateKeys
											};

											var content;

											dialog.showSaveDialog({
												title: "Choose Directory to Save the Note",
												buttonLabel: "Save",
												defaultPath:  $_("#preview h1").first().text()+ '.skf'
											},
											function(directory){
												if(directory){
													wait("Exporting Note to File");

													db.note.where("id").equals(parseInt(id)).first(function(note){
														delete note.Notebook;
														delete note.SyncDate;
														// Decrypt note content


															decrypt(note.Content).then((plaintext) => {
																note.Content = plaintext.data;
																decrypt(note.Title).then((plaintext2) => {
																	note.Title = plaintext2.data;

																	// Encrypt note content with the user's public key
																	encrypt(note.Content, options).then((cipher) => {
																		encrypt(note.Title, options).then((cipher2) => {
																			note.Content = cipher.data;
																			note.Title = cipher2.data;
																			// Write data to file
																			fs.writeFile(directory, JSON.stringify(note), 'utf8', function (error) {
																				if(error){
																					dialog.showErrorBox("Error exporting note", "There was an error exporting the note, file was not created.");
																					show("preview");
																				}else{
																					$_("[data-view='share'] span").text("");
																					show("preview");
																				}
																			});
																		});
																	});
																});
															});
													});


												}else{
													show("preview");
												}
											});
										} else {
											dialog.showErrorBox("Error parsing Key", "No public key was found, make sure you are trying to share to a public key.");
											show("share");
										}

									} else {
										dialog.showErrorBox("Error parsing Key", "There was an error reading your key, make sure it is a valid PGP public key.");
										show("share");
									}

								} catch(e) {
									$_("[data-view='share'] span").text("You must enter a valid key to share this note.");
								}
								break;
						}
					}

				});

			}
		});

	});

	// Listener for the cancel button
	$_("[data-view='share'] [type='reset']").click(function(){
		$_("[data-view='share'] span").text("");
		show("preview");
	});
});

