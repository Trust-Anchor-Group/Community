Title: Reply
Description: This page allows you to send a public reply to a reply.
Date: 2022-12-27
Author: Peter Waher
Master: Master.md
UserVariable: QuickLoginUser
Login: Login.md
Parameter: ReplyId
Init: Data/Init.script

================================================================

Publish Reply
================

To publish a reply to the reply by *{{
if empty(ReplyId) then BadRequest("Reply ID not specified.");

Reply:=select top 1 * from Community_Replies where ObjectId=ReplyId;
if !exists(Reply) then NotFound("Reply not found.");

Author:=Reply.UserName}}*, type the reply below, and press *Publish*. You can format the reply using 
[Markdown](/Markdown.md). You can see a preview of your reply at the bottom of the page.

**Note**: The reply will be published with information about your identity. Anonymous replies
cannot be published using this service.

<form>

<input type="hidden" name="Type" id="Type" value="Reply"/>
<input type="hidden" name="Title" id="Title" value=""/>
<input type="hidden" name="ReferenceLink" id="ReferenceLink" value="{{ReplyId}}"/>
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

<button id="CreateButton" type="button" class="disabledButton" onclick="PublishReplyToReply()" disabled="disabled">Publish</button>
<button type="button" class="negButton" onclick="ClearPost()">Clear</button>
<button type="button" onclick="QuoteReply('{{ReplyId}}')">Quote Reply</button>
</form>
<fieldset>
<legend>Preview of Response</legend>
<div id="Preview"/>
</fieldset>
<fieldset>
<legend>Reply</legend>

{{
ReplyFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/ReplyInline.md",ReplyFileName) then ServiceUnavailable("Community Service not available.");
LoadMarkdown(ReplyFileName)
}}

</fieldset>