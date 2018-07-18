/**
 * Provides Skrifa's functionality.
 *
 * This file contains core functionality for Skrifa, functions and initialValue
 * settings are declared here.
 */


// Show the loading screen with a custom message
function wait (message) {
	$_('[data-view]').removeClass ("active");
	$_('[data-view="loading"] h2').text (message);
	$_('[data-view="loading"]').addClass ("active");
}

// Show a given view, it will hide all views and then show the given one.
function show (view) {
	$_('[data-view]').removeClass ("active");
	$_(`[data-view="${view}"]`).addClass ("active");
}

// Encrypt data using OpenPGP.js
function encrypt (data, options = encryptOptions) {
	options.data = data;
	return openpgp.encrypt (options);
}

// Decrypt data
function decrypt (data) {
	decryptOptions.message = openpgp.message.readArmored (data);
	return openpgp.decrypt (decryptOptions);
}

// Get the title of a note
function getTitle (html, suggested) {
	const found = $_(html).filter ("h1").first ().text ().trim ();

	// Check if a title was found
	if (found) {
		return found;
	} else {
		return suggested;
	}
}

// Function to add a note to the notes container
function addNote (noteID, noteTitle, noteColor) {

	// Remove welcome screen in case it was still there
	$_("[data-content='welcome']").hide();

	// Add the note element
	$_("[data-content='note-container']").append(`
		<article data-color='${noteColor}' draggable='true' data-nid='${noteID}'>
			<div class='content' >
				<h2>${noteTitle}</h2>
			</div>
			<div class='note-actions'>
				<span class='fa fa-eye' data-id='${noteID}' data-action='preview'></span><span class='fa-pencil fa' data-id='${noteID}' data-action='edit'></span>
				<span class='fa-trash fa' data-id='${noteID}' data-action='delete'></span>
			</div>
		</article>
	`);

	// Style the added note
	styleNote (noteID);
}

// Function to set the background color and other style of the notes
function styleNote (id) {

	// Check if a note ID was given
	if (typeof id === 'undefined') {

		// Styling for Light and Dark themes
		if ($_("body").hasClass("light") || $_("body").hasClass("dark")) {
			$_(".grid article").each(function(element) {
				$_(element).style("background", $_(element).data("color"));
			});
		}

		// Styling for Ghost theme
		if ($_("body").hasClass("ghost")) {
			$_(".grid article").each(function(element) {
				$_(element).style("border", "1px solid " + $_(element).data("color"));
				$_(element).style("color", $_(element).data("color"));
			});
		}
	} else {
		// Styling for Light and Dark themes
		if ($_("body").hasClass("light") || $_("body").hasClass("dark")) {
			$_(`.grid [data-nid='${id}']`).style("background", $_(`.grid [data-nid='${id}']`).data("color"));
		}

		// Styling for Ghost theme
		if ($_("body").hasClass("ghost")) {
			$_(`.grid [data-nid='${id}']`).style("border", "1px solid " + $_(`.grid [data-nid='${id}']`).data("color"));
			$_(`.grid [data-nid='${id}']`).style("color", $_(`.grid [data-nid='${id}']`).data("color"));
		}
	}
}

// Load notes of the current notebook
function loadNotes () {
	// Check if the key is actually set
	if (key != null) {
		// Remove previous content
		$_("[data-content='note-container']").html("");

		// Remove welcome screen
		$_("[data-content='welcome']").hide();
		wait("Loading your notes");

		return notes.getAll ().then ((notes) => {
			if (Object.keys (notes).length <= 0) {
				$_("[data-content='welcome']").show();
			}

			const notebookNotes = Object.values (notes).filter ((note) => {
				return note.Notebook == notebook;
			});

			// Check the ordering settings for the notes and get all the notes
			if (settings.sort == "newer") {
				notebookNotes.reverse ();
			}

			const promises = [];
			for (const note of notebookNotes) {
				// Decrypt the note title and add it
				promises.push (decrypt(note.Title).then ((plaintext) => {
					addNote (note.id, plaintext.data, note.Color);
				}));
			}
		}).then(function() {
			show ("notes");
		});
	}
	return Promise.reject ();
}

