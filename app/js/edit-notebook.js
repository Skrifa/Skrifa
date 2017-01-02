$_ready(() => {
	$_("[data-form='edit-notebook']").submit(function(event){
		event.preventDefault();
		var self = this;
		wait("Saving Your Notebook");
		var name = $_("[data-form='edit-notebook'] [data-input='name']").value();
		var description = $_("[data-form='edit-notebook'] [data-input='description']").value();

		encrypt(name).then(function(ciphertext) {

			encrypt(description).then(function(ciphertext2) {
				db.notebook.where("id").equals(notebook).modify({
					Name: ciphertext.data,
					Description: ciphertext2.data
				}).then(function(){
					$_(".logo h1").text($_("[data-form='edit-notebook'] [data-input='name']").value());
					$_(".logo small").text($_("[data-form='edit-notebook'] [data-input='description']").value());
					loadNotebooks().then(() => {
						self.reset();
						show("notes");
					});
				});
			});

		});
	});

	$_("[data-view='edit-notebook'] [type='reset']").click(function(){
		show("notes");
	});
});