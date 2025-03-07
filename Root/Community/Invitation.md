Title: Invitation
Description: This page provides the user with an invitation to create an account on the server.
Date: 2022-12-29
Author: Peter Waher
Master: Master.md

=====================================================================================

Invitation Code
======================

Below is an invitation code that you can scan if you want to create a *TAG Digital ID*[^tagid] account on this server.
You don't need an account on this server to access the community, as the underlying network is *federated*. This means you
can choose to have your account on any valid server, and still interact with this forum. But if you choose to create an account
on this server, you can do so. Install the app, and before you provide the name of your new account, select to scan an
*Invitation Code*, and scan the below code. This code is only valid once, so if you need multiple invitation codes, just refresh
the page, and a new code will appear. Once the code is scanned in the app, it will be directed to this server. When your account 
has been successfully created, you can continue with the normal [login](/Community/Login.md).

{{
GW:=Waher.IoTGateway.Gateway;
ApiKey:=select top 1 * from ApiKeys where Owner="Community";
if !exists(ApiKey) then
(
	ApiKey:=Create(Waher.Service.IoTBroker.DataStorage.ApiKey);
	do
	(
		ApiKey.Key:=Waher.Security.Hashes.BinaryToString(GW.NextBytes(32));
		Prev:=select top 1 * from ApiKeys where Key=ApiKey.Key;
	) 
	while exists(Prev);

	ApiKey.Secret:=Waher.Security.Hashes.BinaryToString(GW.NextBytes(32));
	ApiKey.Owner:="Community";
	ApiKey.Created:=Now;
	ApiKey.MaxAccounts:=5000;

	SaveNewObject(ApiKey);

	GW.SendNotification("TAG Community API Key generated.");
);

try
(
	Data:=<ApiKey xmlns="http://waher.se/schema/Onboarding/v1.xsd"
					key=ApiKey.Key
					secret=ApiKey.Secret
					domain=GW.Domain />;
	Data:=Utf8Encode(str(Data));
	Key:=RandomBytes(16);
	IV:=RandomBytes(16);
	Data:=Aes256Encrypt(Data,Key,IV);
	Req:=<Info xmlns="http://waher.se/schema/Onboarding/v1.xsd" 
				base64=Base64Encode(Data)
				once=true 
				expires=Now.AddDays(1).ToUniversalTime() />;
	Info:=GW.XmppClient.IqSet("onboarding.id.tagroot.io",str(Req),10000);
	Code:=select /default:Code/@code from Xml(Info.InnerXml);
	URL:="obinfo:id.tagroot.io:"+Code+":"+Base64Encode(Key)+":"+Base64Encode(IV);

	]]<img src="/QR/((UrlEncode(URL) ))?w=400&h=400&q=2" alt="Invitation Code" width="400" height="400"/>

```
((URL))
```

[[;

	Data:=null;
	Key:=null;
	IV:=null;
	URL:=null;
)
catch
(
	]]<p class="error">((Exception.Message))</p>[[
)
}}

[^tagid]:	The *TAG Digital ID* is a smart phone app that can be downloaded for 
[Android](https://play.google.com/store/apps/details?id=com.tag.IdApp) or 
[iOS](https://apps.apple.com/tr/app/trust-anchor-id/id1580610247). You can also use
the more light-weight *Neuro-Access App*, also downloadable for
[Android](https://play.google.com/store/apps/details?id=com.tag.NeuroAccess) or
[iOS](https://apps.apple.com/app/neuro-access/id6446863270).
By using any of these apps, or any app derived from these, to login, you avoid 
having to create credentials on each site you visit. This helps you protect your 
credentials and make sure external entities never process your sensitive information 
without your consent.