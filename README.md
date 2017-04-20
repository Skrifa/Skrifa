# Skrifa

A note taking app focused on simplicity and privacy using PGP to encrypt all your notes.

From school to your office, Skrifa is the word processor for everyone.

With a minimal, distraction free, simple and yet powerful interface, it's focused on what you really care, your content. It is so versatile that you'll have no problem using it for any scenario, as a power user or just as a simple quick note taking app.

From text styling to videos and images, and there are also features for more specific things like **writing code, math and data tables**

### Writing Math
Having a suitable notebook for any ocation is something we all need, Skrifa has Mathjax capabilities so that you can write math formulas and some LaTEX code, ideal for students and people who work with math!

### Writing Code
Thanks to Prism.js Skrifa also has code highlightning for you!

### How Skrifa Protects Your Privacy
When registering for a Skrifa account you'll be asked for an email address and password. Once you've downloaded the app you'll create a new PGP key which will be used to encrypt all your notes, this key will be created using a new passphrase you'll set up, using that passphrase your key will be encrypted and saved locally, an encrypted version of your key is also uploaded to the server so that you won't have to manage it manually. This behaviour is fairly similar to the one used by [Proton Mail](https://protonmail.com/). If you don't want to use an Skrifa acccount and rely your key to a server, you can also use a PGP key you already own or create a new one, while this may be more secure, it also comes with great responsibility since you'll have to backup your key, remember that key is the only way to access your notes!

Finally, every time you start skrifa you'll be asked to enter your key's passphrase in order to decrypt it and decrypt your notes, every note and notebook you create is encrypted using that key and only you will be able to read it.

### Sharing Notes
Sharing notes is incredibly easy, if you are sharing the note with a registered Skrifa user, all you'll need is his/her username and a Skfira Note will be created for you to share it.
If you are sharing the note with a Skrifa user who uses an offline key, then you'll need his public key, a dialog will appear asking you to select the public key you want to share the note with.

## Contributing
There are several ways you can contribute to the development of Skrifa

### Creating a new Theme
Creating a new CSS theme is incredibly easy! All you have to do is copy the `theme-template.css` file into a file with your theme's name inside the themes directory.
This file already has a lot of the common elements you'll need to style in order to create a functional theme, once you've copied the file, the next step is to rename the theme class to your theme's name, using a find and replace all utility is pretty useful!

To load your theme, you'll need to add the stylesheet link in the `index.html` file as well as adding the option in the select element inside the settings view, remember the value of the select must match the class name of your theme!

### Adding functionality
Skrifa is very extensible and you can add all kinds of functionality, from utilities for the editor to new export formats or encryption features. You may know Skrifa is divided in views or screens, each view has a javascript file that contains all it's functionality.

If you want to add a new view, you'll need to create it inside the `index.html` file and add a javascript file for it's functionality.

### Reporting a Bug
If you've found an error please report it so it can be fixed, describe the error and what you were doing while it happened.

### Buying Skrifa
Skrifa is a pay-what-you-want software, every time someone pays for skrifa, the payment will be dividad 50/50 between the developers and donations for the projects Skrifa uses.

### Supporting via Patreon
You can support me via [Patreon](https://www.patreon.com/Hyuchia), by supporting me via patreon you are not only contributing to this project but also all my other projects and contributions!

### Fixing a Bug
If you've found a bug and you are willing to fix it, just clone this repository, fix the bug and make a Pull Request, your code will be evaluated and then merged to the main branch, it really is simple to contribute!

## License
Skrifa is released under the [GPLv3.0 License](https://github.com/Skrifa/Skrifa/blob/master/LICENSE)
