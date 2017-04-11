# KickAssets 3 for SilverStripe

KickAssets is a replacement for the *Files & Images* section (AssetAdmin) in SilverStripe CMS. It adds drag-and-drop uploading, mouse and keyboard selection, and a variety of other desktop-like file UI features.

## See it. In 49 Seconds of Superfluous Flair.
<a href="https://vimeo.com/145456487" target="_blank"><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/0.png" width="600"></a>

## Demo
<a href="http://modules.unclecheeseproductions.com/admin" target="_blank">Try it out</a>. 

(User: kickassets / Pass: kickassets)

## Installation

`composer require unclecheese/silverstripe-kickassets`

## Dependencies
* <a href="http://github.com/unclecheese/silverstripe-dropzone">unclecheese/dropzone</a>

## Screenshots

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/1.png" width="600"></p>

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/2.png" width="600"></p>

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/3.png" width="600"></p>

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/4.png" width="600"></p>

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/5.png" width="600"></p>

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/6.png" width="600"></p>

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/7.png" width="600"></p>

<p><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/8.png" width="600"></p>

## JavaScript API

An API is exposed to the entire CMS that allows you to prompt the user to select a file in the KickAssets UI. The following 
```js
$('.select-files').entwine({
	onclick: function(e) {	
		e.preventDefault();
		var $t = this;
		KickAssets.requestFile(function(file) {
			$t.next('ul').append('<li><img src="'+file.iconURL+'"> '+file.filename+'</li>');
		});
	}
});
```

Also available is `KickAssets.requestFiles`, which returns an array of `file` objects.

Optionally, you can pass list of permissions as a first parameter to `requestFile` or `requestFiles`.

```js
$('.select-files').entwine({
	onclick: function(e) {	
		e.preventDefault();
		var $t = this;
		var permissions = {
			folderID: 123, 
			canUpload: false		
		};
		KickAssets.requestFile(permissions, function(file) {
			$t.next('ul').append('<li><img src="'+file.iconURL+'"> '+file.filename+'</li>');
		});
	}
});
```

A full list of permissions:

| Name  | Description  | Default value  |
|---|---|---|
| maxSelection | The maximum number of files that can be selected and returned. 0 for unlimited. | 0 |
| folderID   | The ID of the folder to start in   | 0  |
| canUpload   | Whether the user should be able to upload in the window   | true  |
| canDelete  | Whether the user should be able to delete files or folders in the window  | true  |
| canEdit | Whether the user should be able to edit files in the window | true |
| canCreateFolder | Whether the user should be able to add folders in the window | true |
| allowedTypes | A comma-separated list of file types that can be selected | 'file,image,folder' |


## Usage with UploadField and Dropzone

By default, the `unclecheese/silverstripe-dropzone` module will detect KickAssets and use it on `FileAttachmentField` for selecting existing files.

To get the same behaviour on `UploadField`, ensure the `use_on_uploadfield` setting is set to `true`. (It is by default).

```yaml
KickAssets:
  use_on_uploadfield: true
```

Most settings, such as max files, allowed extensions, and and upload folder will transfer over to the KickAssets window.

## Usage with HTMLEditorField

In addition to the "Insert Media" button that comes with the default configuration of the CMS, KickAssets adds a "Browse files..." buttton that opens the KickAssets window, allowing you to upload, move, edit, and delete files and insert them into the editor at the position of the cursor. 

If you select one or many images, they will be appended to the the editor in the order in which they were selected. If you select a file, it will link any text that is selected in the editor to the URL of that file. If no text is selected and you choose a file, it will insert a link to the file using the title of the file as the clickable text.

## Browser support

Everyone can come to the party except IE9. Sorry.

(I'm not really sorry.)

## Contributing

KickAssets is written in <a target="_blank" href="http://facebook.github.io/react">React JS</a>, and requires transpiling from ES6 and JSX. This is done using <a target="_blank" href="http://webpack.github.io">Webpack</a> and <a href="http://babeljs.io" target="_blank">Babel</a>. You will need to install Webpack on your system.

`npm install -g webpack`

Then, run `npm install` in your `kickassets` module directory to install all of the dependencies.

To start writing code, run:
`webpack --watch`

When finished, create a production bundle by setting an environment file and turning on minification.

`PROD=1 webpack -p`.

If you would prefer not to install webpack globally, there are these handy npm scripts:

- `npm run build` - Does a one time webpack build
- `npm run build:watch` - Equivalent to `webpack --watch`
- `npm run build:prod` - Equivalent to `PROD=1 webpack -p`

## Troubleshooting

While in a developer environment and/or while PHP `E_NOTICE` is enabled, KickAssets will malfunction if your files aren't in sync.

Thankfully, SilverStripe ships with a `BuildTask` that can resolve this. Head to `dev/tasks` and run the "Sync Files & Image Assets".

or

Ring Uncle Cheese.
