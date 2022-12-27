Title: Reply
Description: This page allows you to send a public reply to a post.
Date: 2022-12-22
Author: Peter Waher
Master: Master.md
UserVariable: QuickLoginUser
Login: Login.md
Parameter: PLink
Init: Data/Init.script

================================================================

Publish Reply
================

To publish a reply to the post titled "*{{
if empty(PLink) then BadRequest("Post Link not specified.");

Post:=select top 1 * from Community_Posts where Link=PLink;
if !exists(Post) then NotFound("Post not found.");

Post.Title}}*" by *{{Author:=Post.UserName}}*, type the reply below, and press *Publish*. You can format the reply using 
[Markdown](/Markdown.md). You can see a preview of your reply at the bottom of the page.

**Note**: The reply will be published with information about your identity. Anonymous replies
cannot be published using this service.

<form>

<input type="hidden" name="Type" id="Type" value="Reply"/>
<input type="hidden" name="Title" id="Title" value=""/>
<input type="hidden" name="ReferenceLink" id="ReferenceLink" value="{{PLink}}"/>
<input type="hidden" name="Tag" id="Tag"/>

<p>
<label for="Text">Text of reply:</label>  
<textarea name="Text" id="Text" onkeydown="TrapTab(this,DefaultProperties(),event)" onpaste="PasteContent(this,DefaultProperties(),event)" autofocus required>
</textarea>
</p>

<p>
<ul id="Tags" class="Tags noTags">
<li id="EndOfTags" class="EndOfTags"/>
</ul>
</p>

<button id="CreateButton" type="button" class="disabledButton" onclick="PublishReplyToPost()" disabled="disabled">Publish</button>
<button type="button" class="negButton" onclick="ClearPost()">Clear</button>
<button id="QuoteButton" type="button" onclick="QuotePost('{{PLink}}')">Quote Post</button>
</form>
<fieldset>
<legend>Preview of Response</legend>
<div id="Preview"/>
</fieldset>
<fieldset>
<legend>Post</legend>

{{
PostFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/PostInline.md",PostFileName) then ServiceUnavailable("Community Service not available.");
LoadMarkdown(PostFileName)
}}

</fieldset>