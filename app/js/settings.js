$_ready(function(){

	$("body").on("click", "[data-action]",function(){
		switch ($_(this).data("action")) {

			case "import-backup":
				dialog.showOpenDialog({
					title: "Restore From Backup",
					buttonLabel: "Restore",
					filters: [
						{name: 'Custom File Type', extensions: ['skrup', 'skb']},
					],
					properties: ['openFile']
				},
				function(file){
					if(file){
						wait("Reading File");
						fs.readFile(file[0], 'utf8', function (error, data) {
							if(error){

							}else{
								var backup = JSON.parse(data);
								var extension = file[0].split(".").pop();

								switch(extension){
									case "skrup":

										switch(backup.Version){
											case 2:
												wait("Clearing Storage");
												db.transaction('rw', db.note, db.notebook, function() {
													db.notebook.clear();
													db.note.clear();

												}).then(function(){
													wait("Encrypting Data From Backup");

													var notebooksTemp = [];
													var notesTemp = [];

													var notebooks = Object.keys(backup.Notebooks).map(function(k) { return backup.Notebooks[k] });
													var promises = notebooks.map(function(notebook) {
														return encrypt(notebook.Name).then(function(ciphertext){
															return encrypt( notebook.Description).then(function(ciphertext2){
																notebook.Name = ciphertext.data;
																notebook.Description = ciphertext2.data;
																notebook.id = parseInt(notebook.id);
																notebooksTemp.push(notebook);
															});
														});
													});

													return Promise.all(promises).then(function() {
														var notes = Object.keys(backup.Notes).map(function(k) { return backup.Notes[k] });
														var promises2 = notes.map(function(note) {
															note.CreationDate = note.CDate;
															note.ModificationDate = note.MDate;
															delete note.CDate;
															delete note.MDate;
															return encrypt(note.Title).then(function(ciphertext){
																note.Content = note.Content.replace(/<img class="lazy" src=/g, "<img data-original=").replace(/data\-url/g, "src");
																return encrypt(note.Content).then(function(ciphertext2){
																	note.Title = ciphertext.data;
																	note.Content = ciphertext2.data;
																	notesTemp.push(note);
																});
															});
														});

														return Promise.all(promises2).then(function() {
															wait("Importing Notebooks and Notes From Backup");

															db.transaction('rw', db.note, db.notebook, function() {
																for(var i in notebooksTemp){
																	db.notebook.add(notebooksTemp[i]);
																}
																for(var j in notesTemp){
																	db.note.add(notesTemp[j]);
																}
															}).then(function(){
																loadContent();
															}).catch(function(error) {

															    dialog.showErrorBox("Error restoring from backup", "There was an error restoring your notes, none where imported.");
																show('settings');

															});

														});
													});
												}).catch(function(error) {

												    dialog.showErrorBox("Error restoring from backup", "There was an error restoring your notes, none where imported.");
													show('settings');

												});

												break;

											default:
												db.transaction('rw', db.note, db.notebook, function() {
													db.notebook.clear();
													db.note.clear();
												}).then(function(){
													wait("Encrypting Data From Backup");
													var options = {
														publicKeys: openpgp.key.readArmored(Storage.get("PubKey")).keys,
														privateKeys: openpgp.key.readArmored(key).keys
													};

													var notesTemp = [];
													var notes = Object.keys(backup).map(function(k) { return backup[k] });
													var promises = notes.map(function(note) {
														note.Notebook = "Inbox";
														note.CreationDate = note.CDate;
														note.ModificationDate = note.MDate;
														delete note.CDate;
														delete note.MDate;
														delete note.id;
														return encrypt(note.Title).then(function(ciphertext){
															note.Content = note.Content.replace(/<img class="lazy" src=/g, "<img data-original=").replace(/data-url/g, "src");
															return encrypt(note.Content).then(function(ciphertext2){
																note.Title = ciphertext.data;
																note.Content = ciphertext2.data;
																notesTemp.push(note);
															});
														});
													});

													return Promise.all(promises).then(function() {
														db.transaction('rw', db.note, function() {
															for(var j in notesTemp){
																db.note.add(notesTemp[j]);
															}
														}).then(function(){
															loadContent();
														}).catch(function(error) {

															dialog.showErrorBox("Error restoring from backup", "There was an error restoring your notes, none where imported.");
															show('settings');

														});
													});
												}).catch(function(error){
													dialog.showErrorBox("Error restoring from backup", "There was an error restoring your notes, none where imported.");
													show('settings');
												});


												break;
										}
										break;

									case "skb":
										wait("Clearing Storage");
										db.transaction('rw', db.note, db.notebook, function() {
											db.notebook.clear().then(function(deleteCount){
												db.note.clear().then(function(deleteCount){
													wait("Importing Notebooks and Notes From Backup");
													for(var i in backup.notebooks){
														if(backup.notebooks[i].id != "Inbox"){
															db.notebook.add({
																id: backup.notebooks[i].id,
																Name: backup.notebooks[i].Name,
																Description: backup.notebooks[i].Description
															});
														}
														for(var j in backup.notebooks[i].notes){
															db.note.add(backup.notebooks[i].notes[j]);
														}
													}
												});
											});
										}).then(function(){
											loadContent();
										}).catch(function(){
											dialog.showErrorBox("Error restoring from backup", "There was an error restoring your notes, none where imported.");
											show('settings');
										});
										break;
								}
							}
						});
					}
				});
				break;

			case "create-backup":
				wait("Building Backup");
				var json = {
					version: 1,
					notebooks: {

					}
				};

				json.notebooks["Inbox"] = {
					id: "Inbox",
					Name: "Inbox",
					Description: "A place for any note",
					notes: []
				}

				db.transaction('r', db.note, db.notebook, function() {

					db.note.where('Notebook').equals("Inbox").each(function(item, cursor){
						json.notebooks["Inbox"].notes.push({
							Title: item.Title,
							Content: item.Content,
							CreationDate: item.CreationDate,
							ModificationDate: item.ModificationDate,
							SyncDate: item.SyncDate,
							Color: item.Color,
							Notebook: item.Notebook,
						});
					});

					db.notebook.each(function(item, cursor){
						json.notebooks[item.id] = {
							id: item.id,
							Name: item.Name,
							Description: item.Description,
							notes: []
						};

						db.note.where('Notebook').equals('' + item.id).each(function(item2, cursor2){
							json.notebooks[item.id].notes.push({
								Title: item2.Title,
								Content: item2.Content,
								CreationDate: item2.CreationDate,
								ModificationDate: item2.ModificationDate,
								SyncDate: item2.SyncDate,
								Color: item2.Color,
								Notebook: item2.Notebook,
							});
						});
					}).then(function(){
						var date = new Date().toLocaleDateString().replace(/\//g, "-");
						dialog.showSaveDialog({
							title: "Choose Directory to Save Backup",
							buttonLabel: "Choose",
							defaultPath: `Skrifa Backup ${date}.skb`
						},
						function(directory){
							if(directory){
								wait("Writing Backup to File");
								fs.writeFile(directory, JSON.stringify(json), 'utf8', function (error) {
									if(error){
										dialog.showErrorBox("Error creating backup", "There was an error creating your backup, file was not created.");
									}else{
										show("notes");
									}
								});
							}else{
								show("notes");
							}
						});
					});

				});
				break;

			case "export-public-key":
				dialog.showSaveDialog(
					{
						title: "Choose Directory to Save your Key",
						buttonLabel: "Save",
						defaultPath: Storage.get("User")+ '-public-key.asc'
					},
					function(directory){
						if(directory){

							fs.writeFile(directory, Storage.get("PubKey"), 'utf8', function (error) {
								if(error){
									dialog.showErrorBox("Error saving your key", "There was an error saving your key, file was not created.");
								}else{
								}
							});

						}
					});
				break;
			case "migrate-backup":
				$_("[data-modal='migrate-backup']").addClass('active');
				break;

		}

	});

	$_("[data-form='settings']").submit(function(event){
		event.preventDefault();
	});

	$_("[data-form='settings'] [type='submit']").click(function(){
		settings.imageCompression = $_("[data-input='imageCompression'] :checked").value();
		Storage.set("settings", JSON.stringify(settings));
		show('notes');
	});

	$_("[data-form='settings'] [type='reset']").click(function(){
		show("notes");
	});

	$_("[data-action='change-theme']").change(function(){
		$("body").removeClass();
		$_("body").addClass($_("[data-action='change-theme'] :checked").value());
		settings.theme = $_("[data-action='change-theme'] :checked").value();
		Storage.set("settings", JSON.stringify(settings));
		styleNote();
	});

	$_("[data-action='change-sort']").change(function(){
		settings.sort = $_("[data-action='change-sort'] :checked").value();
		Storage.set("settings", JSON.stringify(settings));
		loadNotes();
	});

	$_("[data-form='migrate-backup'] [type='reset']").click(function(){
		$_("[data-modal='migrate-backup']").removeClass('active');
	});

	$_("[data-form='migrate-backup']").submit(function(event){
		event.preventDefault();
		try {
		if (openpgp.key.readArmored(CryptoJS.AES.decrypt(Storage.get('PrivKey'), $_("[data-form='migrate-backup'] input[name='passphrase']").value()).toString(CryptoJS.enc.Utf8)).keys.length > 0) {
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
															publicKeys: publicKey,
															privateKeys: encryptOptions.privateKeys
														};
														wait("Building Migration Backup, this operation can take several minutes.");
														var json = {
															version: 1,
															notebooks: {

															}
														};

														json.notebooks["Inbox"] = {
															id: "Inbox",
															Name: "Inbox",
															Description: "A place for any note",
															notes: []
														}

														var promises = [];

														db.transaction('r', db.note, db.notebook, function() {

															promises[0] = db.note.where('Notebook').equals("Inbox").each(function(item, cursor){
																return decrypt(item.Content).then((content) => {
																	return decrypt(item.Title).then((title) => {
																	// Encrypt note content with the user's public key
																		return encrypt(content.data, options).then((content) => {
																			return encrypt(title.data, options).then((title) => {
																				json.notebooks["Inbox"].notes.push({
																					Title: title.data,
																					Content: content.data,
																					CreationDate: item.CreationDate,
																					ModificationDate: item.ModificationDate,
																					SyncDate: item.SyncDate,
																					Color: item.Color,
																					Notebook: item.Notebook,
																				});
																			});
																		});
																	});
																});

															});

															promises[1] = db.notebook.each(function(item, cursor){

																return decrypt(item.Name).then((name) => {
																	return decrypt(item.Description).then((description) => {
																		return encrypt(name.data, options).then((name) => {
																			return encrypt(description.data, options).then((description) => {
																				json.notebooks[item.id] = {
																					id: item.id,
																					Name: name.data,
																					Description: description.data,
																					notes: []
																				};

																				return db.note.where('Notebook').equals('' + item.id).each(function(item2, cursor2){
																					return decrypt(item2.Content).then((content2) => {
																						return decrypt(item2.Title).then((title2) => {
																						// Encrypt note content with the user's public key
																							return encrypt(content2.data, options).then((content2) => {
																								return encrypt(title2.data, options).then((title2) => {
																									json.notebooks[item.id].notes.push({
																										Title: title2.data,
																										Content: content2.data,
																										CreationDate: item2.CreationDate,
																										ModificationDate: item2.ModificationDate,
																										SyncDate: item2.SyncDate,
																										Color: item2.Color,
																										Notebook: item2.Notebook,
																									});
																								});
																							});
																						});
																					});
																				});
																			});
																		});
																	});
																});
															});

															return Dexie.Promise.all(promises);

														}).then(function(){
															var date = new Date().toLocaleDateString().replace(/\//g, "-");
															dialog.showSaveDialog({
																title: "Choose Directory to Save Backup",
																buttonLabel: "Choose",
																defaultPath: `Skrifa Migration Backup ${date}.skb`
															},
															function(directory){
																if(directory){
																	wait("Writing Backup to File");
																	fs.writeFile(directory, JSON.stringify(json), 'utf8', function (error) {
																		if(error){
																			dialog.showErrorBox("Error creating backup", "There was an error creating your backup, file was not created.");
																		}else{
																			show("notes");
																		}
																	});
																}else{
																	show("settings");
																}
															});
														});
													$_("[data-modal='migrate-backup']").removeClass('active');
												} else {
													dialog.showErrorBox("Error parsing Key", "No public key was found, make sure you are trying to share to a public key.");
													show("settings");
												}

											} else {
												dialog.showErrorBox("Error parsing Key", "There was an error reading your key, make sure it is a valid PGP public key.");
												show("settings");
											}

										} catch(e) {
											$_("[data-modal='migrate-backup'] span").text("You must enter a valid key to share this note.");
										}
										break;
									}
								}
							});
						}
					});
				} else {
					dialog.showErrorBox("Error parsing Key", "There was an error reading your key, make sure it is a valid PGP public key.");
					show("settings");
				}
		} catch(e) {
			$_("[data-modal='migrate-backup'] span").text("Incorrect Passphrase.");
		}
	});

});
