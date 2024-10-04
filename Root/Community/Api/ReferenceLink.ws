AuthenticateSession(Request,"QuickLoginUser");

({
	"title":Required(Str(PTitle))
}:=Posted) ??? BadRequest("Invalid request.");

Link:="";
Suffix:="";

sb:=Create(System.Text.StringBuilder);
Char:=System.Char;
foreach ch in PTitle do sb.Append(Char.IsLetterOrDigit(ch)?ch:"_");
Link:=sb.ToString();

i:=1;

while ((select count(*) from Community_Posts where Link=(Link+Suffix))??0)>0 do
	Suffix:="_"+Str(++i);

{
	"link": Link+Suffix
}

