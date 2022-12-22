{
	"offset":Required(Int(POffset)>=0),
	"maxCount":Required(Int(PMaxCount)>0)
}:=Posted;

Posts:=select top PMaxCount * from Community_Posts order by Created desc offset POffset;
LoadMore:=count(Posts)=PMaxCount;

{
	"posts":[foreach Post in Posts do
			(
				Markdown:=Post.Markdown +
					"\r\n\r\n----------\r\n\r\n<div class='footer'>\r\n[<img alt='"+Post.UserName+
					"' with='64' height='64' src='"+Post.AvatarUrl+"?Width=64&Height=64'/>"+
					"<div class='authorInfo'><span class='author'>"+Post.UserName+"</span><br/>"+
					"<span class='created'>"+Post.Created+"</span>";

				if Post.Updated!=Post.Created then
					Markdown+="<br/><span class='updated'>"+Post.Updated+"</span>";

				Markdown+="</div>](#)<div class='toolbar'>"+
					"<button type='button' onclick=\"OpenLink('Post/"+Post.Link+"')\">Link</button></div></div>";

				{
					"html":MarkdownToHtml(Markdown),
					"userName":Post.UserName,
					"created":Str(Post.Created),
					"updated":Str(Post.Updated),
					"link":Post.Link,
					"more":LoadMore
				}
			)],
	"more":LoadMore
}