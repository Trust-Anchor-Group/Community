Post:=select top 1 * from Community_Posts where Link=Posted;
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

Result