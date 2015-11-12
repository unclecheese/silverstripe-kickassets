import Reflux from 'reflux';
import assign from 'object-assign';

let Router;

const Navigation = Reflux.createActions([
	'initRouter',
	'goToFolder',
	'goToEditItem',
	'goToSearch',
	'updateSort',
	'updateView',
	'goToMoveItems',
	'goToAllFiles',
	'goToRecentFiles'
]);

Navigation.initRouter.listen(router => {	
	Router = router;
});

Navigation.goToFolder.listen((folderID) => {
	Router.transitionTo(
		'main', 
		{folderID},
		{
			sort: Router.getCurrentQuery().sort,
			view: Router.getCurrentQuery().view
		}
	);
});

Navigation.goToAllFiles.listen(() => {
	return Navigation.goToFolder(0);
});

Navigation.goToRecentFiles.listen(() => {
	Router.transitionTo(
		'main', 
		{folderID : 'recent'},
		{
			sort: 'latest',
			view: Router.getCurrentQuery().view
		}
	);

});

Navigation.goToEditItem.listen((item) => {		
	Router.transitionTo(
		'edit', 
		{
			folderID: item.parentID,
			fileID: item.id,
		}, 
		{
			sort: Router.getCurrentQuery().sort,
			view: Router.getCurrentQuery().view
		}
	);
});

Navigation.goToSearch.listen((folderID, term) => {
	const q = assign({}, Router.getCurrentQuery(), {q: term});	
	
	Router.transitionTo(
		'search',
		{folderID},
		q
	);
});

Navigation.updateSort.listen((sort) => {
	const newQuery = cleanQueryString({sort});

	return Router.transitionTo(
		Router.getCurrentPathname(), 
		{}, 
		newQuery
	);
});

Navigation.updateView.listen((view) => {
	const newQuery = cleanQueryString({view});

	return Router.transitionTo(
		Router.getCurrentPathname(), 
		{}, 
		newQuery
	);
});

Navigation.goToMoveItems.listen((folderID, items) => {
	return Router.transitionTo(
		'move',
		{folderID},
		Router.getCurrentQuery()
	);
})

const cleanQueryString = (params) => {
	const query = assign({}, 
		Router.getCurrentQuery(),
		params
	);

	for(var i in query) {
		if(query[i] === null) delete query[i];
	}

	return query;
};


export default Navigation;