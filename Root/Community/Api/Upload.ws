AuthenticateSession(Request,"QuickLoginUser");

BareJid:=QuickLoginUser.Properties.JID;
if empty(BareJid) then BadRequest("User lacks a proper JID in the identity.");

Author:=QuickLoginUser.UserName;
if empty(Author) then BadRequest("User lacks a proper name in the identity.");

{
	"Image":Required(Image),
	"Image_Binary":Required(ImageBinary),
	"Image_ContentType":Required(Str(ImageContentType) like "image/.+"),
	"Image_FileName":Required(Str(ImageFileName))
}:=Posted;


Extension:="";
if !Waher.Content.InternetContent.TryGetFileExtension(ImageContentType,Extension) then BadRequest("Unrecognized Content Type: " + ImageContentType);

ImageFileName0:=ImageFileName;
if empty(ImageFileName) then ImageFileName:="Image";

if (ImageFileName.Contains("..") or 
	ImageFileName.Contains("/") or 
	ImageFileName.Contains("\\") or 
	ImageFileName.Contains(":") or 
	ImageFileName.Contains("?") or 
	ImageFileName.Contains("*") or 
	ImageFileName.Contains("|") or 
	ImageFileName.Contains("<") or 
	ImageFileName.Contains(">")) then BadRequest("Illegal file name."); 

i:=ImageFileName.LastIndexOf(".");
if(i>=0) then ImageFileName:=ImageFileName.Substring(0,i);

TP:=NowUtc;
ImageFileName:="/Community/Images/"+Str(TP.Year)+"/"+(TP.Month<10?"0":"")+Str(TP.Month)+"/"+(TP.Day<10?"0":"")+Str(TP.Day)+"/"+ImageFileName;

FileName:="";
if !Waher.IoTGateway.Gateway.HttpServer.TryGetFileName(ImageFileName,false,FileName) then BadRequest("Unable to save file.");

Directory:=System.IO.Path.GetDirectoryName(FileName);
if !System.IO.Directory.Exists(Directory) then System.IO.Directory.CreateDirectory(Directory);

Suffix:="";
i:=1;
while (System.IO.File.Exists(FileName+Suffix+"."+Extension)) do
	Suffix:=" ("+Str(++i)+")";

FileName+=Suffix+"."+Extension;
ImageFileName+=Suffix+"."+Extension;

SaveFile(ImageBinary, FileName);

Url:=Waher.IoTGateway.Gateway.GetUrl(ImageFileName);
Report:="Image saved (by `"+Author+"`):\r\n\r\n![`"+MarkdownEncode(ImageFileName)+"`]("+Url+" "+Image.Width+" "+Image.Height+")";

LogInformation("Image saved.",
{
	"Object":ImageFileName,
	"Actor":BareJid,
	"URL":Url,
	"FileName":FileName,
	"Author":Author
});

"!["+MarkdownEncode(ImageFileName0)+"]("+ImageFileName.Replace(" ","%20").Replace("(","%28").Replace(")","%29")+" "+Image.Width+" "+Image.Height+")";
