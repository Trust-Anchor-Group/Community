Title: Reply
Description: Contains contents of a community reply.
Date: {{Reply.Updated}}
Author: {{Reply.UserName}}
Master: /Community/Master.md

===========

<div id="{{ReplyId:=Reply.ObjectId}}">
<div id="Content{{ReplyId}}">

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
<span class='views'>{{IncCounter("Community.Reply.Views."+ReplyId)}}</span>
<span class='replies' onclick="LoadReplyReplies('{{Reply.Link}}','{{ReplyId}}');event.preventDefault()">{{NrReplies:=GetCounter("Community.Reply.Replies."+ReplyId)}}</span>
<span class='upvotes' id="up{{ReplyId}}" onclick="{{exists(QuickLoginUser) ? ]]VoteReply('((ReplyId))',true)[[ : ]]DoLogin()[[}};event.preventDefault()">{{Reply.NrUp}}</span>
<span class='downvotes' id="down{{ReplyId}}" onclick="{{exists(QuickLoginUser) ? ]]VoteReply('((ReplyId))',false)[[ : ]]DoLogin()[[}};event.preventDefault()">{{Reply.NrDown}}</span>
</div></a>
<div class="toolbar">
<button type="button" onclick="OpenLink('/Community/Reply/{{ReplyId}}')" title="Direct link to reply." class="unicodeChar">🔗</button>
{{if exists(QuickLoginUser) then
(
	if QuickLoginUser.Properties.JID != Reply.BareJid then ]]<button id="messageButton((ReplyId))" type="button" onclick="OpenLink('/Community/Message.md?Reply=((ReplyId))')" title="Send Private Message to author." class="unicodeChar">✉</button>
[[;
	]]<button id="replyButton((ReplyId))" type="button" onclick="ReplyToReply('((Reply.Link))','((ReplyId))');event.preventDefault()" title="Write a public response to the reply." class="unicodeChar">↩</button>
[[;
	if QuickLoginUser.Properties.JID = Reply.BareJid then ]]<button id="editButton((ReplyId))" type="button" onclick="EditReply('((ReplyId))')" title="Edit the reply." class="unicodeChar">✎</button>
<button id="deleteButton((ReplyId))" type="button" onclick="DeleteReply('((ReplyId))')" title="Delete reply." class="unicodeChar negButton">🗑</button>
[[
)}}
</div>
</div>
<div id="editor{{ReplyId}}"></div>
<div id="reply{{ReplyId}}"></div>
<div id="replies{{ReplyId}}">

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
		Reply=ReplyId
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
<button id="LoadMoreButton" class='posButton' type="button" onclick='LoadMoreReplies(this,((N)),((N)),"((Post.Link))",((ReplyId)))'>Load More</button>
[[;

if !First then ]]</fieldset>[[;

}}

</div>
</div>
