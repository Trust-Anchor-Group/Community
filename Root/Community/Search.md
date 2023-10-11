Title: Search
Description: This page allows you to search for content in the community.
Date: 2023-01-18
Author: Peter Waher
Master: Master.md

================================================================

Search
==========

You can search for content in the Community by providing *keywords* below. Rules for how keywords are interpreted can be found
below.

<form class="searchForm">

<p>
<label for="Query">Query:</label>  
<input type="search" name="Query" id="Query" title="Keywords to search for" autofocus required autocomplete="off" onkeydown="TrapCREsc('SearchButton','ClearButton',event);CheckSearchButton()"/>
</p>

<div class="searchOptions">
<p>
<label for="Source">Source:</label>  
<select name="Source" id="Source" required="required">
<option value="Posts" selected>Posts</option>
<option value="Replies">Replies</option>
</select>
</p>

<p>
<label for="Order">Order:</label>  
<select name="Order" id="Order" required="required">
<option value="Relevance" selected>Relevance</option>
<option value="Occurrences">Occurrences</option>
<option value="Newest">Newest first</option>
<option value="Oldest">Oldest first</option>
</select>
</p>

<p>
<input id="Strict" name="Strict" type="checkbox"/>
<label for="Strict">Strict</label>
</p>
</div>

<button id="SearchButton" type="button" class="disabledButton" onclick="Search()" disabled="disabled">Search</button>
<button id="ClearButton" type="button" class="negButton" onclick="ClearSearch()">Clear</button>

</form>
<fieldset style='display:none'>
<legend>Result</legend>
<div id="Result"></div>
</fieldset>

<fieldset>
<legend>Instructions</legend>

Full-text-search is done providing a query string. This query string contains *keywords*
separated by whitespace. Keywords only consist of *letters* and *digits*, and are
*case insensitive*. Punctuation characters, accents, etc., are ignored. So are a 
configurable set of *[stop words][]*, common words that have little significance in
full-text-search. If the keyword is prefixed with a `+`, it is required to exist. 
If it is prefixed by `-`, it is prohibited. No prefix means it is optional. Wildcards 
`*` are permitted in keywords. You can also use [regular expressions][] by encapsulating it 
between `/` characters, such as `/regex/`. You can search for sequences of keywords by 
encapsulating them between apostrophes `'` or quotes `"`.

[regular expressions]: https://learn.microsoft.com/en-us/dotnet/standard/base-types/regular-expression-language-quick-reference
[stop words]: https://en.wikipedia.org//wiki/Stop_word

Examples:

	Kilroy was here.
	+Kilroy was here.
	+Kilroy was -not here.
	+*roy was -not here.
	+Kil* was -not here.
	+K*y was -not here.
	+/(Kil|Fitz)roy/ was -not here.
	+/Kil(roy|ling)/ was -not here.
	+/K.+y/ was -not here.
	+'Kilroy was here'
	'Kilroy was' here
	Kilroy 'was here'

**Note**: The words `was` and `here` are used as examples only, to highlight syntax. 
They are typically considered *[stop words][]*, and thus ignored in a real search.

</fieldset>
