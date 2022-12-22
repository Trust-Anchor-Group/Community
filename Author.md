Title: Author
Description: Page dedicated to an author.
Date: 2022-12-22
Author: Peter Waher
Master: /Community/Master.md
Parameter: Author

{{
if empty(Author) then BadRequest("Author not specified.");

PostFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/PostInline.md",PostFileName) then ServiceUnavailable("Community Service not available.");

N:=5;
Posts:=select top N * from Community_Posts where UserId=Author order by Created desc;
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

Posts by user
==================

No more posts authored by the user could be found. You can go back to the main view by selecting *Home* in the menu above.

{{if LoadMore then ]]
<button id="LoadMoreButton" class='posButton' type="button" onclick='LoadMore(this,((N)),((N)),"((Author))")'>Load More</button>
[[}}

