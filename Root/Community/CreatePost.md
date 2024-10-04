Title: Create Post
Description: This page allows you to create a new post.
Date: 2022-12-16
Author: Peter Waher
Master: Master.md
UserVariable: QuickLoginUser
Login: Login.md

================================================================

Create New Post
==================

To create a new post, add a title and description below. You can format both title and text using [Markdown](/Markdown.md).
Make sure to tag your post appropriately, so that it is displayed in the correct channels. You can see a preview of your post 
at the bottom of the page.

<form>

<input type="hidden" name="Type" id="Type" value="Post"/>

<p>
<label for="Title">Title:</label>  
<input type="text" name="Title" id="Title" title="Title of post" oninput="UpdateReferenceLink()" autofocus required autocomplete="off"/>
</p>

<p>
<label for="ReferenceLink">Reference link:</label>  
<input type="text" name="ReferenceLink" id="ReferenceLink" title="Reference link of post" required readonly tabindex="-1"/>
</p>

<p>
<label for="Text">Text of post:</label>  
![](/MarkdownEditor.md)
<textarea name="Text" id="Text" onkeydown="TrapTab(this,DefaultProperties(),event)" onpaste="PasteContent(this,DefaultProperties(),event)" oninput="AdaptSize(this)" required>
</textarea>
</p>

<p>
<ul id="Tags" class="Tags noTags">
<li id="EndOfTags" class="EndOfTags"/>
</ul>
</p>

<p>
<label for="Tag">Tag: (Press ENTER to add more than one)</label>  
<input type="text" class="TagInput" name="Tag" id="Tag" title="Enter Tag to add" onkeydown="TrapTagKey(DefaultProperties(),event)" oninput="UpdateTagSuggestions(this,DefaultProperties())" autocomplete="off"/>
</p>

<p>
<ul id="SuggestedTags" class="Tags noTags Suggestion">
<li class="EndOfTags"/>
</ul>
<p>

<button id="CreateButton" type="button" class="posButton" onclick="CreatePost()">Create</button>
<button type="button" class="negButton" onclick="ClearPost()">Clear</button>

</form>