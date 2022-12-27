AuthenticateSession(Request,"QuickLoginUser");

{
	"replyId":Required(Str(PReplyId)),
	"message":Required(Str(PMessage))
}:=Posted;

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");

Reply:=select top 1 * from Community_Replies where ObjectId=PReplyId;
if !exists(Reply) then NotFound("Reply not found.");

PMessage:=PMessage.
	Replace("{","\\{").
	Replace("}","\\}").
	Replace("\\\\{","\\{").
	Replace("\\\\}","\\}");

TP:=NowUtc;
Obj:=insert into Community_Replies object
{
	Created:TP,
	Updated:TP,
	Link:Reply.Link,
	Reply:ReplyId,
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

IncCounter("Community.Posts.Replies."+Reply.Link);

while exists(Reply) do
(
	IncCounter("Community.Reply.Replies."+Reply.ObjectId);
	Reply:=empty(Reply.Reply) ? null : select top 1 * from Community_Replies where ObjectId=Reply.Reply;
);

{
	"objectId":Obj.ObjectId
}
