AuthenticateSession(Request,"QuickLoginUser");

({
	"link":Required(Str(PLink)),
	"message":Required(Str(PMessage))
}:=Posted) ??? BadRequest("Invalid request.");

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");
if empty(QuickLoginUser.UserName) then BadRequest("User lacks a proper name in the identity.");
if empty(QuickLoginUser.AvatarUrl) then BadRequest("User lacks a proper photo in the identity.");

Post:=select top 1 * from Community_Posts where Link=PLink;
if !exists(Post) then NotFound("Post not found.");

Markdown:="BodyOnly: 1\r\nAllowScriptTag: false\r\n\r\n"+PMessage;
Settings:=Create(Waher.Content.Markdown.MarkdownSettings);
Settings.AllowHtml:=false;
Settings.AllowInlineScript:=false;
Doc:=Waher.Content.Markdown.MarkdownDocument.CreateAsync(Markdown,Settings,[]);
PMessage:=Doc.GenerateMarkdown(true);

SendFormattedMessage(Post.BareJid,PMessage);
