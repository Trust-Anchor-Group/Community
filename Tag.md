Title: {{Tag2:=exists(Tag) ? Tag : "Tag"}}
Description: Page dedicated to posts tagged with #{{Tag2}}.
Date: 2022-12-22
Author: Peter Waher
Master: /Community/Master.md
Parameter: Tag

{{
if empty(Tag) then BadRequest("Tag not specified.");

PostFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/PostInline.md",PostFileName) then ServiceUnavailable("Community Service not available.");

N:=5;
Posts:=
	select top N 
		* 
	from 
		Community_Posts 
	inner join 
		Community_PostRef 
	on 
		Community_PostRef.Link=Community_Posts.Link 
	where
		Community_PostRef.Tag=Tag2
	order by 
		Created desc;

LoadMore:=count(Posts)=N;

foreach Post in Posts do
(
	]]

====================

[[;

	]]
((LoadMarkdown(PostFileName) ))

[[;
);
}}

==================

Posts tagged \#{{Tag}}
=======================

No more posts with the given tag could be found. You can go back to the main view by selecting *Home* in the menu above.

{{if LoadMore then ]]
<button id="LoadMoreButton" class='posButton' type="button" onclick='LoadMore(this,((N)),((N)),"","((Tag))")'>Load More</button>
[[}}

