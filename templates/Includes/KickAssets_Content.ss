<div id="kickassets" class="cms-content center " data-layout-type="border" data-pjax-fragment="Content" data-upload-url="$Link(upload)/$CurrentFolder.ID" data-base-url="$Link">
	<div class="cms-content-header north">
		<div class="cms-content-header-info">
			<h2>
				<div class="breadcrumbs-wrapper" data-pjax-fragment="Breadcrumbs">
					<span class="section-icon icon icon-16 icon-{$MenuCurrentItem.Code.LowerCase}"></span>
					<span class="cms-panel-link crumb last"><% _t('KickAssets.BROWSEFILES', 'Browse Files') %></span>:					
					<% loop FolderBreadcrumbs %>
						<% if Last %>
							<span class="cms-panel-link crumb last">$Name</span>
						<% else %>
							<a class="cms-panel-link crumb" href="$BrowseLink">$Name</a>
							<span class="sep">/</span>
						<% end_if %>
					<% end_loop %>
				</div>
				<div class="kickassets-actions">

					<button data-url="$Link(newfolder)/$CurrentFolder.ID" class="ss-ui-button ss-ui-action-constructive kickassets-list-refresh newfolder"><% _t('KickAssets.NEWFOLDER','New folder') %></button>
	                <span class="ss-ui-button fileinput-button">	                    
	                    <span><% _t('Kickassets.ADDFILES','Add file(s)') %>...</span>
	                    <input type="file" name="files[]" multiple>
	                </span>

				</div>
			</h2>
		</div>	
	</div>	
	<div id="kickassets-main" data-refresh-url="$Link(browse)/$CurrentFolder.Filename?refresh=1" data-move-url="$Link(moveitems)" >
			<% include FolderContents %>

	</div>
	<div id="kickassets-toolbar">
		<div id="kickassets-progress-all-wrap">
			<input type="text" id="kickassets-progress-all" class="kickassets-progress global" data-width="32" data-height="32">
		</div>
		<div id="kickassets-slider"></div>
		<div class="kickassets-toolbar-actions">
			<button class="kickassets-bulk-action delete" data-url="$Link(deleteitems)"><% _t('KickAssets.DELETESELECTED','Delete selected') %></button>
		</div>
	</div>

	<div id="kickassets-edit-form">

	</div>
</div>







