AuthenticateSession(Request,"QuickLoginUser");

{
	"query":Required(Str(PQuery)),
	"source":Required(Str(PSource)),
	"order":Required(Str(POrder)),
	"strict":Required(Boolean(PStrict)),
	"offset":Required(Int(POffset)>=0),
	"maxCount":Required(Int(PMaxCount)>0)
}:=Posted;

if empty(PQuery) then BadRequest("Empty query not permitted.");

if PSource="Posts" then
(
	Index:="FTS_Community_Posts";
	ItemResource:="/Community/PostInline.md";
	ItemVariable:="Post";
)
else if PSource="Replies" then
(
	Index:="FTS_Community_Replies";
	ItemResource:="/Community/ReplyInline.md";
	ItemVariable:="Reply";
)
else
	BadRequest("Invalid source");

Result:=Search(Index,PQuery,PStrict,POffset,PMaxCount,POrder);

ItemFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName(ItemResource,ItemFileName) then ServiceUnavailable("Resource for display items not found.");

[foreach Item in Result do
(
	if exists(Item) then
	(
		Request.Session[ItemVariable]:=Item;
		{
			"objectId":Item.ObjectId,
			"html":MarkdownToHtml(LoadMarkdown(ItemFileName))
		}
	)
	else
		null;
)];
