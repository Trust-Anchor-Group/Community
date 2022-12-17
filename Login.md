Title: TAG Community Login
Description: This page allows you to login using your TAG ID.
Date: 2022-12-16
Author: Peter Waher
Master: Master.md
JavaScript: Login.js
JavaScript: /Events.js
CSS: /QuickLogin.css
Neuron: {{GW:=Waher.IoTGateway.Gateway;Domain:=empty(GW.Domain) ? (x:=Before(After(GW.GetUrl("/"),"://"),"/");if contains(x,":") and exists(number(after(x,":"))) then "localhost:"+after(x,":") else "localhost") : GW.Domain}}

=====================================================================================

TAG Community Login
======================

Some features of the Community Portal require you to login. You do this using the *TAG Digital ID*[^tagid].

<div id="quickLoginCode" data-mode="image" data-serviceId="{{QuickLoginServiceId(Request)}}" 
data-purpose="To perform a quick login on {{Domain}}, to access protected functions of the Community Portal. This login request is valid for one (1) minute."/>

[^tagid]:	The *TAG Digital ID* is a smart phone app that can be downloaded for 
[Android](https://play.google.com/store/apps/details?id=com.tag.IdApp) and 
[iOS](https://apps.apple.com/tr/app/trust-anchor-id/id1580610247). By using this
app for login, you avoid having to create credentials on each site you visit. This
helps you protect your credentials and make sure external entities never process your
sensitive information without your consent.