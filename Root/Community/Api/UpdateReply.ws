AuthenticateSession(Request,"QuickLoginUser");

({
	"objectId":Required(Str(PObjectId)),
	"text":Required(Str(PText))
}:=Posted) ??? BadRequest("Invalid request.");

if empty(PText) then BadRequest("Empty text not permitted.");

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");

Reply:=select top 1 * from Community_Replies where ObjectId=PObjectId;
if !exists(Reply) then NotFound("Reply not found.");
if Reply.BareJid!=BareJid then Forbidden("You can only update your own replies.");

Post:=select top 1 * from Community_Posts where Link=Reply.Link;
if !exists(Post) then NotFound("Post not found.");

Markdown:="BodyOnly: 1\r\nAllowScriptTag: false\r\n\r\n"+PText;
Settings:=Create(Waher.Content.Markdown.MarkdownSettings);
Settings.AllowHtml:=false;
Settings.AllowInlineScript:=false;
Doc:=Waher.Content.Markdown.MarkdownDocument.CreateAsync(Markdown,Settings,[]);
PText:=Doc.GenerateMarkdown(true);

TP:=NowUtc;
update Community_Replies
set
	Updated=TP,
	UserName=QuickLoginUser.UserName,
	AvatarUrl=QuickLoginUser.AvatarUrl,
	Markdown=PText
where
	ObjectId=PObjectId;

ParentChain:=[];

ParentId:=Reply.Reply;
while !empty(ParentId) do
(
	Parent:=select top 1 * from Community_Replies where ObjectId=ParentId;
	if exists(Parent) then
	(
		ParentChain:=join(ParentChain,Parent.ObjectId);
		ParentId:=Parent.Reply;
	)
	else
		ParentId:=null;
);

Html:=MarkdownToHtml(PText);
Event:=
{
	ObjectId:Reply.ObjectId,
	Updated:TP.ToLocalTime().ToString(),
	Html:Html
};

PushEvent("/Community/Index.md","ReplyUpdated",Event);
PushEvent("/Community/Author/"+Post.UserId,"ReplyUpdated",Event);
PushEvent("/Community/Post/"+Post.Link,"ReplyUpdated",Event);
PushEvent("/Community/Reply/"+Reply.ObjectId,"ReplyUpdated",Event);

foreach Tag in Post.Tags do
	PushEvent("/Community/Tag/"+Tag,"ReplyUpdated",Event);

foreach ParentId in ParentChain do
	PushEvent("/Community/Reply/"+ParentId,"ReplyUpdated",Event);

{
	"valid": true,
	"html": Html
}

