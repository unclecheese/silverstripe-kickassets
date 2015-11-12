# KickAssets 3 for SilverStripe

KickAssets is a replacement for the *Files & Images* section (AssetAdmin) in SilverStripe CMS. It adds drag-and-drop uploading, mouse and keyboard selection, and a variety of other desktop-like file UI features.

## See it. In 49 Seconds of Superfluous Flair.
<a href="https://vimeo.com/145456487" target="_blank"><img src="https://raw.githubusercontent.com/unclecheese/silverstripe-kickassets/master/images/screenshots/0.png" width="600"></a>

## Installation

`composer require unclecheese/silverstripe-kickassets`

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


## Browser support

Everyone can come to the party except IE9. Sorry.

(Not really.)

## Contributing

KickAssets is written in <a target="_blank" href="http://facebook.github.io/react">React JS</a>, and requires transpiling from ES6 and JSX. This is done using <a target="_blank" href="http://webpack.github.io">Webpack</a> and <a href="http://babeljs.io" target="_blank">Babel</a>. You will need to install Webpack on your system.

`npm install -g webpack`

Then, run `npm install` in your `kickassets` module directory to install all of the dependencies.

To start writing code, run:
`webpack -watch`

When finished, create a production bundle by setting an environment file and turning on minification.

`PROD=1 webpack -p`.

## Troubleshooting

Ring Uncle Cheese.
