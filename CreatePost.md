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

<button type="button" class="posButton" onclick="CreatePost()">Create</button>
<button type="button" class="negButton" onclick="ClearPost()">Clear</button>

</form>
<fieldset>
<legend>Preview</legend>
<div id="Preview"/>
</fieldset>