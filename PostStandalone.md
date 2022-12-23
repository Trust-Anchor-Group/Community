Title: {{Post.Title}}
Description: Contains contents of a community post.
Date: {{Post.Updated}}
Author: {{Post.UserName}}
Master: /Community/Master.md

===========

<div id="{{Post.ObjectId}}">

{{Post.Markdown}}

----------

<div class='footer'>
<a href="/Community/Author/{{Post.UserId}}">
<img alt='{{Post.UserName}}' with='64' height='64' src='{{Post.AvatarUrl}}?Width=64&Height=64'/>
<div class='authorInfo'>
<span class='author'>{{Post.UserName}}</span>
<br/>
<span class='created'>{{Post.Created}}</span>
{{if Post.Updated!=Post.Created then ]]
<span class='updated'>((Post.Updated))</span>[[}}
<br/>
<span class='views'>{{IncCounter("Community.Posts.Views."+Post.Link)}}</span>
<span class='replies' onclick="OpenLink('/Community/Post/{{Post.Link}}');event.preventDefault()">{{NrReplies:=GetCounter("Community.Posts.Replies."+Post.Link)}}</span>
</div></a>
<div class="toolbar">
<button type="button" onclick="OpenLink('/Community/Post/{{Post.Link}}')" class="unicodeChar">🔗</button>
<button type="button" onclick="OpenLink('/Community/Message.md?PLink={{Post.Link}}')" class="unicodeChar">✉</button>
<button type="button" onclick="OpenLink('/Community/Reply.md?PLink={{Post.Link}}')" class="unicodeChar">↩</button>
</div>
</div>

{{
ReplyFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/ReplyInline.md",ReplyFileName) then ServiceUnavailable("Community Service not available.");

N:=5;
Replies:=
	select top N 
		* 
	from 
		Community_Replies
	where
		Link=Post.Link and
		Reply=""
	order by 
		Created desc;

LoadMore:=count(Replies)=N;
First:=true;

foreach Reply in Replies do
(
	if First then
	(
		First:=false;
		]]<fieldset><legend>Responses</legend>[[
	);

	]]

<section>

((LoadMarkdown(ReplyFileName) ))

</section>
[[;
);

if LoadMore then ]]
<button id="LoadMoreButton" class='posButton' type="button" onclick='LoadMoreReplies(this,((N)),((N)),"((Post.Link))","")'>Load More</button>
[[;

if !First then ]]</fieldset>[[;

}}

</div>
