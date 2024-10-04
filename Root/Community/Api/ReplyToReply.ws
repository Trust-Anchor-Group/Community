AuthenticateSession(Request,"QuickLoginUser");

({
	"replyId":Required(Str(PReplyId)),
	"message":Required(Str(PMessage))
}:=Posted) ??? BadRequest("Invalid request.");

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");

ParentReply:=select top 1 * from Community_Replies where ObjectId=PReplyId;
if !exists(ParentReply) then NotFound("Reply not found.");

Post:=select top 1 * from Community_Posts where Link=ParentReply.Link;
if !exists(Post) then NotFound("Post not found.");

Markdown:="BodyOnly: 1\r\nAllowScriptTag: false\r\n\r\n"+PMessage;
Settings:=Create(Waher.Content.Markdown.MarkdownSettings);
Settings.AllowHtml:=false;
Settings.AllowInlineScript:=false;
Doc:=Waher.Content.Markdown.MarkdownDocument.CreateAsync(Markdown,Settings,[]);
PMessage:=Doc.GenerateMarkdown(true);

TP:=NowUtc;
Reply:=insert into Community_Replies object
{
	Created:TP,
	Updated:TP,
	Link:ParentReply.Link,
	Reply:PReplyId,
	BareJid:BareJid,
	UserId:Base64UrlEncode(Sha3_256(Utf8Encode(BareJid))),
	UserName:QuickLoginUser.UserName,
	AvatarUrl:QuickLoginUser.AvatarUrl,
	Markdown:PMessage,
	NrUp:0,
	NrDown:0,
	Up:{},
	Down:{}
};

IncCounter("Community.Posts.Replies."+ParentReply.Link);

ParentChain:=[ParentReply.ObjectId];

ParentId:=ParentReply.Reply;
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

ReplyFileName:=null;
if GW.HttpServer.TryGetFileName("/Community/ReplyInline.md",ReplyFileName) then
(
	Event:=
	{
		"ParentId":PReplyId,
		"ObjectId":Reply.ObjectId,
		"PostId":Post.ObjectId,
		"ParentChain":ParentChain,
		"Html":MarkdownToHtml(LoadMarkdown(ReplyFileName))
	};

	PushEvent("/Community/Index.md","ReplyCreated",Event);
	PushEvent("/Community/Author/"+Post.UserId,"ReplyCreated",Event);
	PushEvent("/Community/Post/"+Post.Link,"ReplyCreated",Event);

	foreach Tag in Post.Tags do
		PushEvent("/Community/Tag/"+Tag,"ReplyCreated",Event);

	foreach ParentId in ParentChain do
	(
		IncCounter("Community.Reply.Replies."+ParentId);
		PushEvent("/Community/Reply/"+ParentId,"ReplyCreated",Event);
	)
);

{
	"objectId":Reply.ObjectId
}
