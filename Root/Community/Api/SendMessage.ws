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

SendFormattedMessage(Post.BareJid,PMessage);
