AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId)),
	"up":Required(Boolean(PUp))
}:=Posted;

Country:=QuickLoginUser.Properties.COUNTRY ??? null;
if empty(Country) then BadRequest("User identity lacks country information.");

PNr:=QuickLoginUser.Properties.PNR ??? null;
if empty(PNr) then BadRequest("User identity lacks personal number information.");

Post:=select top 1 * from Community_Posts where ObjectId=PObjectId;
if !exists(Post) then NotFound("Post not found.");

VoteKey:=Base64Encode(Sha2_256(Utf8Encode(Country+":"+PNr+":"+Post.ObjectId)));

if PUp then
(
	Post.Up[VoteKey]:=true;
	Post.Down.Remove(VoteKey);
)
else
(
	Post.Down[VoteKey]:=true;
	Post.Up.Remove(VoteKey);
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

