AuthenticateSession(Request,"QuickLoginUser");

{
	"title":Required(Str(PTitle)),
	"text":Required(Str(PText))
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

{
	"html": MarkdownToHtml("# " + PTitle + "\r\n\r\n" + PText),
	"link": Link+Suffix
}

