AuthenticateSession(Request,"QuickLoginUser");

({
	"objectId":Required(Str(PObjectId))
}:=Posted) ??? BadRequest("Invalid request.");

Post:=select top 1 * from Community_Posts where ObjectId=PObjectId;
if !exists(Post) then NotFound("Post not found.");
if Post.BareJid!=QuickLoginUser.Properties.JID then Forbidden("Post is not yours.");

{
	"Title":Post.Title,
	"Text":Post.Text,
	"Html":MarkdownToHtml(Post.Markdown),
	"Tags":Post.Tags
}
