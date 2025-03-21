AuthenticateSession(Request,"QuickLoginUser");

({
	"title":Required(Str(PTitle)),
	"text":Required(Str(PText)),
	"link":Required(Str(PLink)),
	"tags":Required(Str(PTags)[])
}:=Posted) ??? BadRequest("Invalid request.");

if empty(PTitle) then BadRequest("Empty title not permitted.");
if empty(PLink) then BadRequest("Empty link not permitted.");
if empty(PText) then BadRequest("Empty text not permitted.");

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");
if ((select count(*) from Community_Posts where Host=Request.Host and Link=(Link+Suffix))??0)>0 then BadRequest("Link already taken.");

Markdown:="BodyOnly: 1\r\nAllowScriptTag: false\r\n\r\n"+PText;
Settings:=Create(Waher.Content.Markdown.MarkdownSettings);
Settings.AllowHtml:=false;
Settings.AllowInlineScript:=false;
Doc:=Waher.Content.Markdown.MarkdownDocument.CreateAsync(Markdown,Settings,[]);
PText:=Doc.GenerateMarkdown(true);

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
UserId:=Base64UrlEncode(Sha3_256(Utf8Encode(BareJid)));
Post:=insert into Community_Posts object
{
	Created:TP,
	Updated:TP,
	Host:Request.Host,
	Link:PLink,
	BareJid:BareJid,
	UserId:UserId,
	UserName:QuickLoginUser.UserName,
	AvatarUrl:QuickLoginUser.AvatarUrl,
	Title:PTitle,
	Text:PText,
	Tags:PTags,
	Markdown:Result,
	NrUp:0,
	NrDown:0,
	Up:{},
	Down:{}
};

IncCounter("Community.Posts.Created.Total");

foreach Tag in PTags do
(
	insert into Community_PostRef object
	{
		Tag:Tag,
		Created:TP,
		Link:PLink
	};

	IncCounter("Community.Posts.Created.Tag."+Tag);
);

GW:=Waher.IoTGateway.Gateway;
FullLink:=GW.GetUrl("/Community/Post/"+PLink);
GW.SendNotification("Community post added ["+PTitle+"]("+FullLink+")");
LogNotice("Community post added.\r\n\r\n"+Result,
{
	"Object":PLink,
	"Actor":BareJid,
	"UserName":QuickLoginUser.UserName,
	"AvatarUrl":QuickLoginUser.AvatarUrl,
	"Title":PTitle,
	"URL":FullLink
});

PostFileName:=null;
if GW.HttpServer.TryGetFileName("/Community/PostInline.md",PostFileName) then
(
	Html:=MarkdownToHtml(LoadMarkdown(PostFileName));

	Event:=
	{
		ObjectId:Post.ObjectId,
		Html:Html
	};

	PushEvent("/Community/Index.md","PostCreated",Event);
	PushEvent("/Community/Author/"+UserId,"PostCreated",Event);

	foreach Tag in PTags do
		PushEvent("/Community/Tag/"+Tag,"PostCreated",Event);
);

{
	"valid": true,
	"link": "/Community/Post/"+PLink
}

