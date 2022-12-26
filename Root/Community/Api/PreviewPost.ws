LogDebug(1);

AuthenticateSession(Request,"QuickLoginUser");

LogDebug(2);

{
	"type":Required(Str(PType)),
	"title":Required(Str(PTitle)),
	"text":Required(Str(PText)),
	"tags":Required(Str(PTags)[]),
	"tagEdit":Optional(Str(PTagEdit))
}:=Posted;

PText:=PText.
	Replace("{","\\{").
	Replace("}","\\}").
	Replace("\\\\{","\\{").
	Replace("\\\\}","\\}");

Link:="";
Suffix:="";

if empty(PTitle) then
	Result:=""
else
(
	if PType="Post" then
	(
		sb:=Create(System.Text.StringBuilder);
		Char:=System.Char;
		foreach ch in PTitle do sb.Append(Char.IsLetterOrDigit(ch)?ch:"_");
		Link:=sb.ToString();

		i:=1;

		while ((select count(*) from Community_Posts where Link=(Link+Suffix))??0)>0 do
			Suffix:="_"+Str(++i)
	);

	Result:="# " + PTitle + "\r\n\r\n";
);
	
Result += PText + "\r\n\r\n";

First:=true;
foreach Tag in PTags do
(
	if First then
		First:=false
	else
		Result+=",\r\n";

	Result+="[\\#"+MarkdownEncode(Tag)+"](/Community/Tag/"+UrlEncode(Tag)+")";
);

if empty(PTagEdit) then
	Suggestions:=null
else
(
	Suggestions:=select top 50 
		Key.Substring(28)
	from 
		RuntimeCounter 
	where 
		Key like ("Community.Posts.Created.Tag.%"+PTagEdit+"%") 
	order by 
		Tag
);

if PType="Post" then
	Valid:=!empty(Trim(PTitle)) && !empty(Trim(PText))
else if PType="Message" or PType="Reply" or PType="UpdatePost" then
	Valid:=!empty(Trim(PText))
else
	Valid:=false;

{
	"html": MarkdownToHtml(Result),
	"link": Link+Suffix,
	"valid": Valid,
	"suggestions": Suggestions
}

