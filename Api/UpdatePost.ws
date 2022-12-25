AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId)),
	"title":Required(Str(PTitle)),
	"text":Required(Str(PText)),
	"tags":Required(Str(PTags)[])
}:=Posted;

if empty(PTitle) then BadRequest("Empty title not permitted.");
if empty(PText) then BadRequest("Empty text not permitted.");

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");

Post:=select top 1 * from Community_Posts where ObjectId=PObjectId;
if !exists(Post) then NotFound("Post not found.");
if Post.BareJid!=BareJid then Forbidden("You can only update your own posts.");

PText:=PText.
	Replace("{","\\{").
	Replace("}","\\}").
	Replace("\\\\{","\\{").
	Replace("\\\\}","\\}");

Result:="# " + PTitle + "\r\n\r\n" + PText + "\r\n\r\n";

First:=true;
foreach Tag in PTags do
(
	if First then
		First:=false
	else
		Result+=",\r\n";

	Result+="[\\#"+MarkdownEncode(Tag)+"](/Community/Tag/"+UrlEncode(Tag)+")";
);

TP:=NowUtc;
update Community_Posts
set
	Updated=TP,
	UserName=QuickLoginUser.UserName,
	AvatarUrl=QuickLoginUser.AvatarUrl,
	Title=PTitle,
	Text=PText,
	Tags=PTags,
	Markdown=Result
where
	ObjectId=PObjectId;

PrevTags:={};
foreach Tag in Post.Tags do PrevTags[Tag]:=true;

CurrentTags:={};
foreach Tag in PTags do CurrentTags[Tag]:=true;

foreach Tag in CurrentTags.Keys do
(
	if !PrevTags.Remove(Tag) then
	(
		insert into Community_PostRef object
		{
			Tag:Tag,
			Created:Post.Created,
			Link:Post.Link
		};

		IncCounter("Community.Posts.Created.Tag."+Tag);
	)
);

foreach Tag in PrevTags.Keys do
(
	delete from Community_PostRef where Tag=Tag and Link=Post.Link;
	DecCounter("Community.Posts.Created.Tag."+Tag);
);

GW:=Waher.IoTGateway.Gateway;
FullLink:=GW.GetUrl("/Community/Post/"+Post.Link);
GW.SendNotification("Community post updated ["+PTitle+"]("+FullLink+")");
LogNotice("Community post updated.\r\n\r\n"+Result,
{
	"Object":Post.Link,
	"Actor":BareJid,
	"UserName":QuickLoginUser.UserName,
	"AvatarUrl":QuickLoginUser.AvatarUrl,
	"Title":PTitle,
	"URL":FullLink
});

{
	"valid": true,
	"link": "/Community/Post/"+Post.Link,
	"html": MarkdownToHtml(Result)
}

