/**
 * Provides the Preview screen functionality.
 *
 * Mainly used for the functioning of the top nav bar and the options it
 * provides.
 */

$_ready(() => {

	// Action listeners for the preview toolbar
	$_("[data-view='preview'] [data-action]").click(function() {
		switch ($_(this).data("action")) {

			// Use the default behavior for printing the page, can also be used
			// to print the file to a PDF
			case "print":
				window.print();
				break;

			// Show the note export screen
			case "export":
				show("export-note");
				break;

			// Show the note share screen
			case "share":
				show("share");
				break;

			// Enter the editor for the current note
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
		}
	});
});