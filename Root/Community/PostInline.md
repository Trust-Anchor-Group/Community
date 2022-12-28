<div id="{{PostId:=Str(Post.ObjectId);PostId:=Contains(PostId,":") ? Before(PostId,":") : PostId}}">
<div id="Content{{PostId}}">

{{Post.Markdown}}

</div>
<hr/>
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
<span class='replies' onclick="LoadPostReplies('{{Post.Link}}','{{PostId}}');event.preventDefault()">{{NrReplies:=GetCounter("Community.Posts.Replies."+Post.Link)}}</span>
<span class='upvotes' id="up{{PostId}}" onclick="{{exists(QuickLoginUser) ? ]]VotePost('((PostId))',true)[[ : ]]DoLogin()[[}};event.preventDefault()">{{Post.NrUp}}</span>
<span class='downvotes' id="down{{PostId}}" onclick="{{exists(QuickLoginUser) ? ]]VotePost('((PostId))',false)[[ : ]]DoLogin()[[}};event.preventDefault()">{{Post.NrDown}}</span>
</div></a>
<div class="toolbar">
<button type="button" onclick="OpenLink('/Community/Post/{{Post.Link}}')" title="Direct link to page." class="unicodeChar">🔗</button>
{{if exists(QuickLoginUser) then
(
	if QuickLoginUser.Properties.JID != Post.BareJid then ]]<button type="button" onclick="OpenLink('/Community/Message.md?PLink=((Post.Link))')" title="Send Private Message to author." class="unicodeChar">✉</button>
[[;
	]]<button type="button" onclick="ReplyToPost('((Post.Link))','((PostId))');event.preventDefault()" title="Write a public response to the post." class="unicodeChar">↩</button>
	[[;
	if QuickLoginUser.Properties.JID = Post.BareJid then ]]<button type="button" onclick="EditPost('((PostId))')" title="Edit the post." class="unicodeChar">✎</button>
<button type="button" onclick="DeletePost('((Post.Link))')" title="Delete post." class="unicodeChar negButton">🗑</button>
[[
)}}
</div>
</div>
<div id="editor{{PostId}}"></div>
<div id="reply{{PostId}}"></div>
<div id="replies{{PostId}}"></div>
</div>