// Load notebook list
function loadNotebooks() {
	wait("Wait while your notebooks are decrypted");
	if (key != null) {
		// Remove previous content
		$_("[data-content='notebook-list']").html("");

		// Add Inbox notebook by default
		$_("[data-content='notebook-list']").append('<li data-notebook="Inbox">Inbox</li>');

		// Temporary array to store the notebooks
		var notebooksTemp = [];

		return notebooks.getAll ().then ((notebooks) => {
			const promises = [];
			for (const notebook of notebooks) {
				// Decrypt the name of each notebook
				promises.push (decrypt(notebook.Name).then ((plaintext) => {
					return {
						id: notebook.id,
						Name: plaintext.data
					};
				}));
			}
			return Promise.all (promises);
		}).then ((notebooks) => {
			notebooks.sort(function(a, b){
				var A = a.Name.toLowerCase();
				var B = b.Name.toLowerCase();
				if (A < B){
					return -1;
				}
				if(A > B){
					return 1;
				}
				return 0;
			});

			// Build the notebook buttons for the side bar
			for(const notebook of notebooks) {
				$_("[data-content='notebook-list']").append('<li data-notebook="' + notebook.id + '">' + notebook.Name + '</li>');
			}
		});
	}
	return Promise.reject ();
}

// Load notebook list and notes
function loadContent () {
	loadNotebooks().then(() => {
		loadNotes ();
	});
}

// Clean the HTML code generated by the Content Editable
function cleanHTML (html) {
	return html.replace(/(<\/span>|<span style=\"line-height: 1.5em;\">)/g, '').replace(/<div>/g, '<p>').replace(/<\/div>/g, '</p>\r\n').replace(/<p><br><\/p>/g, '').replace(/&nbsp;/g, ' ');
}

// Transform images to Base64 encoding, encoding it to Base64 will produce a
// bigger size image which should be handled with care and it will also remove
// any metadata from the file, improving privacy
function toDataUrl (url, callback) {
	wait("Loading Image");
	var xhr = new XMLHttpRequest();
	xhr.responseType = 'blob';
	xhr.onload = function() {
		var reader = new FileReader();
		reader.onloadend = function() {
			// Check if the format is PNG so it can be compressed
			if (xhr.response.type == "image/png") {
				var image = nativeImage.createFromDataURL(reader.result);

				// Compress image using the selected quality
				image = image.resize({quality: settings.imageCompression});
				show('editor');
				callback(image.toDataURL());
			} else {
				show('editor');
				callback(reader.result);
			}
		}
		reader.readAsDataURL(xhr.response);
	};
	xhr.onerror = function() {
		$_("span.insertImage-div").remove();
		dialog.showErrorBox("Error loading your image", "There was an error loading your image, it was not inserted.");
		show('editor');
	};
	xhr.open('GET', url);
	xhr.send();
}

$_ready(() => {

	// Check if there are any updates available
	if (navigator.onLine) {
		Request.json ('https://skrifa.xyz/latest').then ((data) => {
			if (data.response.version) {
				// Compare version numbers
				if (parseInt(data.response.version.replace(/\./g,"")) > parseInt(pkg.version.replace(/\./g,""))) {
					$_("[data-action='update']").show();
				}
			}
		});
	}

	// Hide the notebook edition options
	$_("[data-action='edit-notebook']").hide();
	$_("[data-action='delete-notebook']").hide();

	// Build the select options for language highlightning
	for(var key in Prism.languages){
		$_("[data-form='insert-snippet'] select").append("<option value='" + key + "'>"+ Text.capitalize(key) +"</option>");
	}

	// Go to decrypt screen if a private key is already stored
	Storage.get("PrivKey").then (() => {
		show ("decrypt");
	}).catch (() => {

	});

	// Change view settings, currently saved for future uses
	if(settings.view == "list"){
		$_("[data-content='note-container']").removeClass("grid");
		$_("[data-content='note-container']").addClass("list");
		$_("[data-action='change-view']").removeClass("fa-th-list");
		$_("[data-action='change-view']").addClass("fa-th");
	}

	// Set the theme for the application
	$_("body").removeClass();
	$_("body").addClass(settings.theme);

	// Set the value to the select options inside the settings screen according
	// to the user saved settings
	$_("[data-action='change-theme']").value(settings.theme);
	$_("[data-action='change-sort']").value(settings.sort);
	$_("[data-input='imageCompression']").value(settings.imageCompression);

	// Listener for when the menu icon is clicked
	$_(".menu-icon").click(function(){
		if($_("[data-view='" +$_(this).data("menu") + "'] .side-nav").isVisible()){
			$_("[data-view='" +$_(this).data("menu") + "'] .side-nav").removeClass("active");
		}else{
			$_("[data-view='" +$_(this).data("menu") + "'] .side-nav").addClass("active");
		}
	});

});