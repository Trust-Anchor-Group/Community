({
	"offset":Required(Int(POffset)>=0),
	"maxCount":Required(Int(PMaxCount)>0),
	"author":Optional(Str(PAuthor)),
	"tag":Optional(Str(PTag))
}:=Posted) ??? BadRequest("Invalid request.");

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
			Host=Request.Host and
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
			Community_PostRef.Host=Community_Posts.Host and
			Community_PostRef.Tag=Community_Posts.Tag and
			Community_PostRef.Link=Community_Posts.Link 
		where
			Community_PostRef.Host=Request.Host and
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
		where
			Host=Request.Host
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