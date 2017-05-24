/**
 * Provides Skrifa's functionality.
 *
 * This file contains core functionality for Skrifa, functions and initialValue
 * settings are declared here.
 */


// Show the loading screen with a custom message
function wait (message) {
	$_('[data-view]').removeClass("active");
	$_('[data-view="loading"] h2').text(message);
	$_('[data-view="loading"]').addClass("active");
}

// Show a given view, it will hide all views and then show the given one.
function show (view) {
	$_('[data-view]').removeClass("active");
	$_(`[data-view="${view}"]`).addClass("active");
}

// Encrypt data using OpenPGP.js
function encrypt (data, options) {
	// Check if custom options where provided, in case they weren't, use the
	// default ones defined in the decrypt.js file
	if (typeof options == 'undefined') {
		encryptOptions.data = data;
		return openpgp.encrypt(encryptOptions);
	} else {
		options.data = data;
		return openpgp.encrypt(options);
	}
}

// Decrypt data
function decrypt (data) {
	decryptOptions.message = openpgp.message.readArmored(data);
	return openpgp.decrypt(decryptOptions);
}

// Get the title of a note
function getTitle (html, suggested) {
	var found = $(html).filter("h1").first().text().trim();

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
	$_("[data-content='note-container']").append(`<article data-color='${noteColor}' draggable='true' data-nid='${noteID}'><div class='content' ><h2>${noteTitle}</h2></div><div class='note-actions'><span class='fa fa-eye' data-id='${noteID}' data-action='preview'></span><span class='fa-pencil fa' data-id='${noteID}' data-action='edit'></span><span class='fa-trash fa' data-id='${noteID}' data-action='delete'></span></div></article>`);

	// Style the added note
	styleNote(noteID);
}

// Function to set the background color and other style of the notes
function styleNote (id) {

	// Check if a note ID was given
	if (typeof id == 'undefined') {

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

		db.transaction('r', db.note, function() {
			var ht = "";
			// Check if the notebook is empty to show the welcome screen
			db.note.where("Notebook").equals(notebook).count(function(count) {
				if (count <= 0) {
					$_("[data-content='welcome']").show();
				}
			});

			// Check the ordering settings for the notes and get all the notes
			if (settings.sort == "newer") {
				db.note.where("Notebook").equals(notebook).reverse().each(function(item, cursor){
					var item = item;

					// Decrypt the note title and add it
					decrypt(item.Title).then(function(plaintext) {
						addNote(item.id, plaintext.data, item.Color);
					});
				});
			} else {
				db.note.where("Notebook").equals(notebook).each(function(item, cursor) {
					var item = item;

					// Decrypt the note title and add it
					decrypt(item.Title).then(function(plaintext) {
						addNote(item.id, plaintext.data, item.Color);
					});
				});

			}

		}).then(function() {
			show("notes");
		});
	}
}

// Load notebook list
function loadNotebooks() {
	return new Promise((resolve, reject) => {
		wait("Wait while your notebooks are decrypted");
		if (key != null) {
			// Remove previous content
			$_("[data-content='notebook-list']").html("");

			// Add Inbox notebook by default
			$_("[data-content='notebook-list']").append('<li data-notebook="Inbox">Inbox</li>');

			// Temporary array to store the notebooks
			var notebooksTemp = [];

			// Get all notebooks
			db.transaction('r', db.notebook, function() {
				db.notebook.each(function(item, cursor) {

					// Decrypt the name of each notebook
					decrypt(item.Name).then(function(plaintext) {
						// Push decrypted notebook to array
						notebooksTemp.push({
							id: item.id,
							Name: plaintext.data
						});
					});

				});
			}).then(function() {
				// Order notebooks alphabetically
				notebooksTemp.sort(function(a, b){
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
				for(var i in notebooksTemp) {
					$_("[data-content='notebook-list']").append('<li data-notebook="' + notebooksTemp[i].id + '">' + notebooksTemp[i].Name + '</li>');
				}
				resolve();
			});
		}
	});
}

// Load notebook list and notes
function loadContent () {
	loadNotebooks().then(() => {
		loadNotes();
	});
}

// Get the currently selected text
function getSelectionText () {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if(document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
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
		Request.json('https://skrifa.xyz/latest', {
			onload: function (data) {
				if (data.response.version) {
					// Compare version numbers
					if (parseInt(data.response.version.replace(/\./g,"")) > parseInt(pkg.version.replace(/\./g,""))) {
						$_("[data-action='update']").show();
					}
				}
			},
			onerror: function (error) {
				console.log(error);
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
	if(Storage.get("PrivKey") != null && Storage.get("PrivKey") != "null"){
		show("decrypt");
	}

	// Change view settings, currently saved for future uses
	if(settings.view == "list"){
		$_("[data-content='note-container']").removeClass("grid");
		$_("[data-content='note-container']").addClass("list");
		$_("[data-action='change-view']").removeClass("fa-th-list");
		$_("[data-action='change-view']").addClass("fa-th");
	}

	// Set the theme for the application
	$("body").removeClass();
	$_("body").addClass(settings.theme);

	// Set the value to the select options inside the settings screen according
	// to the user saved settings
	$_("[data-action='change-theme']").value(settings.theme);
	$_("[data-action='change-sort']").value(settings.sort);
	$_("[data-input='imageCompression']").value(settings.imageCompression);

	// Listener for when the menu icon is clicked
	$_(".menu-icon").click(function(){
		if($_("[data-view='" +$_(this).data("menu") + "'] .side-nav").isVisible()){
			$("[data-view='" +$_(this).data("menu") + "'] .side-nav").removeClass("active");
		}else{
			$("[data-view='" +$_(this).data("menu") + "'] .side-nav").addClass("active");
		}
	});

});