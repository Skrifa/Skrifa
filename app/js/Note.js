class Note {

	constructor ({ Title, Content, CreationDate, ModificationDate, SyncDate, Color, Notebook }) {
		this.props = {
			Title,
			Content,
			CreationDate,
			ModificationDate,
			SyncDate,
			Color,
			Notebook
		};
	}

	static color () {
		return Note.colors[Math.floor (Math.random () * Note.colors.length)];
	}

	static create (props = {}) {
		const date = new Date ().toLocaleString ();
		const note = Object.assign ({}, {
			Title: 'New Note',
			Content: '<h1>New Note</h1>',
			CreationDate: date,
			ModificationDate: date,
			SyncDate: '',
			Color: Note.color (),
			Notebook: 'Inbox'
		}, props);
		return Note.encrypt (note).then ((note) => {
			return notes.set (null, note);
		});
	}

	static decrypt (note) {
		return Promise.all ([decrypt (note.Title), decrypt (note.Content)]).then (([name, content]) => {
			return Object.assign ({}, note, {Title: name.data, Content: content.data});
		});
	}

	static encrypt (note, options = encryptOptions) {
		return Promise.all ([encrypt (note.Title, options), encrypt (note.Content, options)]).then (([name, content]) => {
			return Object.assign ({}, note, {Title: name.data, Content: content.data});
		});
	}

}

Note.colors = [
	'#F06868', '#80D6FF', '#FAB57A', '#41B3D3', '#61D2DC', '#444444', '#63B75D',
	'#217756', '#118DF0', '#FF304F', '#B7569A', '#883C82', '#FFBF00', '#2E3837',
	'#166678', '#7DB9B3', '#76E7C7', '#F26BA3', '#165570', '#FF9F55', '#35A3C5',
	'#FC9C00', '#ED5784', '#C93746', '#9A30DD', '#01C2D6', '#46BEAD', '#3AB4B1',
	'#F7941D', '#F24D16', '#C92E00', '#A81414', '#E55942', '#FF7085', '#4ED887',
	'#0086B3'
];