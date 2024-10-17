JavaScript: /Nav.js

<header id="native-header">
<nav>
<div>
<button id="toggle-nav" onClick="nativeHeader.ToggleNav()">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
</svg>
</button>
<p id="small-pagpage-name">
**[%Title]**
</p>
</div>
<nav>

* &#9776;
* [Home](/Community/Index.md)
* [Order](#)
	* [Most Views](#)
	* [Most Interactions](#)
	* [Newest](#)
* [Tags](/Community/Tags.md){{
if !exists(Global.CommunityTags) or Global.CommunityTags.Timestamp.Subtract(Now).TotalMinutes>=5 then
(
	Global.CommunityTags:=
	{
		"Tags":(select top 20 Key.Substring(28) from RuntimeCounter where Key like "Community.Posts.Created.Tag%" and Counter>0 order by Counter desc),
		"Timestamp":Now
	}
);

foreach Tag in Global.CommunityTags.Tags do ]]
	* [((MarkdownEncode(Tag) ))](/Community/Tag/((Tag)))[[
}}
* [%Title]
* {{exists(QuickLoginUser)?]][<img id='userAvatar' alt="((QuickLoginUser.UserName))" with="40" height="40" src="((QuickLoginUser.AvatarUrl))?Width=40&Height=40"/> ((QuickLoginUser.UserName))](#)
	* [Logout](/Community/LogOut.md)[[ : ]]<a href="/Community/Login.md?from=((UrlEncode(Request.Header.GetURL() ) ))">Login</a>[[}}
* [Help](#)
	* [Tutorial](#)
	* [Markdown](/Markdown.md)
	* [Emojis](/Emojis.md)
	* [Script](/Script.md)
	* [LinkedIn](https://www.linkedin.com/in/peterwaher/)
	* [Contact](https://waher.se/Feedback.md)
* [Actions](#)
	* [Create New Post](/Community/CreatePost.md)
	* [Search](/Community/Search.md)

</nav>
</header>