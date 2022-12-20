AuthenticateSession(Request,"QuickLoginUser");

{
	"title":Required(Str(PTitle)),
	"text":Required(Str(PText)),
	"tags":Required(Str(PTags)[])
}:=Posted;

Link:="";
First:=true;

foreach Part in PTitle.Split(" ",System.StringSplitOptions.RemoveEmptyEntries) do
(
	if First then
		First:=false
	else
		Link+="_";

	Link+=Part.ToLower()
);

Suffix:="";
i:=1;

while ((select count(*) from Community_Posts where Link=(Link+Suffix))??0)>0 do
(
	i++;
	Suffix=" "+Str(i)
);

Html:="# " + PTitle + "\r\n\r\n" + PText + "\r\n\r\n";

First:=true;
foreach Tag in PTags do
(
	if First then
		First:=false
	else
		Html+=",\r\n";

	Html+="[\\#"+MarkdownEncode(Tag)+"](/Community/"+UrlEncode(Tag)+")";
);

{
	"html": MarkdownToHtml(Html),
	"link": Link+Suffix,
	"valid": !empty(Trim(PTitle)) && !empty(Trim(PText))
}

