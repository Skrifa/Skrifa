$_ready(() => {

	// Listener for the submit button
	$_("[data-form='delete-notebook']").submit(function(event) {
		event.preventDefault();
		var self = this;
		wait("Deleting Your Notebook");
		db.transaction('rw', db.notebook, db.note, function() {
			// Delete Notebook
			db.notebook.where("id").equals(parseInt(notebook)).delete();

			// Check what strategy was chosen
			switch ($_("[data-form='delete-notebook'] [name='strategy']:checked").value()) {
				// Move all notes that pointed to the deleted notebook to Inbox
				case "move":
					db.note.where("Notebook").equals(notebook).modify({Notebook: "Inbox"});
					break;

				// Delete all notes that pointed to the deleted notebook
				case "delete":
					db.note.where("Notebook").equals(notebook).delete();
					break;
			}

		}).then(function(){
			// Clear form
			self.reset();

			// Change view to the Inbox notebook
			notebook = "Inbox";
			$_(".logo h1").text("Inbox");
			$_(".logo small").text("A place for any note");
			$_("[data-action='edit-notebook']").hide();
			$_("[data-action='delete-notebook']").hide();
			loadContent();
		});
	});

	// Listener for the cancel button
	$_("[data-view='delete-notebook'] [type='reset']").click(function(){
		show("notes");
	});
});