$_ready(() => {

	keyboardJS.bind ('ctrl + s', () => {
		if ($_('#editor').isVisible ()) {
			saveNote ();
		}
	});

	keyboardJS.bind ('ctrl + b', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('bold', false, null);
		}
	});

	keyboardJS.bind ('ctrl + i', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('italic', false, null);
		}
	});

	keyboardJS.bind ('ctrl  + u', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('underline', false, null);
		}
	});

	keyboardJS.bind ('ctrl + h + 1', () => {
		if ($_('#editor').isVisible()) {
			document.execCommand('formatBlock', false, '<h1>');
		}
	});

	keyboardJS.bind ('ctrl + h + 2', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('formatBlock', false, '<h2>');
		}
	});

	keyboardJS.bind ('ctrl + h + 3', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('formatBlock', false, '<h3>');
		}
	});

	keyboardJS.bind ('ctrl + h + 4', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('formatBlock', false, '<h4>');
		}
	});

	keyboardJS.bind ('ctrl + h + 5', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('formatBlock', false, '<h5>');
		}
	});

	keyboardJS.bind ('ctrl + h + 6', () => {
		if ($_('#editor').isVisible ()) {
			document.execCommand ('formatBlock', false, '<h6>');
		}
	});

	keyboardJS.bind ('ctrl + n', () => {
		if ($_('[data-view="notes"]').isVisible ()) {
			wait('Wait while your note is created');
			var date = new Date ().toLocaleString ();

			encrypt ('New Note').then ((title) => {
				encrypt ('<h1>New Note</h1>').then ((content) => {
					var color = colors[Math.floor (Math.random () *colors.length)];
					notes.set (null, {
						Title: title.data,
						Content: content.data,
						CreationDate: date,
						ModificationDate: date,
						SyncDate: '',
						Color: color,
						Notebook: notebook
					}).then (({key, value}) => {
						addNote (key, 'New Note', color);
						show ('notes');
					});
				});
			});
		}
	});

	keyboardJS.watch();
});