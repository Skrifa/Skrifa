$_ready(() => {

	// Listener for the submit button
	$_("[data-form='new-notebook']").submit(function(event){
		event.preventDefault();
		var self = this;

		// Get the name and description values from the form
		var name = $_("[data-form='new-notebook'] input[data-input='name']").value().trim();
		var description = $_("[data-form='new-notebook'] input[data-input='description']").value().trim();

		// Check if name was not empty
		if (name != "") {
			wait("Wait while your new notebook is created");

			// Encrypt name and description
			encrypt(name).then(function(ciphertext) {
				encrypt(description).then(function(ciphertext2) {

					// Insert the new notebook
					db.notebook.add({
						Name: ciphertext.data,
						Description: ciphertext2.data
					}).then(function(){
						self.reset();
						// Load notebooks list again
						loadNotebooks().then(function() {
							show("notes");
						});
					});

				});
			});
		}
	});

	// Listener for the cancel button
	$_("[data-view='new-notebook'] [type='reset']").click(function(){
		show("notes");
	});
});