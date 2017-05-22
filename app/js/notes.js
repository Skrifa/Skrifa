$_ready(() => {

	$("body").on("click", "[data-action]",function(){
		switch ($_(this).data("action")) {

			case "settings":
				show("settings");
				break;

			case "new-notebook":
				show("new-notebook");
				break;

			case "delete":
				deltempid = $_(this).data("id");
				$_("[data-modal='delete-note']").addClass("active");
				break;

			case "update":
				shell.openExternal("https://skrifa.xyz/#Download");
				break;

			case "edit-notebook":
				$_("[data-form='edit-notebook'] [data-input='name']").value($_('.logo h1').text()),
				$_("[data-form='edit-notebook'] [data-input='description']").value($_('.logo small').text())
				show("edit-notebook");
				break;

			case "delete-notebook":
				show("delete-notebook");
				break;

			case "new-note":
				wait("Wait while your note is created");
				var date = new Date().toLocaleString();

				encrypt("New Note").then(function(ciphertext) {
					encrypt('<h1>New Note</h1>').then(function(ciphertext2) {
						var color = colors[Math.floor(Math.random()*colors.length)];
						db.note.add({
							Title: ciphertext.data,
							Content: ciphertext2.data,
							CreationDate: date,
							ModificationDate: date,
							SyncDate: "",
							Color: color,
							Notebook: notebook
						}).then(function(lastID){
							addNote(lastID, "New Note", color);
							show('notes');
						});
					});
				});
				break;

			case "change-view":
				if($_(this).hasClass("fa-th")){
					$("[data-content='note-container']").removeClass("grid");
					$_("[data-content='note-container']").addClass("list");
					Storage.set('view', "list");
				}else{
					$_("[data-content='note-container']").removeClass("list");
					$_("[data-content='note-container']").addClass("grid");
					Storage.set('view', "grid");
				}
				$_(this).toggleClass("fa-th fa-th-list");
				//loadNotes();
				break;

			// Shows the edit screen of a note.
			case "edit":
				wait("Wait while your note content is decripted");
				if(id == null){
					id = $_(this).data("id");
				}
				db.note.where(":id").equals(parseInt(id)).first().then(function (note) {
					decrypt(note.Content).then(function(plaintext) {
						$_("#editor").html(plaintext.data);
						currentContent = plaintext.data;
						show("editor")
					});
				});
				break;

			case "preview":
				if(unsaved){
					$_("[data-form='unsaved'] input").value('preview');
					$_("[data-modal='unsaved']").addClass('active');
				}else{
					wait("Wait while your note content is decripted");

					if(id == null){
						id = $_(this).data("id");
						currentContent = null;
					}

					db.note.where(":id").equals(parseInt(id)).first().then(function (note) {

						decrypt(note.Content).then(function(plaintext) {
							$_("#preview").html(plaintext.data);
							Prism.highlightAll(true, null);
							(function(){
								if (!self.Prism) {
									return;
								}
								Prism.hooks.add('wrap', function(env) {
									if (env.type !== "keyword") {
										return;
									}
									env.classes.push('keyword-' + env.content);
								});
							})();

							MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
							show("preview")
						});
					});
				}
				break;

			case "import-note":
				dialog.showOpenDialog({
					title: "Import a Note",
					buttonLabel: "Import",
					filters: [
					    {name: 'Custom File Type', extensions: ['skrifa', 'skf', 'md', 'txt', 'html', 'docx', 'skn', 'asc']},
					],
					properties: ['openFile']
				},
				function(file){
					if(file){
						wait("Reading File");
						fs.readFile(file[0], 'utf8', function (error, data) {
							if(error){
								dialog.showErrorBox("Error reading file", "There was an error reading the file, note was not imported.");
								show("notes");
							}else{
								var extension = file[0].split(".").pop();

								switch(extension){
									case "md":
										var md = new MarkdownIt();
										var html = md.render(data);
										var date = new Date().toLocaleString();
										var h1 = $(html).filter("h1").text().trim();
										h1 = h1 != "" ? h1: 'Imported Note';
										if(h1 && html && date){
											wait("Importing New Note");

											encrypt(h1).then(function(ciphertext) {

												encrypt(html).then(function(ciphertext2) {
													var color = colors[Math.floor(Math.random()*colors.length)];
													db.note.add({
														Title: ciphertext.data,
														Content: ciphertext2.data,
														CreationDate: date,
														ModificationDate: date,
														SyncDate: '',
														Color: color,
														Notebook: notebook
													}).then(function(lastID){
														addNote(lastID, h1, color);
														show('notes');
													});
												});

											});
										}else{
											show("notes");
										}
										break;

									case "docx":
										mammoth.convertToHtml({path: file[0]}).then(function(result){
											var html = result.value; // The generated HTML
											var messages = result.messages; // Any messages, such as warnings during conversion
											var date = new Date().toLocaleString();
											var h1 = $(html).filter("h1").text().trim();
											h1 = h1 != "" ? h1: 'Imported Note';
											if(h1 && html && date){
												wait("Importing New Note");

												encrypt(h1).then(function(ciphertext) {

													encrypt(html).then(function(ciphertext2) {
														var color = colors[Math.floor(Math.random()*colors.length)];
														db.note.add({
															Title: ciphertext.data,
															Content: ciphertext2.data,
															CreationDate: date,
															ModificationDate: date,
															SyncDate: '',
															Color: color,
															Notebook: notebook
														}).then(function(lastID){
															addNote(lastID, h1, color);
															show('notes');
														});
													});

												});
											}else{
												show("notes");
											}

										}).done();
										break;

									case "skrifa":
										var json = JSON.parse(data);
										if(json.Title && json.Content && json.CDate && json.MDate && json.Color){

											wait("Importing New Note");
											var date = new Date().toLocaleString();

											encrypt(json.Title).then(function(ciphertext) {
												json.Content = json.Content.replace(/<img class="lazy" src=/g, "<img data-original=").replace(/data-url/g, "src");
												encrypt(json.Content).then(function(ciphertext2) {
													db.note.add({
														Title: ciphertext.data,
														Content: ciphertext2.data,
														CreationDate: json.CDate,
														ModificationDate: date,
														SyncDate: '',
														Color: json.Color,
														Notebook: notebook
													}).then(function(lastID){
														addNote(lastID, json.Title, json.Color);
														show('notes');
													});
												});

											});
										}

										break;
									case "skf":
										var json = JSON.parse(data);
										if(json.Title && json.Content && json.CreationDate && json.ModificationDate && json.Color){
											wait("Importing New Note");
											var date = new Date().toLocaleString();
											decrypt(json.Title).then((plaintext) => {
												db.note.add({
													Title: json.Title,
													Content: json.Content,
													CreationDate: json.CreationDate,
													ModificationDate: date,
													SyncDate: '',
													Color: json.Color,
													Notebook: notebook
												}).then(function(lastID){
													addNote(lastID, plaintext.data, json.Color);
													show('notes');
												});
											}).catch((error) => {
												dialog.showErrorBox("Error decrypting your note", "There was an error decrypting your note, it was not imported.");
												show('notes');
											});
										}
										break;

									case "txt":
										var date = new Date().toLocaleString();
										wait("Importing New Note");
										encrypt("Imported Note").then(function(ciphertext) {

											var regex = /.*\n/g;
											var html = "";

											while ((m = regex.exec(data)) !== null) {
											    // This is necessary to avoid infinite loops with zero-width matches
											    if (m.index === regex.lastIndex) {
											        regex.lastIndex++;
											    }

											    // The result can be accessed through the `m`-variable.
											    m.forEach((match, groupIndex) => {
													html += `<p>${match}</p>`
											    });
											}

											encrypt(html).then(function(ciphertext2) {
												var color = colors[Math.floor(Math.random()*colors.length)];
												db.note.add({
													Title: ciphertext.data,
													Content: ciphertext2.data,
													CreationDate: date,
													ModificationDate: date,
													SyncDate: '',
													Color: color,
													Notebook: notebook
												}).then(function(lastID){
													addNote(lastID, "Imported Note", color);
													show('notes');
												});
											});

										});
										break;

									case "html":
										var html = data;
										var date = new Date().toLocaleString();
										var h1 = $(html).filter("h1").text().trim();
										h1 = h1 != "" ? h1: 'Imported Note';
										if(h1 && html && date){
											wait("Importing New Note");
											encrypt(h1).then(function(ciphertext) {
												encrypt(html).then(function(ciphertext2) {
													var color = colors[Math.floor(Math.random()*colors.length)];
													db.note.add({
														Title: ciphertext.data,
														Content: ciphertext2.data,
														CreationDate: date,
														ModificationDate: date,
														SyncDate: '',
														Color: color,
														Notebook: notebook
													}).then(function(lastID){
														addNote(lastID, h1, color);
														show('notes');
													});
												});

											});
										}else{
											show("notes");
										}
										break;
									case "asc":
										decrypt(data).then((plaintext) => {
											var regex = /.*\n/g;
											var html = "";

											while ((m = regex.exec(plaintext)) !== null) {
											    // This is necessary to avoid infinite loops with zero-width matches
											    if (m.index === regex.lastIndex) {
											        regex.lastIndex++;
											    }

											    // The result can be accessed through the `m`-variable.
											    m.forEach((match, groupIndex) => {
													html += `<p>${match}</p>`
											    });
											}

											encrypt(html).then(function(ciphertext2) {
												var color = colors[Math.floor(Math.random()*colors.length)];
												db.note.add({
													Title: ciphertext.data,
													Content: ciphertext2.data,
													CreationDate: date,
													ModificationDate: date,
													SyncDate: '',
													Color: color,
													Notebook: notebook
												}).then(function(lastID){
													addNote(lastID, "Imported Note", color);
													show('notes');
												});
											});
										}).catch((error) => {
											dialog.showErrorBox("Error decrypting your note", "There was an error decrypting your note, it was not imported.");
											show('notes');
										});
										break;
								}

							}
						});
					}
				});
				break;
		}
	});

	// Inserts the code element with the given language.
	$_("[data-content='notebook-list']").on("click", "[data-notebook]", function(){
		if(notebook != $_(this).data("notebook") + ""){
			notebook = $_(this).data("notebook") + "";

			$_(".logo h1").text($_(this).text());

			if(notebook != "Inbox"){
				db.notebook.where("id").equals(parseInt(notebook)).first(function(item, cursor){
					decrypt(item.Description).then(function(plaintext) {
						$_(".logo small").text(plaintext.data);
						$_("[data-action='edit-notebook']").style({display: "inline-block"});
						$_("[data-action='delete-notebook']").style({display: "inline-block"});
					});
				});
			}else{
				$_(".logo small").text("A place for any note");
				$_("[data-action='edit-notebook']").hide();
				$_("[data-action='delete-notebook']").hide();
			}
			loadNotes();
		}
	});

	$_("[data-content='notebook-list']").on("dragover", " li", function(event) {
		event.preventDefault();
		event.stopPropagation();
		$_(this).addClass("drag-hover");
	});

	$_("[data-content='notebook-list']").on("dragleave", " li", function(event) {
		event.preventDefault();
		event.stopPropagation();
		$_(this).removeClass("drag-hover");
	});

	$_("[data-content='note-container']").on("drag", "article", function(event) {
		event.preventDefault();
		event.stopPropagation();
		dragging = event.srcElement.dataset.nid;
	});

	$_("[data-content='notebook-list']").on("drop", " li" ,function(event) {
		event.preventDefault();
		event.stopPropagation();
		dragTarget = event.target.dataset.notebook;
		$_(this).removeClass("drag-hover");

		if (dragTarget != notebook) {
			db.transaction('rw', db.note, function() {
				db.note.where("id").equals(parseInt(dragging)).modify({Notebook: dragTarget});
				$_("[data-nid='" + dragging + "']").remove();
				dragging = null;
				dragTarget = null;
			});
		}


	});

	$_("[data-form='delete-note']").submit(function(event){
		event.preventDefault();
		db.note.where("id").equals(parseInt(deltempid)).delete().then(function(){

			$_("[data-nid='" + deltempid + "']").remove();
			$_("[data-modal='delete-note']").removeClass("active");
			deltempid = null;
		});
	});

	$_("[data-form='delete-note'] [type='reset']").click(function(){
		deltempid = null;
		$_("[data-modal='delete-note']").removeClass("active");
	});

});
