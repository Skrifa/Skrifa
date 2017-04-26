$_ready(function(){

	keyboardJS.bind('ctrl + s', function () {
		if ($_("#editor").isVisible()) {
			saveNote();
		}
	});

	keyboardJS.bind('ctrl + b', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand("bold", false, null);
		}
	});

	keyboardJS.bind('ctrl + i', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand("italic", false, null);
		}
	});

	keyboardJS.bind('ctrl  + u', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand("underline", false, null);
		}
	});

	keyboardJS.bind('ctrl + h + 1', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand('formatBlock', false, '<h1>');
		}
	});

	keyboardJS.bind('ctrl + h + 2', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand('formatBlock', false, '<h2>');
		}
	});

	keyboardJS.bind('ctrl + h + 3', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand('formatBlock', false, '<h3>');
		}
	});

	keyboardJS.bind('ctrl + h + 4', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand('formatBlock', false, '<h4>');
		}
	});

	keyboardJS.bind('ctrl + h + 5', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand('formatBlock', false, '<h5>');
		}
	});

	keyboardJS.bind('ctrl + h + 6', function () {
		if ($_("#editor").isVisible()) {
			document.execCommand('formatBlock', false, '<h6>');
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