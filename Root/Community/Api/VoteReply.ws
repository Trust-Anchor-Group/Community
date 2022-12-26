AuthenticateSession(Request,"QuickLoginUser");

{
	"objectId":Required(Str(PObjectId)),
	"up":Required(Boolean(PUp))
}:=Posted;

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");

Reply:=select top 1 * from Community_Replies where ObjectId=PObjectId;
if !exists(Reply) then NotFound("Reply not found.");

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

{
	"nrUp": Reply.NrUp,
	"nrDown": Reply.NrDown
}

