$_ready(function(){

	// Action listeners for the preview toolbar
	$("body").on("click", "[data-action]",function(){
		switch ($_(this).data("action")) {
			case "print":
				window.print();
				break;

			case "export":
				show("export-note");
				break;

			case "share":
				show("share");
				break;
		}
	});

});


