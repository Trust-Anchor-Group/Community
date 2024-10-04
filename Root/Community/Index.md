Title: TAG Community
Description: Main page for the TAG Community service.
Date: 2022-12-16
Author: Peter Waher
Master: Master.md
JavaScript: /MarkdownEditor.js
JavaScript: /MarkdownEditor.md.js
CSS: /MarkdownEditor.cssx

{{
PostFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/PostInline.md",PostFileName) then ServiceUnavailable("Community Service not available.");

N:=5;
Posts:=
	select top N 
		* 
	from 
		Community_Posts 
	order by 
		Created desc;

LoadMore:=count(Posts)=N;

foreach Post in Posts do
(
	]]

====================

((LoadMarkdown(PostFileName) ))

[[;
);
}}

==================

TAG Community
==================

Welcome to TAG Community. You can add posts by going to the *Actions* menu above, and selecting *Create New Post*.

**Note** that posts you add, will be made public in your name. You will however, be able to edit and delete your posts,
if you choose to.

{{if LoadMore then ]]
<button id="LoadMoreButton" class='posButton' type="button" onclick='LoadMore(this,((N)),((N)),"","")'>Load More</button>
[[}}

