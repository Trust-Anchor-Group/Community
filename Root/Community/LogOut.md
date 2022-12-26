Title: TAG Community Logout
Description: This page logs you out from the TAG Community.
Date: 2022-12-16
Author: Peter Waher
Master: Master.md

=====================================================================================

TAG Community Logout
======================

{{If exists(QuickLoginUser) then
(
	Destroy(QuickLoginUser);
	]]You have successfully logged out of the system.[[
)
else
	]]You're not logged into the system.[[
}}

[Click here to go back to the main page.](Index.md)

