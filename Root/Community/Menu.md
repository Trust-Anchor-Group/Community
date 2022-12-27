<header id="header">
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
* {{exists(QuickLoginUser)?]][<img alt="((QuickLoginUser.UserName))" with="40" height="40" src="((QuickLoginUser.AvatarUrl))?Width=40&Height=40"/> ((QuickLoginUser.UserName))](#)
	* [Logout](/Community/LogOut.md)[[ : ]][Login](/Community/Login.md)[[}}
* [Help](#)
	* [Tutorial](#)
	* [Markdown](/Markdown.md)
	* [Emojis](/Emojis.md)
	* [Script](/Script.md)
	* [LinkedIn](https://www.linkedin.com/in/peterwaher/)
	* [Contact](https://waher.se/Feedback.md)
* [Actions](#)
	* [Create New Post](/Community/CreatePost.md)
	* [Search](#)

</nav>
</header>