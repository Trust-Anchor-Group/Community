AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId)),
	"up":Required(Boolean(PUp))
}:=Posted;

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");

Reply:=select top 1 * from Community_Replies where ObjectId=PObjectId;
if !exists(Reply) then NotFound("Reply not found.");

Post:=select top 1 * from Community_Posts where Link=Reply.Link;
if !exists(Post) then NotFound("Post not found.");

if PUp then
(
	Reply.Up[BareJid]:=true;
	Reply.Down.Remove(BareJid);
)
else
(
	Reply.Down[BareJid]:=true;
	Reply.Up.Remove(BareJid);
);

Reply.NrUp:=Reply.Up.Count;
Reply.NrDown:=Reply.Down.Count;
UpdateObject(Reply);

ParentChain:=[];

ParentId:=Reply.Reply;
while !empty(ParentId) do
(
	Parent:=select top 1 * from Community_Replies where ObjectId=ParentId;
	if exists(Parent) then
	(
		ParentChain:=join(ParentChain,Parent.ObjectId);
		ParentId:=Parent.Reply;
	)
	else
		ParentId:=null;
);

Event:=
{
	ObjectId:Reply.ObjectId,
	NrUp:Reply.NrUp,
	NrDown:Reply.NrDown
};

PushEvent("/Community/Index.md","VotesUpdated",Event);
PushEvent("/Community/Author/"+Post.UserId,"VotesUpdated",Event);
PushEvent("/Community/Post/"+Post.Link,"VotesUpdated",Event);
PushEvent("/Community/Reply/"+Reply.ObjectId,"VotesUpdated",Event);

foreach Tag in Post.Tags do
	PushEvent("/Community/Tag/"+Tag,"VotesUpdated",Event);

foreach ParentId in ParentChain do
	PushEvent("/Community/Reply/"+ParentId,"VotesUpdated",Event);

{
	"nrUp": Reply.NrUp,
	"nrDown": Reply.NrDown
}

