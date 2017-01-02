$_ready(() => {
	
	$_("[data-form='delete-notebook']").submit(function(event){
		event.preventDefault();
		var self = this;
		wait("Deleting Your Notebook");
		db.transaction('rw', db.notebook, db.note, function(){
			db.notebook.where("id").equals(parseInt(notebook)).delete();
			switch($_("[data-form='delete-notebook'] [name='strategy']:checked").value()){
				case "move":
					db.note.where("Notebook").equals(notebook).modify({Notebook: "Inbox"});
					break;

				case "delete":
					db.note.where("Notebook").equals(notebook).delete();
					break;
			}

		}).then(function(){
			self.reset();
			notebook = "Inbox";
			$_(".logo h1").text("Inbox");
			$_(".logo small").text("A place for any note");
			$_("[data-action='edit-notebook']").hide();
			$_("[data-action='delete-notebook']").hide();
			loadContent();
		});
	});

	$_("[data-view='delete-notebook'] [type='reset']").click(function(){
		show("notes");
	});
});