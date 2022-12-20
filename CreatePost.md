Title: Create Post
Description: This page allows you to create a new post.
Date: 2022-12-16
Author: Peter Waher
Master: Master.md
UserVariable: QuickLoginUser
Login: Login.md
Init: Data/Init.script

================================================================

Create New Post
==================

To create a new post, add a title and description below. You can format both title and text using [Markdown](/Markdown.md).
You can see a preview of your post at the bottom of the page.

<form>

<p>
<label for="Title">Title:</label>  
<input type="text" name="Title" id="Title" title="Title of post" onkeydown="InvalidatePreview()" autofocus required/>
</p>

<p>
<label for="ReferenceLink">Reference link:</label>  
<input type="text" name="ReferenceLink" id="ReferenceLink" title="Reference link of post" required readonly tabindex="-1"/>
</p>

<p>
<label for="Text">Text of post:</label>  
<textarea name="Text" id="Text" onkeydown="TrapTab(this,event)" required>
</textarea>
</p>

<p>
<label for="Tag">Tag: (Press ENTER to add more than one)</label>  
<input type="text" name="Tag" id="Tag" title="Enter Tag to add" onkeydown="TrapCR(event)" onblur="AddTag()"/>
<ul id="Tags" class="Tags">
<li id="EndOfTags" class="EndOfTags"/>
</ul>
</p>

<button id="CreateButton" type="button" class="disabledButton" onclick="CreatePost()" disabled="disabled">Create</button>
<button type="button" class="negButton" onclick="ClearPost()">Clear</button>

</form>
<fieldset>
<legend>Preview</legend>
<div id="Preview"/>
</fieldset>