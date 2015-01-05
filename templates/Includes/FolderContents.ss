	<ul id="kickassets-folder-contents">	
	
	<% if isRoot %>	
	<% else %>
		<% if $CurrentFolder.Parent.ID = 0 %>
		
			<li class="kickassets-item kickassets-folder"  data-update-url="admin/files/updateitem/0" data-id="$CurrentFolder.Parent.ID">
				<a class="" href="admin/files/browse/assets/" >
					<img class="kickassets-icon" src="kickassets/images/icons/arrow-up-grey.png" />
				</a>	
				<span class="kickassets-filename">Up</a>			
			</li>
		
		<% else %>
			
			<li class="kickassets-item kickassets-folder"  data-update-url="$CurrentFolder.Parent.UpdateLink " data-id="$CurrentFolder.Parent.ID">
				<a class="" href="$CurrentFolder.Parent.BrowseLink " >
					<img class="kickassets-icon" src="kickassets/images/icons/arrow-up-grey.png" />
				</a>	
				<span class="kickassets-filename">Up</a>			
			</li>
		
		<% end_if %>
	<% end_if %>
	
	
	
	<% if CurrentFolder.Name %>
		<% with CurrentFolder %>			
			<% if ChildFolders %>
			<% loop ChildFolders %>
				<li class="kickassets-item kickassets-folder" data-update-url="$UpdateLink" data-id="$ID">
					<a class="" href="$BrowseLink">
						<img class="kickassets-icon" src="kickassets/images/icons/folder.png" />
					</a>	
					<span contenteditable class="kickassets-filename">$Title</a>
					
				</li>
			<% end_loop %>
			<% end_if %>	

			<% if ChildFiles %>
			<% loop ChildFiles %>			
				<li class="kickassets-item kickassets-file" data-update-url="$UpdateLink" data-id="$ID">
					<a class="" href="$BrowseLink">
						<% if IsAnImage %>						
						<img class="kickassets-image" src="$CroppedImage(400,400).URL" />
						<% else %>
						<img class="kickassets-icon" src="$KickIcon" />
						<% end_if %>
					</a>
					<span contenteditable class="kickassets-filename">$Title</a>					
				</li>
			<% end_loop %>
			<% end_if %>	

		<% end_with %>
	<% else %>
		<li>This folder doesn't exist yet.</li>
	<% end_if %>	
	</ul>
