require('../../css/bootstrap.css');
require('../../css/kickassets.less');

import React from 'react';
import Router from 'react-router';
import KickAssets from './pages/KickAssets';
import Main from './pages/Main';
import Browse from './pages/Browse';
import ItemEditFormContainer from './containers/ItemEditFormContainer';
import SearchPanelContainer from './containers/SearchPanelContainer';
import MovePanelContainer from './containers/MovePanelContainer';
import Config from './stores/Config';

const Route = Router.Route;

Config.init(window.KickAssetsConfig);

const routes = (	
	<Route path={Config.get('baseRoute')} name="home" handler={KickAssets}>	    
	      <Route name="main" path="show/:folderID" handler={Main}>
	      	<Route name="edit" path="edit/:fileID" handler={ItemEditFormContainer} />
	      	<Route name="search" path="search" handler={SearchPanelContainer} />
	      	<Route name="move" path="move" handler={MovePanelContainer} />
	      </Route>
	      <Router.Redirect from="" to="main" params={{folderID: 0}} />
    </Route>
);

let RootComponent;
Router.run(routes, Router.HistoryLocation, function (Handler) {
  RootComponent = React.render(<Handler />, document.getElementById('app'));
});