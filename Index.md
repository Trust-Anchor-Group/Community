Title: TAG Community
Description: Main page for the TAG Community service.
Date: 2022-12-16
Author: Peter Waher
Master: Master.md

{{
N:=5;
Posts:=select top N * from Community_Posts order by Created desc;
LoadMore:=count(Posts)=N;

foreach Post in Posts do
(
	]]

====================

[[;

	]]
((Post.Markdown))

----------

<div class='footer'>
[<img alt='((Post.UserName))' with='64' height='64' src='((Post.AvatarUrl))?Width=64&Height=64'/>
<div class='authorInfo'>
<span class='author'>((Post.UserName))</span>
<br/>
<span class='created'>((Post.Created))</span>[[;

	if Post.Updated!=Post.Created then ]]
<br/><span class='updated'>((Post.Updated))</span>[[;

	]]
</div>](#)
<div class="toolbar">
<button type="button" onclick="OpenLink('Post/((Post.Link))')">Link</button>
</div></div>

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
<button id="LoadMoreButton" class='posButton' type="button" onclick='LoadMore(this,((N)),((N)))'>Load More</button>
[[}}

