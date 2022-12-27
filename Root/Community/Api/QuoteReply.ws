Reply:=select top 1 * from Community_Replies where ObjectId=Posted;
if !exists(Reply) then NotFound("Reply not found.");

Result:="";
First:=true;
foreach Row in Reply.Markdown.Replace("\r\n","\n").Replace("\r","\n").Split("\n",System.StringSplitOptions.None) do
(
	if First then
		First:=false
	else
		Result+="\r\n";

	Result+=">\t"+Row;
);

Result