AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId)),
	"text":Required(Str(PText))
}:=Posted;

if empty(PText) then BadRequest("Empty text not permitted.");

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");

Reply:=select top 1 * from Community_Replies where ObjectId=PObjectId;
if !exists(Reply) then NotFound("Reply not found.");
if Reply.BareJid!=BareJid then Forbidden("You can only update your own replies.");

PText:=PText.
	Replace("{","\\{").
	Replace("}","\\}").
	Replace("\\\\{","\\{").
	Replace("\\\\}","\\}");

TP:=NowUtc;
update Community_Replies
set
	Updated=TP,
	UserName=QuickLoginUser.UserName,
	AvatarUrl=QuickLoginUser.AvatarUrl,
	Markdown=PText
where
	ObjectId=PObjectId;

{
	"valid": true,
	"html": MarkdownToHtml(PText)
}

