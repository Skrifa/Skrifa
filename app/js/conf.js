/**
 * Provides Skrifa's configuration.
 *
 * This file contains the initial configurations,
 * note colors and database information.
 */

// Set MathJax settings
MathJax.Hub.Config({
	tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});

// Import all needed modules
const {dialog} = require('electron').remote;
const nativeImage = require('electron').nativeImage
const {shell} = require('electron');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const openpgp = require('openpgp');
const CryptoJS = require('crypto-js');
const htmlBoilerplatePDF = require('html-boilerplate-pdf');
const upndown = require('upndown');
const mammoth = require('mammoth');
const pkg = require('./package.json');
const {clipboard} = require('electron');
const app = require('electron').remote.app
const htmlToText = require('html-to-text');
const remote = require('electron').remote;

const { $_, $_ready, Space, SpaceAdapter, Request, Text } = Artemis;

const Storage = new Space ();

openpgp.initWorker({ path:'node_modules/openpgp/dist/openpgp.worker.min.js' }); // set the relative web worker path

openpgp.config.aead_protect = true; // activate fast AES-GCM mode (not yet OpenPGP standard)

var base = 'https://skrifa.xyz/';

var id, view, deltempid, notebook = 'Inbox', dragging = null, dragTarget = null;

var key = null;

var encryptOptions = null;

var decryptOptions = null;

var currentContent = null;

var unsaved = false;

var settings;

// Colors used for the notes
var colors = [
	'#F06868', '#80D6FF', '#FAB57A', '#41B3D3', '#61D2DC', '#444444', '#63B75D',
	'#217756', '#118DF0', '#FF304F', '#B7569A', '#883C82', '#FFBF00', '#2E3837',
	'#166678', '#7DB9B3', '#76E7C7', '#F26BA3', '#165570', '#FF9F55', '#35A3C5',
	'#FC9C00', '#ED5784', '#C93746', '#9A30DD', '#01C2D6', '#46BEAD', '#3AB4B1',
	'#F7941D', '#F24D16', '#C92E00', '#A81414', '#E55942', '#FF7085', '#4ED887',
	'#0086B3'
];

// Settings variables, some saved for the future
Storage.get ('settings').then ((localSettings) => {
	settings = localSettings;
}).catch (() => {
	settings = {
		autosave: false,
		theme: 'light',
		view: 'grid',
		imageCompression: 'good',
		sort: 'older'
	};
})

const notebooks = new Space (SpaceAdapter.IndexedDB, {
	name: 'Skrifa',
	version: '0.1.0',
	store: 'notebook'
});

notebooks.open ();

const notes = new Space (SpaceAdapter.IndexedDB, {
	name: 'Skrifa',
	version: '0.1.0',
	store: 'note'
});

notes.open ();