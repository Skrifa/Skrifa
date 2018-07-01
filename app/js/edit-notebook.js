$_ready (() => {

	// Listener for the submit button
	$_("[data-form='edit-notebook']").submit (function(event) {
		event.preventDefault ();
		wait ("Saving Your Notebook");

		// Grab the values of the name and description
		const plainName = $_("[data-form='edit-notebook'] [data-input='name']").value ().trim ();
		const plainDescription = $_("[data-form='edit-notebook'] [data-input='description']").value ().trim ();

		// Encrypt the name
		encrypt (plainName).then ((name) => {

			// Encrypt the description
			encrypt (plainDescription).then ((description) => {

				// Update the Notebook's information
				notebooks.update (notebook, {
					Name: name.data,
					Description: description.data
				}).then (() => {
					// Change the text of the header according to the new values
					$_(".logo h1").text ($_("[data-form='edit-notebook'] [data-input='name']").value ());
					$_(".logo small").text ($_("[data-form='edit-notebook'] [data-input='description']").value ());

					// Change the name in the notebooks list
					$_(`[data-notebook='${notebook}']`).text ($_("[data-form='edit-notebook'] [data-input='name']").value ());
					this.reset ();
					show("notes");
				});
			});
		});
	});

	// Listener for the cancel button
	$_("[data-view='edit-notebook'] [type='reset']").click (() => {
		show ("notes");
	});
});