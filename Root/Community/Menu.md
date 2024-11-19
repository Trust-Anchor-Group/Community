JavaScript: /Master.js

<header id="native-header">
<nav>
<div>
<button id="toggle-nav" onClick="nativeHeader.ToggleNav()">☰</button>
<p id="small-pagpage-name">
**[%Title]**
</p>
</div>

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
* <p id="large-pagpage-name"> [%Title] </p>
* [Actions](#)
	* [Create New Post](/Community/CreatePost.md)
	* [Search](/Community/Search.md)
* [Help](#)
	* [Tutorial](#)
	* [Markdown](/Markdown.md)
	* [Emojis](/Emojis.md)
	* [Script](/Script.md)
	* [LinkedIn](https://www.linkedin.com/in/peterwaher/)
	* [Contact](https://waher.se/Feedback.md)
* {{exists(QuickLoginUser)?]][<img id='userAvatar' alt="((QuickLoginUser.UserName))" with="40" height="40" src="((QuickLoginUser.AvatarUrl))?Width=40&Height=40"/> ((QuickLoginUser.UserName))](#)
	* [Logout](/Community/LogOut.md)[[ : ]]<a href="/Community/Login.md?from=((UrlEncode(Request.Header.GetURL() ) ))">Login</a>[[}}

</nav>
</header>