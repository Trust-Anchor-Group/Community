Title: Private Message
Description: This page allows you to send a private message to the author of a post.
Date: 2022-12-22
Author: Peter Waher
Master: Master.md
UserVariable: QuickLoginUser
Login: Login.md
Parameter: PLink

================================================================

Send Private Message
======================

To send a private message to **{{
if empty(PLink) then BadRequest("Post Link not specified.");
	
Post:=select top 1 * from Community_Posts where Link=PLink;
if !exists(Post) then NotFound("Post not found.");

Author:=Post.UserName
}}**, type the message below, and press *Send*. You can format the message using 
[Markdown](/Markdown.md). You can see a preview of your message at the bottom of the page.

**Note**: The recipient of messages sent using this form, will also receive information about your identity. Anonymous
messaging cannot be performed using this service.

<form>

<input type="hidden" name="Type" id="Type" value="Message"/>
<input type="hidden" name="Title" id="Title" value=""/>
<input type="hidden" name="ReferenceLink" id="ReferenceLink" value="{{PLink}}"/>
<input type="hidden" name="Tag" id="Tag"/>

<p>
<label for="Text">Text of message:</label>  
<textarea name="Text" id="Text" onkeydown="TrapTab(this,DefaultProperties(),event)" onpaste="PasteContent(this,DefaultProperties(),event)" autofocus required>
</textarea>
</p>

<p>
<ul id="Tags" class="Tags noTags">
<li id="EndOfTags" class="EndOfTags"/>
</ul>
</p>

<button id="CreateButton" type="button" class="disabledButton" onclick="SendMessage()" disabled="disabled">Send</button>
<button type="button" class="negButton" onclick="ClearPost()">Clear</button>
<button type="button" onclick="QuotePost('{{PLink}}',DefaultProperties())">Quote Post</button>

</form>
<fieldset>
<legend>Preview of Private Message</legend>
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