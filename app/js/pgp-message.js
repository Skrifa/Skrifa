$_ready (() => {

	$_('[data-form="pgp-message"]').submit ((event) => {
		event.preventDefault();
	});

	$_('[data-form="pgp-message"] [type="submit"]').click (() => {
		dialog.showSaveDialog ({
			title: 'Choose Directory to Save the Note',
			buttonLabel: 'Save',
			defaultPath:  $_('#preview h1').first ().text () + '.asc'
		},
		(directory) => {
			if (directory) {
				wait('Exporting Message to File');
				fs.writeFile(directory, $_('[data-content="message"]').text (), 'utf8', (error) => {
					if (error) {
						dialog.showErrorBox ('Error exporting note', 'There was an error exporting the note, file was not created.');
					}
					show ('pgp-message');
				});
			}
		});
	});

	$_('[data-form="pgp-message"] [data-action="copy-message"]').click (() => {
		clipboard.writeText ($_('[data-content="message"]').text ());
	});

	$_('[data-form="pgp-message"] [type="reset"]').click (() => {
		$_('[data-content="message"]').text ('');
		show ('share');
	});
});