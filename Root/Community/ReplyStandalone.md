Title: Reply
Description: Contains contents of a community reply.
Date: {{Reply.Updated}}
Author: {{Reply.UserName}}
Master: /Community/Master.md

===========

<div id="{{Reply.ObjectId}}">
<div id="Content{{Reply.ObjectId}}">

{{Reply.Markdown}}

</div>
<hr/>
<div class='footer'>
<a href="/Community/Author/{{Reply.UserId}}">
<img alt='{{Reply.UserName}}' with='64' height='64' src='{{Reply.AvatarUrl}}?Width=64&Height=64'/>
<div class='authorInfo'>
<span class='author'>{{Reply.UserName}}</span>
<br/>
<span class='created'>{{Reply.Created}}</span>
{{if Reply.Updated!=Reply.Created then ]]
<span class='updated'>((Reply.Updated))</span>[[}}
<br/>
<span class='views'>{{IncCounter("Community.Reply.Views."+Reply.ObjectId)}}</span>
<span class='replies' onclick="LoadReplyReplies('{{Reply.Link}}','{{Reply.ObjectId}}');event.preventDefault()">{{NrReplies:=GetCounter("Community.Reply.Replies."+Reply.ObjectId)}}</span>
<span class='upvotes' id="up{{Reply.ObjectId}}" onclick="{{exists(QuickLoginUser) ? ]]VoteReply('((Reply.ObjectId))',true)[[ : ]]DoLogin()[[}};event.preventDefault()">{{Reply.NrUp}}</span>
<span class='downvotes' id="down{{Reply.ObjectId}}" onclick="{{exists(QuickLoginUser) ? ]]VoteReply('((Reply.ObjectId))',false)[[ : ]]DoLogin()[[}};event.preventDefault()">{{Reply.NrDown}}</span>
</div></a>
<div class="toolbar">
<button type="button" onclick="OpenLink('/Community/Reply/{{Reply.ObjectId}}')" title="Direct link to reply." class="unicodeChar">🔗</button>
{{if exists(QuickLoginUser) then
(
	if QuickLoginUser.Properties.JID != Reply.BareJid then ]]<button type="button" onclick="OpenLink('/Community/Message.md?Reply=((Reply.ObjectId))')" title="Send Private Message to author." class="unicodeChar">✉</button>
[[;
	]]<button type="button" onclick="ReplyToReply('((Reply.Link))','((Reply.ObjectId))');event.preventDefault()" title="Write a public response to the reply." class="unicodeChar">↩</button>
[[;
	if QuickLoginUser.Properties.JID = Reply.BareJid then ]]<button type="button" onclick="EditReply('((Reply.ObjectId))')" title="Edit the reply." class="unicodeChar">✎</button>
<button type="button" onclick="DeleteReply('((Reply.ObjectId))')" title="Delete reply." class="unicodeChar negButton">🗑</button>
[[
)}}
</div>
</div>
<div id="editor{{Reply.ObjectId}}"></div>
<div id="reply{{Reply.ObjectId}}"></div>
<div id="replies{{Post.ObjectId}}">

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
		Link=Reply.Link and
		Reply=Reply.ObjectId
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
<button id="LoadMoreButton" class='posButton' type="button" onclick='LoadMoreReplies(this,((N)),((N)),"((Post.Link))",((Reply.ObjectId)))'>Load More</button>
[[;

if !First then ]]</fieldset>[[;

}}

</div>
</div>
