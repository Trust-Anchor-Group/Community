AuthenticateSession(Request,"QuickLoginUser");

{
	"type":Required(Str(PType)),
	"title":Required(Str(PTitle)),
	"text":Required(Str(PText)),
	"tags":Required(Str(PTags)[]),
	"tagEdit":Optional(Str(PTagEdit))
}:=Posted;

Link:="";
Suffix:="";

if empty(PTitle) then
	Result:=""
else
(
	First:=true;

	foreach Part in PTitle.Replace("'","_").Replace("\"","_").Split(" ",System.StringSplitOptions.RemoveEmptyEntries) do
	(
		if First then
			First:=false
		else
			Link+="_";

		Link+=Part.ToLower()
	);

	i:=1;

	while ((select count(*) from Community_Posts where Link=(Link+Suffix))??0)>0 do
	(
		i++;
		Suffix=" "+Str(i)
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
else if PType="Message" or PType="Reply" then
	Valid:=!empty(Trim(PText))
else
	Valid:=false;

{
	"html": MarkdownToHtml(Result),
	"link": Link+Suffix,
	"valid": Valid,
	"suggestions": Suggestions
}

