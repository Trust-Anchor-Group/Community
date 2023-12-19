AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId)),
	"up":Required(Boolean(PUp))
}:=Posted;

Country:=QuickLoginUser.Properties.COUNTRY ??? null;
if empty(Country) then BadRequest("User identity lacks country information.");

PNr:=QuickLoginUser.Properties.PNR ??? null;
if empty(PNr) then BadRequest("User identity lacks personal number information.");

Reply:=select top 1 * from Community_Replies where ObjectId=PObjectId;
if !exists(Reply) then NotFound("Reply not found.");

VoteKey:=Base64Encode(Sha2_256(Utf8Encode(Country+":"+PNr+":"+Reply.ObjectId)));

Post:=select top 1 * from Community_Posts where Link=Reply.Link;
if !exists(Post) then NotFound("Post not found.");

if PUp then
(
	Reply.Up[VoteKey]:=true;
	Reply.Down.Remove(VoteKey);
)
else
(
	Reply.Down[VoteKey]:=true;
	Reply.Up.Remove(VoteKey);
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

