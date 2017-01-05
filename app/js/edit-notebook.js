$_ready(() => {

	// Listener for the submit button
	$_("[data-form='edit-notebook']").submit(function(event){
		event.preventDefault();
		var self = this;
		wait("Saving Your Notebook");

		// Grab the values of the name and description
		var name = $_("[data-form='edit-notebook'] [data-input='name']").value().trim();
		var description = $_("[data-form='edit-notebook'] [data-input='description']").value().trim();

		// Encrypt the name
		encrypt(name).then(function(ciphertext) {

			// Encrypt the description
			encrypt(description).then(function(ciphertext2) {

				// Update the Notebook's information
				db.notebook.where("id").equals(notebook).modify({
					Name: ciphertext.data,
					Description: ciphertext2.data
				}).then(function(){

					// Change the text of the header according to the new values
					$_(".logo h1").text($_("[data-form='edit-notebook'] [data-input='name']").value());
					$_(".logo small").text($_("[data-form='edit-notebook'] [data-input='description']").value());

					// Change the name in the notebooks list
					$_(`[data-notebook='${notebook}']`).text($_("[data-form='edit-notebook'] [data-input='name']").value());

					show("notes");
				});
			});

		});
	});

	// Listener for the cancel button
	$_("[data-view='edit-notebook'] [type='reset']").click(function(){
		show("notes");
	});
});