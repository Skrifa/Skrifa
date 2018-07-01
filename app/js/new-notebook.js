$_ready(() => {

	// Listener for the submit button
	$_('[data-form="new-notebook"]').submit (function (event) {
		event.preventDefault ();

		// Get the name and description values from the form
		var name = $_('[data-form="new-notebook"] input[data-input="name"]').value ().trim ();
		var description = $_('[data-form="new-notebook"] input[data-input="description"]').value ().trim ();

		// Check if name was not empty
		if (name !== '') {
			wait ('Wait while your new notebook is created');

			// Encrypt name and description
			encrypt (name).then ((ciphertext) => {
				encrypt (description).then ((ciphertext2) => {

					// Insert the new notebook
					notebooks.set(null, {
						Name: ciphertext.data,
						Description: ciphertext2.data
					}).then (() => {
						this.reset ();
						// Load notebooks list again
						loadNotebooks ().then(() => {
							show ('notes');
						});
					});

				});
			});
		}
	});

	// Listener for the cancel button
	$_('[data-view="new-notebook"] [type="reset"]').click (() => {
		show ('notes');
	});
});