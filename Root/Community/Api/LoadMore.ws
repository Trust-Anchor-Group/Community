{
	"offset":Required(Int(POffset)>=0),
	"maxCount":Required(Int(PMaxCount)>0),
	"author":Optional(Str(PAuthor)),
	"tag":Optional(Str(PTag))
}:=Posted;

PostFileName:=null;
GW:=Waher.IoTGateway.Gateway;
if !GW.HttpServer.TryGetFileName("/Community/PostInline.md",PostFileName) then ServiceUnavailable("Community Service not available.");

if !empty(PAuthor) then
(
	Posts:=
		select top PMaxCount 
			* 
		from 
			Community_Posts 
		where 
			UserId=PAuthor 
		order by 
			Created desc 
		offset 
			POffset
)
else if !empty(PTag) then
(
	Posts:=
		select top PMaxCount 
			* 
		from 
			Community_Posts 
		inner join 
			Community_PostRef 
		on 
			Community_PostRef.Link=Community_Posts.Link 
		where
			Community_PostRef.Tag=PTag
		order by 
			Created desc 
		offset 
			POffset
)
else
(
	Posts:=
		select top PMaxCount 
			* 
		from 
			Community_Posts 
		order by 
			Created desc 
		offset 
			POffset;
);

LoadMore:=count(Posts)=PMaxCount;

{
	"posts":[foreach Post in Posts do
		(
			{
				"html":MarkdownToHtml(LoadMarkdown(PostFileName)),
				"userName":Post.UserName,
				"created":Str(Post.Created),
				"updated":Str(Post.Updated),
				"link":Post.Link
			}
		)],
	"more":LoadMore
}