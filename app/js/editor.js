function saveNote(){
	wait("Saving your note");
	var html = cleanHTML($_("#editor").html().trim());
	var date = new Date().toLocaleString();
	currentContent = html;
	db.transaction('rw', db.note, function(){
		var h1 = $_("#editor h1").first().text().trim();
		h1 = h1 != "" ? h1 : "Untitled";
		$_("[data-nid='" + id + "'] h2").text(h1);
		if(html && h1 && date){

			encrypt(html).then(function(ciphertext) {

				encrypt(h1).then(function(ciphertext2) {
					db.note.where("id").equals(parseInt(id)).modify({
						Content: ciphertext.data,
						Title: ciphertext2.data,
						MDate: date
					});
				});
			});
		}
	}).then(function(){
		unsaved = false;
		$_("[data-action='save']").removeClass('unsaved');
		show("editor");
	});
}


$_ready(function(){

	// Prevents external styles from being copied.
	$_('#editor').on('paste',function(e) {
	    e.preventDefault();
	    var plainText = (e.originalEvent || e).clipboardData.getData('text/plain');
	    var originalText = (e.originalEvent || e).clipboardData.getData('text/html');
	    document.execCommand('insertText', false, plainText);
	});

var map = {9: false, 16: false};
	$("#editor").on('keydown', function(e) {
	  var keyCode = e.keyCode || e.which;
		if (keyCode in map) {
        	map[keyCode] = true;
	        if (map[9] && map[16]) {
		       e.preventDefault();
	           document.execCommand('outdent', false, null);
	        }else if (map[9]) {
			    e.preventDefault();
				if(e.target.nodeName != "CODE" || e.target.nodeName != "PRE"){
					document.execCommand('indent', false, null);
				}else{
					document.execCommand('insertText', false, "    ");
				}

			}
        }
		if($_("#editor").html() != currentContent){
			unsaved = true;
			$_("[data-action='save']").addClass('unsaved');
		}else{
			unsaved = false;
			$_("[data-action='save']").removeClass('unsaved');
		}
	}).keyup(function(e) {
		var keyCode = e.keyCode || e.which;
	    if (keyCode in map) {
	        map[keyCode] = false;
	    }

		if($_("#editor").html() != currentContent){
			unsaved = true;
			$_("[data-action='save']").addClass('unsaved');
		}else{
			unsaved = false;
			$_("[data-action='save']").removeClass('unsaved');
		}


	});


	$_("[data-tool]").click(function(){
		unsaved = true;
		$_("[data-action='save']").addClass('unsaved');
		switch($_(this).data("tool")){

			case "h1":
			case "h2":
			case "h3":
			case "h4":
			case "h5":
			case "h6":
			case "mark":
			case "blockquote":
				document.execCommand('formatBlock', false, '<' + $_(this).data("tool") + '>');
				break;

			case "bold":
			case "italic":
			case "underline":
			case "strikeThrough":
			case "undo":
			case "redo":
			case "superscript":
			case "subscript":
			case "unlink":
				document.execCommand($_(this).data("tool"), false, null);
				break;

			case "Left":
			case "Right":
			case "Center":
			case "Full":
				document.execCommand("justify" + $_(this).data("tool"), false, null);
				break;

			case "ol":
				document.execCommand("insertOrderedList", false, null);
				break;

			case "ul":
				document.execCommand("insertUnorderedList", false, null);
				break;

			case "snippet":
				document.execCommand('insertHTML', false, "<span class='insertSnippet'></span>");
				$_("[data-modal='insert-snippet']").addClass("active");
				break;

			case "link":
				$_("[data-modal='insert-link'] input[data-input='text']").value(getSelectionText().trim());
				document.execCommand('insertHTML', false, "<span class='insertLink-div'></span>");
				$_("[data-modal='insert-link']").addClass("active");
				break;

			case "image":
				document.execCommand('insertHTML', false, "<span class='insertImage-div'></span>");
				$_("[data-modal='insert-image']").addClass("active");
				break;

			case "video":
				document.execCommand('insertHTML', false, "<span class='insertVideo-div'></span>");
				$_("[data-modal='insert-video']").addClass("active");
				break;

			case "table":
				document.execCommand('insertHTML', false, "<span class='insertTable-div'></span>");
				$_("[data-modal='insert-table']").addClass("active");
				break;

			case "edit-html":
				$_("[data-form='edit-html'] textarea").value($_("#editor").html());
				$_("[data-modal='edit-html']").addClass("active");
				break;

			case "insert-html":
				document.execCommand('insertHTML', false, "<span class='insertHTML-div'></span>");
				$_("[data-modal='insert-html']").addClass("active");
				break;
		}
	});

	$("[data-action='save']").click(function(){
		saveNote();
	});

	$("[data-action='back']").click(function(){
		if(unsaved){
			$_("[data-form='unsaved'] input").value('back');
			$_("[data-modal='unsaved']").addClass('active');
		}else{
			id = null;
			currentContent = null;
			show('notes');
		}
	});

	$_("[data-form='unsaved']").submit(function(event){
		event.preventDefault();
		switch($_("[data-form='unsaved'] input").value()){
			case 'back':
				id = null;
				currentContent = null;
				show('notes');
				break;

			case 'preview':
				wait("Wait while your note content is decripted");

				if(id == null){
					id = $_(this).data("id");
				}

				db.note.where(":id").equals(parseInt(id)).first().then(function (note) {

					decrypt(note.Content).then(function(plaintext) {
						$_("#preview").html(plaintext.data);
						Prism.highlightAll(true, null);
						(function(){
							if (!self.Prism) {
								return;
							}
							Prism.hooks.add('wrap', function(env) {
								if (env.type !== "keyword") {
									return;
								}
								env.classes.push('keyword-' + env.content);
							});
						})();

						MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
						show("preview")
					});
				});
				currentContent = null;
				break;
		}
		unsaved = false;
		currentContent = null;
		$_("[data-modal='unsaved']").removeClass('active');
	});

	$_("[data-form='unsaved'] [type='reset']").click(function(){
		$_("[data-modal='unsaved']").removeClass("active");
		$_("[data-form='unsaved']").get(0).reset();
	});

	$_("[data-form='insert-table']").submit(function(event){
		event.preventDefault();
		var columns = $_("[data-form='insert-table'] input[data-input='columns']").value();
		var rows = $_("[data-form='insert-table'] input[data-input='rows']").value();
		if(columns != "" && rows != ""){
			var table = "<br><div class='table-wrapper'><table>";
			for(var i = 0; i < rows; i++) {
				table += '<tr>';
				for(var j = 0; j < columns; j++) {
					table += '<td></td>';
				}
				table += '</tr>';
			}
			table += '</table></div><br>';
			$("span.insertTable-div").replaceWith(table);
		}
		$_("[data-modal='insert-table']").removeClass("active");
		this.reset();
		$_("span.insertTable-div").remove();
	});

	$_("[data-form='insert-table'] [type='reset']").click(function(){
		$_("[data-modal='insert-table']").removeClass("active");
		$_("span.insertTable-div").remove();
	});

	$_("[data-form='insert-video']").submit(function(event){
		event.preventDefault();
		var value = $_("[data-form='insert-video'] textarea").value().trim();
		if(value != ""){
			value = value.replace(/<iframe/g, "<webview").replace(/<\/iframe>/g, "</webview>");
			$("span.insertVideo-div").replaceWith("<br><div class='video-wrapper'>" + value + "</div><br>");
		}
		$_("[data-modal='insert-video']").removeClass("active");
		this.reset();
		$_("span.insertVideo-div").remove();
	});

	$_("[data-form='insert-video'] [type='reset']").click(function(){
		$_("[data-modal='insert-video']").removeClass("active");
		$_("span.insertVideo-div").remove();
	});

	$_("[data-form='insert-image']").submit(function(event){
		event.preventDefault();
		var value = $_("[data-form='insert-image'] input").value().trim();
		if(value != ""){
			$("span.insertImage-div").replaceWith("<img class='lazy' src='" + value + "' alt='" + value + "' data-url='" + value + "'>");
			$_("span.insertImage-div").remove();
			$_("[data-modal='insert-image']").removeClass("active");
			this.reset();
		}
	});

	$_("[data-form='insert-image'] [type='reset']").click(function(){
		$_("[data-modal='insert-image']").removeClass("active");
		$_("span.insertImage-div").remove();
	});

	$_("[data-form='insert-link']").submit(function(event){
		event.preventDefault();
		var text = $_("[data-form='insert-link'] [data-input='text']").value().trim();
		var link = $_("[data-form='insert-link'] [data-input='link']").value().trim();
		if(text != "" && link != ""){
			$("span.insertLink-div").replaceWith("<a href='" + link + "' target='_blank'>" + text + "</a>");
		}
		$_("[data-modal='insert-link']").removeClass("active");
		this.reset();
		$_("span.insertLink-div").remove();;
	});

	$_("[data-form='insert-link'] [type='reset']").click(function(){
		$_("[data-modal='insert-link']").removeClass("active");
		$_("span.insertLink-div").remove();
	});

	$_("[data-form='insert-html']").submit(function(event){
		event.preventDefault();
		var value = $_("[data-form='insert-html'] textarea").value().trim();
		if(value != ""){
			$("span.insertHTML-div").replaceWith(value);
		}
		$("[data-modal='insert-html']").removeClass("active");
		this.reset();
		$_("span.insertHTML-div").remove();
	});

	$_("[data-form='insert-html'] [type='reset']").click(function(){
		$_("[data-modal='insert-html']").removeClass("active");
		$_("span.insertHTML-div").remove();
	});

	$_("[data-form='edit-html']").submit(function(event){
		event.preventDefault();
		var value = $_("#editor").html($_("[data-form='edit-html'] textarea").value().trim());
		this.reset();
		$_("[data-modal='edit-html']").removeClass("active");
	});

	$_("[data-form='edit-html'] [type='reset']").click(function(){
		$_("[data-modal='edit-html']").removeClass("active");
	});

	$_("[data-form='insert-snippet']").submit(function(event){
		event.preventDefault();
		var code = "<pre><code class='language-" + $_("[data-form='insert-snippet'] select").value() + "'>Your Code...</code></pre><br>";
		$("span.insertSnippet").replaceWith(code);
		$_("[data-modal='insert-snippet']").removeClass("active");
		this.reset();
		$_("span.insertSnippet").remove();
	});

	$_("[data-form='insert-snippet'] [type='reset']").click(function(){
		$_("[data-modal='insert-snippet']").removeClass("active");
		$_("span.insertSnippet").remove();
	});

	$_("[data-action='local-image']").click(function(){
		dialog.showOpenDialog({
			title: "Load Image",
			buttonLabel: "Load",
			filters: [
				{name: 'Custom File Type', extensions: ['png', 'jpg', 'jpeg', 'svg', 'gif']},
			],
			properties: ['openFile']
		},
		function(file){
			if(file){
				fs.readFile(file[0], 'utf8', function (error, data) {
					if(error){
						console.log(error);
						$_("[data-modal='insert-image']").removeClass("active");
					}else{

						$("span.insertImage-div").replaceWith("<img class='lazy' src='" + file[0] + "' alt='" + file[0] + "' data-url='" + file[0] + "'>");
						$_("span.insertImage-div").remove();
						$_("[data-modal='insert-image']").removeClass("active");

					}
				});
			}
		});
	});

});