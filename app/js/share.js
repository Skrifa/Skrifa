$_ready(() => {

	$_("[data-form='share']").submit(function(event){
		event.preventDefault();
		var self = this;
		var user = $_("[data-form='share'] input").value().trim();
		var promise = new Promise((resolve, reject) => {
			if(Storage.get(user) != null){
				resolve(Storage.get(user));
			}else{
				if(navigator.onLine){
					Request.json(base + "/key/" + user, {
						onload: function(data){
							if(!data.response.error){
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
			var options = {
				publicKeys: openpgp.key.readArmored(shareKey).keys,
				privateKeys: encryptOptions.privateKeys
			};

			var content;
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
						decrypt(note.Content).then((plaintext) => {
							note.Content = plaintext.data;
							decrypt(note.Title).then((plaintext2) => {
								note.Title = plaintext2.data;
								encrypt(note.Content, options).then((cipher) => {
									encrypt(note.Title, options).then((cipher2) => {
										note.Content = cipher.data;
										note.Title = cipher2.data;
										fs.writeFile(directory, JSON.stringify(note), 'utf8', function (error) {
											if(error){
												console.log(error);
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

	$_("[data-view='share'] [type='reset']").click(function(){
		$_("[data-view='share'] span").text("");
		show("preview");
	});
});

