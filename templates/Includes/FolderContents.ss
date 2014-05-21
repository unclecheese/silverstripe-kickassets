	<ul id="kickassets-folder-contents">	
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
