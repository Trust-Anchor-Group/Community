select top 50 
	Key.Substring(28)
from 
	RuntimeCounter 
where 
	Key like ("Community.Posts.Created.Tag.%"+Posted+"%") 
order by 
	Tag