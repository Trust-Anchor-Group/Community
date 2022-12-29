AuthenticateSession(Request,"QuickLoginUser");

ReplyId:=Str(Posted);

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");

Reply:=select top 1 * from Community_Replies where ObjectId=ReplyId;
if !exists(Reply) then NotFound("Reply not found.");
if Reply.BareJid!=BareJid then Forbidden("You can only delete your own replies.");

DeleteObject(Reply);

DecCounter("Community.Posts.Replies."+Reply.Link);
DecCounter("Community.Reply.Views."+ReplyId,GetCounter("Community.Reply.Views."+ReplyId));
DecCounter("Community.Reply.Replies."+ReplyId,GetCounter("Community.Reply.Replies."+ReplyId));

Event:=
{
	ObjectId:ReplyId,
	Link:Reply.Link,
	BareJid:BareJid,
	UserId:Post.UserId,
	UserName:QuickLoginUser.UserName,
	AvatarUrl:QuickLoginUser.AvatarUrl
};

PushEvent("/Community/Index.md","ReplyDeleted",Event);
PushEvent("/Community/Reply/"+ReplyId,"ReplyDeleted",Event);

Post:=select top 1 * from Community_Posts where Link=Reply.Link;
if exists(Post) then
(
	PushEvent("/Community/Author/"+Post.UserId,"ReplyDeleted",Event);
	PushEvent("/Community/Post/"+Post.Link,"ReplyDeleted",Event);

	foreach Tag in Post.Tags do
		PushEvent("/Community/Tag/"+Tag,"ReplyDeleted",Event);
);

Background(
(
	ParentChain:=[];

	ParentId:=Reply.Reply;
	while !empty(ParentId) do
	(
		Parent:=select top 1 * from Community_Replies where ObjectId=ParentId;
		if exists(Parent) then
		(
			ParentChain:=join(ParentChain,Parent);
			ParentId:=Parent.Reply;
		)
		else
			ParentId:=null;
	);

	Branch:={};

	GetBranch(ObjectId,FirstLevel):=
	(
		foreach Reply in select * from Community_Replies where Link=Reply.Link and Reply=Reply.ObjectId do
		(
			Branch[Reply.ObjectId]:=Reply;
			GetBranch(Reply.ObjectId,false);
		)
	);

	GetBranch(Reply.ObjectId,true);

	foreach Parent in ParentChain do
		DecCounter("Community.Reply.Replies."+Parent.ObjectId,Branch.Count);

	DecCounter("Community.Posts.Replies."+Reply.Link,Branch.Count);

	foreach Reply in Branch.Values do
	(
		ReplyId:=Reply.ObjectId;

		DecCounter("Community.Reply.Views."+ReplyId,GetCounter("Community.Reply.Views."+ReplyId));
		DecCounter("Community.Reply.Replies."+ReplyId,GetCounter("Community.Reply.Replies."+ReplyId));

		DeleteObject(Reply);

		Event:=
		{
			ObjectId:ReplyId,
			Link:Reply.Link,
			BareJid:BareJid,
			UserId:Post?.UserId,
			UserName:QuickLoginUser.UserName,
			AvatarUrl:QuickLoginUser.AvatarUrl
		};

		PushEvent("/Community/Index.md","ReplyDeleted",Event);
		PushEvent("/Community/Reply/"+ReplyId,"ReplyDeleted",Event);

		if exists(Post) then
		(
			PushEvent("/Community/Author/"+Post.UserId,"ReplyDeleted",Event);
			PushEvent("/Community/Post/"+Post.Link,"ReplyDeleted",Event);

			foreach Tag in Post.Tags do
				PushEvent("/Community/Tag/"+Tag,"ReplyDeleted",Event);
		);
	)
));

Event
