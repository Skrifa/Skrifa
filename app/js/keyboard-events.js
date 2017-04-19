$_ready(function(){

	keyboardJS.bind('ctrl + s', function () {
		if ($_("#editor").isVisible()) {
			saveNote();
		}
	});

	keyboardJS.bind('ctrl + n', function () {
		if ($_("[data-view='notes']").isVisible()) {
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
		}
	});
	keyboardJS.watch();

});