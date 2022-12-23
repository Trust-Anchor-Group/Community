<div id="{{Reply.ObjectId}}">

{{Reply.Markdown}}

----------

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
<span class='replies' onclick="OpenLink('/Community/Reply/{{Reply.ObjectId}}')">{{NrReplies:=GetCounter("Community.Reply.Replies."+Reply.ObjectId)}}</span>
</div></a>
<div class="toolbar">
<button type="button" onclick="OpenLink('/Community/Reply/{{Reply.ObjectId}}')" class="unicodeChar">🔗</button>
<button type="button" onclick="OpenLink('/Community/Message.md?Reply={{Reply.ObjectId}}')" class="unicodeChar">✉</button>
<button type="button" onclick="OpenLink('/Community/Reply.md?Reply={{Reply.ObjectId}}')" class="unicodeChar">↩</button>
</div>
</div>
</div>
