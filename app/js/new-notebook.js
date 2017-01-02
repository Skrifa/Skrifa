$_ready(() => {
	$_("[data-form='new-notebook']").submit(function(event){
		event.preventDefault();
		var self = this;
		var name = $_("[data-form='new-notebook'] input[data-input='name']").value().trim();
		var description = $_("[data-form='new-notebook'] input[data-input='description']").value().trim();
		if(name != ""){
			wait("Wait while your new notebook is created");
			encrypt(name).then(function(ciphertext) {
				encrypt(description).then(function(ciphertext2) {
					db.notebook.add({
						Name: ciphertext.data,
						Description: ciphertext2.data
					}).then(function(){
						self.reset();
						loadNotebooks().then(function(){
							show("notes");
						});
					});

				});
			});
		}
	});

	$_("[data-view='new-notebook'] [type='reset']").click(function(){
		show("notes");
	});
});