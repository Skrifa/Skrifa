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

		}

	});

	$_("[data-form='settings']").submit(function(event){
		event.preventDefault();
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
	});

});