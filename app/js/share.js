$_ready(() => {

	// Listener for the submit button
	$_("[data-form='share']").submit(function(event){
		event.preventDefault();
		var self = this;
		// Get user from the input field
		var user = $_("[data-form='share'] input").value().trim();

		var promise = new Promise((resolve, reject) => {

			// Check if the key of the requested user is already locally stored
			if(Storage.get(user) != null){
				resolve(Storage.get(user));
			}else{
				// Check if the user is online
				if(navigator.onLine){
					// Make request to obtain the key of the requested user
					Request.json(base + "/key/" + user, {
						onload: function(data){
							// Check if server returned any error
							if(!data.response.error){
								// Save the key locally
								Storage.set(user, data.response.key);
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
					show("preview");
				}
			});
		}).catch(function(error){
			$_("[data-view='share'] span").text(error);
		});
	});

	// Listener for the cancel button
	$_("[data-view='share'] [type='reset']").click(function(){
		$_("[data-view='share'] span").text("");
		show("preview");
	});
});

