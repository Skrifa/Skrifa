/**
 * Provides Skrifa's configuration.
 *
 * This file contains the initial configurations,
 * note colors and database information.
 */
MathJax.Hub.Config({
	tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});

const {dialog} = require('electron').remote;
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const $ = require("jquery");
const openpgp = require("openpgp");
const Dexie = require("dexie");
const CryptoJS = require("crypto-js");
const htmlBoilerplatePDF = require('html-boilerplate-pdf');
const upndown = require('upndown');
const mammoth = require("mammoth");

openpgp.initWorker({ path:'node_modules/openpgp/dist/openpgp.worker.min.js' }); // set the relative web worker path

openpgp.config.aead_protect = true; // activate fast AES-GCM mode (not yet OpenPGP standard)


var storage = localStorage;

var base = "https://skrifa.xyz/";

var id, view, deltempid, notebook = "Inbox", dragging = null, dragTarget = null;

var key = null;

var logged = false;

var encryptOptions = null;

var decryptOptions = null;

var currentContent = null;

var unsaved = false;

var colors = [
	"#F06868", "#80D6FF", "#FAB57A", "#41B3D3", "#61D2DC", "#444444", "#63B75D",
	"#217756", "#118DF0", "#FF304F", "#B7569A", "#883C82", "#FFBF00", "#2E3837",
	"#166678", "#7DB9B3", "#76E7C7", "#F26BA3", "#165570", "#FF9F55", "#35A3C5",
	"#FC9C00", "#ED5784", "#C93746", "#9A30DD", "#01C2D6", "#46BEAD", "#3AB4B1",
	"#F7941D", "#F24D16", "#C92E00", "#A81414", "#E55942", "#FF7085", "#4ED887",
	"#0086B3"
];

var settings = {
	autosave: false
};

var db = new Dexie("Skrifa");

db.version(1).stores({
	note: "++id, Title, Content, CreationDate, ModificationDate, SyncDate, Color, Notebook",
	notebook: "++id, Name, Description"
});

// Open the Database
db.open();