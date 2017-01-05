$_ready(function(){
	$("body").on("click", "[data-action]",function(){
		switch ($_(this).data("action")) {

			case "print":
				window.print();
				break;

			case "export":
				show("export-note");
				break;

			case "share":
				show("share");
				break;
		}
	});


	$("[data-form='export-note']").submit(function(event){
		event.preventDefault();
		var extension = $_("[data-form='export-note'] input[type='radio']:checked").value();
		dialog.showSaveDialog({
			title: "Choose Directory to Export Note",
			buttonLabel: "Export",
			defaultPath: $_("#preview h1").first().text()+'.'+extension
		},
		function(directory){
			if(directory){
				wait("Exporting Note to File");

				var content = '';
				switch(extension){
					case "skf":
						var promise = db.note.where("id").equals(parseInt(id)).first(function(note){
							delete note.Notebook;
							delete note.SyncDate;
							delete note.id;
							content = JSON.stringify(note);
						}).then(function(){
							fs.writeFile(directory, content, 'utf8', function (error) {
								if(error){
									console.log(error);
								}else{
									show("preview");
								}
							});
						});
						break;

					case "skrifa":
						db.note.where("id").equals(parseInt(id)).first(function(note){
							decrypt(note.Content).then((plaintext) => {
								note.Content = plaintext.data;
								note.MDate = note.ModificationDate;
								note.CDate = note.CreationDate;
								delete note.Notebook;
								delete note.SyncDate;
								delete note.CreationDate;
								delete note.ModificationDate;
								delete note.id;
								note.Title = $_("#preview h1").first().text().trim() != "" ? $_("#preview h1").first().text() : "Untitled";
								content = JSON.stringify(note);
								fs.writeFile(directory, content, 'utf8', function (error) {
									if(error){
										console.log(error);
									}else{
										show("preview");
									}
								});
							});
						});
						break;

					case "pdf":
						htmlBoilerplatePDF({cssPath: "../../style/pdf.css"}).from.string($_("#preview").html()).to(directory, function () {
							show("preview");
						});
						break;

					case "md":
						db.note.where("id").equals(parseInt(id)).first(function(note){
							decrypt(note.Content).then((plaintext) => {
								var und = new upndown();
								und.convert(plaintext.data, function(error, markdown) {
									if(!error){
										fs.writeFile(directory, markdown, 'utf8', function (error) {
											if(error){
												console.log(error);
											}else{
												show("preview");
											}
										});
									}
								});
							});
						});

						break;
				}


			}else{
				show("preview");
			}
		});
	});

	$_("[data-view='export-note'] [type='reset']").click(function(){
		show("preview");
	});

});


