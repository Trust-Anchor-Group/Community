{
	"offset":Required(Int(POffset)>=0),
	"maxCount":Required(Int(PMaxCount)>0),
	"link":Required(Str(PLink)),
	"reply":Required(Str(PReply))
}:=Posted;

ReplyFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/ReplyInline.md",ReplyFileName) then ServiceUnavailable("Community Service not available.");

Replies:=
	select top PMaxCount 
		* 
	from 
		Community_Replies
	where
		Link=PLink and
		Reply=PReply
	order by 
		Created desc 
	offset 
		POffset;

LoadMore:=count(Replies)=PMaxCount;

{
	"replies":[foreach Reply in Replies do
		(
			{
				"html":MarkdownToHtml(LoadMarkdown(ReplyFileName)),
				"userName":Reply.UserName,
				"created":Str(Reply.Created),
				"updated":Str(Reply.Updated),
				"link":Reply.Link,
				"id":Reply.ObjectId
			}
		)],
	"more":LoadMore
}