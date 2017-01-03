$_ready(() => {

	$_("[data-form='share']").submit(function(event){
		event.preventDefault();

		var user = $_("[data-form='share'] input").value().trim();
		var promise = new Promise((resolve, reject) => {
			if(Storage.get(user) != null){
				resolve(Storage.get(user));
			}else{

				Request.json(base + "/key/" + user, {
					onload: function(data){
						if(!data.response.error){
							Storage.set(user, data.response.key);
							resolve(data.response.key);
						}
					},
					error: function(data){

					}
				});
			}
		}).then((shareKey) => {
			var options = {
				publicKeys: openpgp.key.readArmored(Storage.get(shareKey)).keys,
				privateKey: encryptOptions.privateKey
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
		});
	});

	$_("[data-view='share'] [type='reset']").click(function(){
		show("preview");
	});
});

