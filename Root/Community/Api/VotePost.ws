AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId)),
	"up":Required(Boolean(PUp))
}:=Posted;

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");

Post:=select top 1 * from Community_Posts where ObjectId=PObjectId;
if !exists(Post) then NotFound("Post not found.");

if PUp then
(
	Post.Up[BareJid]:=true;
	Post.Down.Remove(BareJid);
)
else
(
	Post.Down[BareJid]:=true;
	Post.Up.Remove(BareJid);
);

Post.NrUp:=Post.Up.Count;
Post.NrDown:=Post.Down.Count;
UpdateObject(Post);

Event:=
{
	ObjectId:Post.ObjectId,
	NrUp:Post.NrUp,
	NrDown:Post.NrDown
};

PushEvent("/Community/Index.md","VotesUpdated",Event);
PushEvent("/Community/Author/"+Post.UserId,"VotesUpdated",Event);
PushEvent("/Community/Post/"+Post.Link,"VotesUpdated",Event);

foreach Tag in Post.Tags do
	PushEvent("/Community/Tag/"+Tag,"VotesUpdated",Event);

{
	"nrUp": Post.NrUp,
	"nrDown": Post.NrDown
}

