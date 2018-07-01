$_ready (() => {

	// Listener for the submit button
	$_('[data-form="delete-notebook"]').submit ((event) => {
		event.preventDefault ();
	});

	// Listener for the cancel button
	$_('[data-view="delete-notebook"] [type="reset"]').click (() => {
		show ('notes');
	});

	$_('[data-form="delete-notebook"] [data-action]').click ((event) => {
		wait ('Deleting Your Notebook');
		const action = $_(this).data ('action');
		notes.each ((note) => {
			if (note.id == notebook) {
				if (action === 'delete-move-inbox') {
					return notes.update ({Notebook: parseInt (notebook)});
				} else if (action === 'delete-everything') {
					return notes.remove (parseInt (notebook));
				}
			}
			return Promise.resolve ();
		}).then (() => {
			notebooks.remove (parseInt (notebook)).then (() => {
				// Change view to the Inbox notebook
				notebook = 'Inbox';
				$_('.logo h1').text ('Inbox');
				$_('.logo small').text ('A place for any note');
				$_('[data-action="edit-notebook"]').hide ();
				$_('[data-action="delete-notebook"]').hide ();
				loadContent ();
			});
		});
	});
});