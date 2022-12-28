AuthenticateSession(Request,"QuickLoginUser");

PLink:=Str(Posted);

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");

Post:=select top 1 * from Community_Posts where Link=PLink;
if !exists(Post) then NotFound("Post not found.");
if Post.BareJid!=BareJid then Forbidden("You can only delete your own posts.");

PostId:=Post.ObjectId;

delete from Community_PostRef where Link=PLink;
DeleteObject(Post);

DecCounter("Community.Posts.Views."+PLink,GetCounter("Community.Posts.Views."+PLink));
DecCounter("Community.Posts.Replies."+PLink,GetCounter("Community.Posts.Replies."+PLink));
IncCounter("Community.Posts.Deleted.Total");

foreach Tag in Post.Tags do
	DecCounter("Community.Posts.Created.Tag."+Tag);

GW:=Waher.IoTGateway.Gateway;
FullLink:=GW.GetUrl("/Community/Post/"+PLink);
GW.SendNotification("Community post deleted ["+PTitle+"]("+FullLink+")");
LogNotice("Community post deleted.",
{
	"Object":PLink,
	"Actor":BareJid,
	"UserName":QuickLoginUser.UserName,
	"AvatarUrl":QuickLoginUser.AvatarUrl,
	"Title":PTitle,
	"URL":FullLink
});

Event:=
{
	ObjectId:PostId,
	Link:PLink,
	BareJid:BareJid,
	UserId:Post.UserId,
	UserName:QuickLoginUser.UserName,
	AvatarUrl:QuickLoginUser.AvatarUrl
};

PushEvent("/Community/Index.md","PostDeleted",Event);
PushEvent("/Community/Author/"+Post.UserId,"PostDeleted",Event);
PushEvent("/Community/Post/"+Post.Link,"PostDeleted",Event);
PushEvent("/Community/Post/"+Post.Link,"TitleUpdated","-");

foreach Tag in Post.Tags do
	PushEvent("/Community/Tag/"+Tag,"PostDeleted",Event);

Background(
(
	Replies:=select * from Community_Replies where Link=PLink;
	RepliesByReplyId:={};

	foreach Reply in Replies do
		RepliesByReplyId[Reply.ObjectId]:=Reply;

	foreach Reply in Replies do
	(
		ReplyId:=Reply.ObjectId;

		DecCounter("Community.Reply.Views."+ReplyId,GetCounter("Community.Reply.Views."+ReplyId));
		DecCounter("Community.Reply.Replies."+ReplyId,GetCounter("Community.Reply.Replies."+ReplyId));

		DeleteObject(Reply);

		Event:=
		{
			ObjectId:ReplyId,
			Link:PLink,
			BareJid:BareJid,
			UserId:Post.UserId,
			UserName:QuickLoginUser.UserName,
			AvatarUrl:QuickLoginUser.AvatarUrl
		};

		PushEvent("/Community/Index.md","ReplyDeleted",Event);
		PushEvent("/Community/Author/"+Post.UserId,"ReplyDeleted",Event);
		PushEvent("/Community/Post/"+PLink,"ReplyDeleted",Event);
		PushEvent("/Community/Reply/"+ReplyId,"ReplyDeleted",Event);

		ParentReply:=Reply;
		while (!empty(ParentReply.Reply) && RepliesByReplyId.TryGetValue(ParentReply.Reply,ParentReply)) do
		(
			DecCounter("Community.Reply.Replies."+ParentReply.ObjectId,GetCounter("Community.Reply.Replies."+ParentReply.ObjectId));
			PushEvent("/Community/Reply/"+ParentReply.ObjectId,"ReplyDeleted",Event);
		)
	)
));

Str(PostId)
