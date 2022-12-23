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

TP:=NowUtc;
Obj:=insert into Community_Replies object
{
	Created:TP,
	Updated:TP,
	Link:PLink,
	BareJid:BareJid,
	UserId:Base64UrlEncode(Sha3_256(Utf8Encode(BareJid))),
	UserName:QuickLoginUser.UserName,
	AvatarUrl:QuickLoginUser.AvatarUrl,
	Markdown:PMessage
};

LogDebug(Obj.ObjectId);

IncCounter("Community.Posts.Replies."+PLink);

{
	"objectId":Obj.ObjectId
}
