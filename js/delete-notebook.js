$_ready(() => {

	// Listener for the submit button
	$_("[data-form='delete-notebook']").submit(function(event) {
		event.preventDefault();
	});

	$_("[data-form='delete-notebook'] [data-action='delete-move-inbox']").click(function(event) {
		wait("Deleting Your Notebook");
		db.transaction('rw', db.notebook, db.note, function() {
			db.notebook.where("id").equals(parseInt(notebook)).delete();
			db.note.where("Notebook").equals(notebook).modify({Notebook: "Inbox"});
		}).then(function(){
			// Change view to the Inbox notebook
			notebook = "Inbox";
			$_(".logo h1").text("Inbox");
			$_(".logo small").text("A place for any note");
			$_("[data-action='edit-notebook']").hide();
			$_("[data-action='delete-notebook']").hide();
			loadContent();
		});
	});

	$_("[data-form='delete-notebook'] [data-action='delete-everything']").click(function(event) {
		wait("Deleting Your Notebook");
		db.transaction('rw', db.notebook, db.note, function() {
			db.notebook.where("id").equals(parseInt(notebook)).delete();
			db.note.where("Notebook").equals(notebook).delete();
		}).then(function(){
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