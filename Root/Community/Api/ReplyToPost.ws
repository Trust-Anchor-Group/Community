AuthenticateSession(Request,"QuickLoginUser");

{
	"link":Required(Str(PLink)),
	"message":Required(Str(PMessage))
}:=Posted;

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");

Post:=select top 1 * from Community_Posts where Link=PLink;
if !exists(Post) then NotFound("Post not found.");

PMessage:=PMessage.
	Replace("{","\\{").
	Replace("}","\\}").
	Replace("\\\\{","\\{").
	Replace("\\\\}","\\}");

TP:=NowUtc;
Reply:=insert into Community_Replies object
{
	Created:TP,
	Updated:TP,
	Link:PLink,
	Reply:"",
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

IncCounter("Community.Posts.Replies."+PLink);

ReplyFileName:=null;
if GW.HttpServer.TryGetFileName("/Community/ReplyInline.md",ReplyFileName) then
(
	Event:=
	{
		"ParentId":Post.ObjectId,
		"ObjectId":Reply.ObjectId,
		"PostId":Post.ObjectId,
		"ParentChain":[],
		"Html":MarkdownToHtml(LoadMarkdown(ReplyFileName))
	};

	PushEvent("/Community/Index.md","ReplyCreated",Event);
	PushEvent("/Community/Author/"+Post.UserId,"ReplyCreated",Event);
	PushEvent("/Community/Post/"+Post.Link,"ReplyCreated",Event);

	foreach Tag in Post.Tags do
		PushEvent("/Community/Tag/"+Tag,"ReplyCreated",Event);
);

{
	"objectId":Reply.ObjectId
}
