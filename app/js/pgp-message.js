$_ready(function () {

	$_("[data-form='pgp-message']").submit(function(event){
		event.preventDefault();
	});

	$_("[data-form='pgp-message'] [type='submit']").click(function(){
		dialog.showSaveDialog({
			title: "Choose Directory to Save the Note",
			buttonLabel: "Save",
			defaultPath:  $_("#preview h1").first().text() + '.asc'
		},
		function(directory){
			if(directory){
				wait("Exporting Message to File");
				fs.writeFile(directory, $_("[data-content='message']").text(), 'utf8', function (error) {
					if(error){
						dialog.showErrorBox("Error exporting note", "There was an error exporting the note, file was not created.");
						show("pgp-message");
					}else{
						show("pgp-message");
					}
				});
			}
		});

	});

	$_("[data-form='pgp-message'] [data-action='copy-message']").click(function(){
		clipboard.writeText($_("[data-content='message']").text());
	});

	$_("[data-form='pgp-message'] [type='reset']").click(function(){
		$_("[data-content='message']").text("");
		show("share");
	});
});
