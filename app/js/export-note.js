$_ready(function(){

	// Export function, receives what content and what extension the exported
	// file should have.
	function exportNote (content, extension) {
		dialog.showSaveDialog({
			title: "Choose Directory to Export Note",
			buttonLabel: "Export",
			defaultPath: $_("#preview h1").first().text() + '.' + extension
		},
		function(directory){
			if(directory){
				fs.writeFile(directory, content, 'utf8', function (error) {
					if (error) {
						dialog.showErrorBox("Error exporting note", "There was an error exporting the note, file was not created.");
					}
					show("preview");
				});
			} else {
				show("export-note");
			}
		});
	}

	// Prevent the default event on form submission
	$_("[data-form='export-note']").submit(function(event){
		event.preventDefault();
	});

	// Export in an encrypted Skrifa Format (.skf)
	$_("[data-form='export-note'] [data-action='export-skf']").click(function(event){
		wait("Exporting Note to File");
		db.note.where("id").equals(parseInt(id)).first(function(note){
			// Remove unnecessary metadata
			delete note.Notebook;
			delete note.SyncDate;
			delete note.id;
			exportNote(JSON.stringify(note), 'skf');
		});
	});

	// Export in an unencrypted Skrifa Format (.skrifa)
	$_("[data-form='export-note'] [data-action='export-skrifa']").click(function(event){
		wait("Exporting Note to File");
		db.note.where("id").equals(parseInt(id)).first(function(note){
			decrypt(note.Content).then((plaintext) => {
				// Add attributes that are compatible with the Chrome version
				note.Content = plaintext.data;

				// Remove unnecessary metadata
				delete note.Notebook;
				delete note.SyncDate;
				delete note.id;

				// Get note Title from the DOM to speed up the process
				note.Title = $_("#preview h1").first().text().trim() != "" ? $_("#preview h1").first().text() : "Untitled";
				exportNote(JSON.stringify(note), 'skrifa');
			});
		});
	});

	// Export in MarkDown Format
	$_("[data-form='export-note'] [data-action='export-md']").click(function(event){
		wait("Exporting Note to File");
		db.note.where("id").equals(parseInt(id)).first(function(note){
			decrypt(note.Content).then((plaintext) => {
				var und = new upndown();

				// Parse HTML to Markdown
				und.convert(plaintext.data, function (error, markdown) {
					if (!error) {
						exportNote(markdown, 'md');
					} else {
						dialog.showErrorBox("Error exporting note", "There was an error exporting the note, file was not created.");
						show("export-note");
					}
				});
			});
		});
	});

	// Export in HTML format
	$_("[data-form='export-note'] [data-action='export-html']").click(function(event){
		wait("Exporting Note to File");

		// Read contents from the HTML template file
		fs.readFile(`${app.getAppPath()}/note-template.html`, 'utf8', function (error, data) {
			if (error) {
				dialog.showErrorBox("Error Exporting Note", "The note template could not be found, the note was not exported.");
				show("export-note");
			} else {
				db.note.where("id").equals(parseInt(id)).first(function(note){
					decrypt(note.Content).then((plaintext) => {

						// Insert note information in the template file and export it
						data = data.replace("{{title}}", $_("#preview h1").first().text().trim() != "" ? $_("#preview h1").first().text() : "Untitled");
						data = data.replace("{{content}}", plaintext.data);
						exportNote(data, 'html');
					});
				});
			}
		});
	});

	// Export in PDF format
	$_("[data-form='export-note'] [data-action='export-pdf']").click(function(event){
		wait("Exporting Note to File");
		dialog.showSaveDialog({
			title: "Choose Directory to Export Note",
			buttonLabel: "Export",
			defaultPath: $_("#preview h1").first().text() + '.pdf'
		},
		function(directory){
			if(directory){

				// Set parameters for htmlBoilerplatePDF
				htmlBoilerplatePDF({
					cssPath: `${app.getAppPath()}/style/pdf.css`,
					paperFormat: 'Letter',
					paperBorder: '24.892mm'})
					.from.string($_("#preview").html())
					.to(directory, function () {
						show("preview");
				});
			} else {
				show("export-note");
			}
		});

	});

	// Listener for the cancel button
	$_("[data-view='export-note'] [type='reset']").click(function(){
		show("preview");
	});

});