AuthenticateSession(Request,"QuickLoginUser");

{
	"title":Required(Str(PTitle)),
	"text":Required(Str(PText)),
	"link":Required(Str(PLink)),
	"tags":Required(Str(PTags)[])
}:=Posted;

if empty(PTitle) then BadRequest("Empty title not permitted.");
if empty(PLink) then BadRequest("Empty link not permitted.");
if empty(PText) then BadRequest("Empty text not permitted.");
if empty(QuickLoginUser.Properties.JID) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");
if ((select count(*) from Community_Posts where Link=(Link+Suffix))??0)>0 then BadRequest("Link already taken.");

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
insert into Community_Posts object
{
	Created:TP,
	Updated:TP,
	Link:PLink,
	BareJid:QuickLoginUser.Properties.JID,
	UserName:QuickLoginUser.UserName,
	AvatarUrl:QuickLoginUser.AvatarUrl,
	Title:PTitle,
	Text:PText,
	Tags:PTags,
	Markdown:Result
};

IncCounter("Community.Posts.Created.Total");

foreach Tag in PTags do
	IncCounter("Community.Posts.Created.Tag."+Tag);

GW:=Waher.IoTGateway.Gateway;
FullLink:=GW.GetUrl("/Community/Post/"+PLink);
GW.SendNotification("Community post added ["+PTitle+"]("+FullLink+")");
LogNotice("Community post added.\r\n\r\n"+Result,
{
	"Object":PLink,
	"Actor":QuickLoginUser.Properties.JID,
	"UserName":QuickLoginUser.UserName,
	"AvatarUrl":QuickLoginUser.AvatarUrl,
	"Title":PTitle,
	"URL":FullLink
});

{
	"valid": true,
	"link": "/Community/Post/"+PLink
}

