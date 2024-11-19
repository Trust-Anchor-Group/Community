({
	"link":Required(Str(PLink))
}:=Posted) ??? BadRequest("Invalid request.");

Post:=select top 1 * from Community_Posts where Host=Request.Host and Link=PLink;
if !exists(Post) then NotFound("Post not found.");

Result:="";
First:=true;
foreach Row in Post.Markdown.Replace("\r\n","\n").Replace("\r","\n").Split("\n",System.StringSplitOptions.None) do
(
	if First then
		First:=false
	else
		Result+="\r\n";

	Result+=">\t"+Row;
);

{
	"quote": Result
}
