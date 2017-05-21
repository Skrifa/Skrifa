$_ready(() => {

	// Action listeners for the preview toolbar
	$_("[data-view='preview'] [data-action]").click(function() {
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


