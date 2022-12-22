{
	"offset":Required(Int(POffset)>=0),
	"maxCount":Required(Int(PMaxCount)>0)
}:=Posted;

Posts:=select top PMaxCount * from Community_Posts order by Created desc offset POffset;
LoadMore:=count(Posts)=PMaxCount;

[foreach Post in Posts:
{
	"html":MarkdownToHtml(Post.Markdown),
	"userName":Post.UserName,
	"created":Str(Post.Created),
	"updated":(exists(Post.Updated) ? Str(Post.Updated) : ""),
	"link":Post.Link,
	"more":LoadMore
}]