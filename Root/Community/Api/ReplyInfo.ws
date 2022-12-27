AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId))
}:=Posted;

Reply:=select top 1 * from Community_Replies where ObjectId=PObjectId;
if !exists(Reply) then NotFound("Reply not found.");
if Reply.BareJid!=QuickLoginUser.Properties.JID then Forbidden("Reply is not yours.");

{
	"Text":Reply.Markdown,
	"Html":MarkdownToHtml(Reply.Markdown)
}
