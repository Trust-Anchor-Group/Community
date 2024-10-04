AuthenticateSession(Request,"QuickLoginUser");

({
	"tagEdit":Optional(Str(PTagEdit))
}:=Posted) ??? BadRequest("Invalid request.");

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

{
	"suggestions": Suggestions
}

