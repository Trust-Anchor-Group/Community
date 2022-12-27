﻿function TrapTab(Control, Properties, Event)
{
	if (Event.keyCode === 9)
	{
		Event.preventDefault();

		var Value = Control.value;
		var Start = Control.selectionStart;
		var End = Control.selectionEnd;
		Control.value = Value.substring(0, Start) + '\t' + Value.substring(End);
		Control.selectionStart = Control.selectionEnd = Start + 1;
	}

	InvalidatePreviewSpec(Properties);

	window.setTimeout(function () { AdaptSize(Control); }, 0);
}

function AdaptSize(Control)
{
	if (Control.tagName === "TEXTAREA")
	{
		var maxheight = Math.floor((("innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight) * 2) / 3);
		var h = Control.scrollHeight;
		if (h > maxheight)
			h = maxheight;

		if (h > Control.clientHeight)
			Control.style.height = h + "px";
	}
}

function InvalidatePreview()
{
	InvalidatePreviewSpec(DefaultProperties());
}

function InvalidatePostPreview(ObjectId)
{
	InvalidatePreviewSpec(PostProperties(ObjectId));
}

function DefaultProperties()
{
	var Properties = {
		"Type": document.getElementById("Type").value,
		"TitleId": "Title",
		"TextId": "Text",
		"TagId": "Tag",
		"PreviewId": "Preview",
		"LinkId": "ReferenceLink",
		"OkButtonId": "CreateButton",
		"TagsId": "Tags",
		"SuggestedTagsId": "SuggestedTags"
	};

	return Properties;
}

function PostProperties(ObjectId)
{
	var Properties =
	{
		"Type": "UpdatePost",
		"TitleId": "Title" + ObjectId,
		"TextId": "Text" + ObjectId,
		"TagId": "Tag" + ObjectId,
		"PreviewId": "Content" + ObjectId,
		"LinkId": null,
		"OkButtonId": "UpdateButton" + ObjectId,
		"TagsId": "Tags" + ObjectId,
		"SuggestedTagsId": "SuggestedTags" + ObjectId
	};

	return Properties;
}

function ReplyProperties(ObjectId)
{
	var Properties =
	{
		"Type": "UpdateReply",
		"TitleId": null,
		"TextId": "Text" + ObjectId,
		"TagId": null,
		"PreviewId": "Content" + ObjectId,
		"LinkId": null,
		"OkButtonId": "UpdateButton" + ObjectId,
		"TagsId": null,
		"SuggestedTagsId": null
	};

	return Properties;
}

function InvalidatePreviewSpec(Properties)
{
	if (PreviewTimer !== null)
		window.clearTimeout(PreviewTimer);

	PreviewTimer = window.setTimeout(function ()
	{
		DoPreview(Properties);
	}, 250);
}

var PreviewTimer = null;

function DoPreview(Properties)
{
	var Title = Properties.TitleId ? document.getElementById(Properties.TitleId).value : null;
	var Text = document.getElementById(Properties.TextId).value;
	var TagEdit = Properties.TagId ? document.getElementById(Properties.TagId).value : null;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);

				var Preview = document.getElementById(Properties.PreviewId);
				Preview.innerHTML = Response.html;

				if (Response.link !== "" && Properties.LinkId)
				{
					var ReferenceLink = document.getElementById(Properties.LinkId);
					ReferenceLink.value = Response.link;
				}

				var CreateButton = document.getElementById(Properties.OkButtonId);

				if (Response.valid)
				{
					CreateButton.removeAttribute("disabled");
					CreateButton.className = "posButton";
				}
				else
				{
					CreateButton.setAttribute("disabled", "disabled");
					CreateButton.className = "disabledButton";
				}

				if (Response.suggestions)
					ShowTagDropdown(Properties, Response.suggestions);
				else
					HideTagDropdown(Properties);
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/PreviewPost.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"type": Properties.Type,
			"title": Title,
			"text": Text,
			"tags": GetTags(Properties),
			"tagEdit": TagEdit
		}
	));
}

function ClearPost()
{
	var Title = document.getElementById("Title");
	Title.value = "";
	Title.focus();

	document.getElementById("ReferenceLink").value = "";
	document.getElementById("Text").value = "";
	document.getElementById("Tag").value = "";

	var Tags = document.getElementById("Tags");
	var Loop = Tags.firstChild;
	var Temp;

	while (Loop)
	{
		Temp = Loop.nextSibling;

		if (Loop.tagName === "LI" && Loop.className !== "EndOfTags")
			Loop.parentNode.removeChild(Loop);

		Loop = Temp;
	}

	InvalidatePreview();
}

function GetTags(Properties)
{
	var Result = [];

	if (Properties.TagsId)
	{
		var Tags = document.getElementById(Properties.TagsId);
		var Loop = Tags.firstChild;

		while (Loop)
		{
			if (Loop.tagName === "LI" && Loop.className !== "EndOfTags")
				Result.push(Loop.innerText);

			Loop = Loop.nextSibling;
		}
	}

	if (Properties.TagId)
	{
		var TagInput = document.getElementById(Properties.TagId);
		var Tag = TagInput.value;
		if (Tag !== "")
			Result.push(Tag);
	}

	return Result;
}

function AddTag(Properties)
{
	var TagsList = document.getElementById(Properties.TagsId);
	var TagInput = document.getElementById(Properties.TagId);
	var Tag = TagInput.value;
	if (!Tag || Tag === "")
		return;

	Tag = Tag.toLowerCase();
	var s = Tag.replace(" ", "_");
	while (Tag !== s)
	{
		Tag = s;
		s = Tag.replace(" ", "_");
	}

	TagInput.value = "";

	var Tags = GetTags(Properties);
	var i, c = Tags.length;

	for (i = 0; i < c; i++)
	{
		if (Tag === Tags[i])
			return;
	}

	var EndOfTags = document.getElementById("EndOfTags");
	var Li = document.createElement("LI");
	Li.innerText = Tag;
	Li.onclick = function ()
	{
		TagsList.removeChild(Li);

		var Loop = TagsList.firstChild;
		var i = 0;

		while (Loop)
		{
			if (Loop.tagName === "LI")
			{
				if (Loop.className === "EndOfTags" && i === 0)
					TagsList.className = "Tags noTags";
				else
					i++;
			}

			Loop = Loop.nextSibling;
		}

		InvalidatePreviewSpec(Properties);
	};

	TagsList.insertBefore(Li, EndOfTags);
	TagsList.className = "Tags withTags";
}

function CreatePost()
{
	var Title = document.getElementById("Title").value;
	var Text = document.getElementById("Text").value;
	var Link = document.getElementById("ReferenceLink").value;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);

				if (Response.valid)
					window.location.href = Response.link;
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/CreatePost.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"title": Title,
			"text": Text,
			"link": Link,
			"tags": GetTags(DefaultProperties())
		}
	));
}

function TrapTagKey(Properties, Event)
{
	if (Event.keyCode === 13)
	{
		Event.preventDefault();

		AddTag(Properties);
		HideTagDropdown(Properties);
	}

	InvalidatePreviewSpec(Properties);
}

function ShowTagDropdown(Properties, Tags)
{
	var Suggestions = document.getElementById(Properties.SuggestedTagsId);
	var LastTag;
	var Loop = Suggestions.firstChild;
	var Temp;

	while (Loop)
	{
		Temp = Loop.nextSibling;

		if (Loop.tagName == "LI")
		{
			if (Loop.className == "EndOfTags")
			{
				LastTag = Loop;
				break;
			}

			Suggestions.removeChild(Loop);
		}

		Loop = Temp;
	}

	var c = Tags.length;
	var i;

	for (i = 0; i < c; i++)
	{
		var Li = document.createElement("LI");
		Li.innerText = Tags[i];
		Li.onclick = function ()
		{
			var TagControl = document.getElementById(Properties.TagId);

			TagControl.value = this.innerText;

			AddTag(Properties);
			HideTagDropdown(Properties);
			InvalidatePreviewSpec(Properties);

			TagControl.focus();
		};

		Suggestions.insertBefore(Li, LastTag);
	}

	if (c > 0)
		Suggestions.className = "Tags withTags Suggestion";
	else
		Suggestions.className = "Tags noTags Suggestion";
}

function HideTagDropdown(Properties)
{
	if (Properties.SuggestedTagsId)
	{
		var Suggestions = document.getElementById(Properties.SuggestedTagsId);
		if (Suggestions)
			Suggestions.className = "Tags noTags";
	}
}

function OpenLink(Link)
{
	window.open(Link, "_blank");
}

window.onscroll = function ()
{
	var Button = document.getElementById("LoadMoreButton");

	if (Button)
	{
		var Rect = Button.getBoundingClientRect();
		if (Rect.top <= window.innerHeight * 2)
		{
			var Scroll = Button.getAttribute("data-scroll");
			if (Scroll !== "x")
				Button.click();
		}
	}
}

function LoadMore(Control, Offset, N, Author, Tag)
{
	Control.setAttribute("data-scroll", "x");

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			Control.setAttribute("data-scroll", "");

			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);
				var i, c = Response.posts.length;
				var LastSection = Control.parentNode;
				var Wall = LastSection.parentNode;

				for (i = 0; i < c; i++)
				{
					var Post = Response.posts[i];

					var Section = document.createElement("SECTION");
					Wall.insertBefore(Section, LastSection);

					Section.innerHTML = Post.html;
				}

				if (Response.more)
					Control.setAttribute("onclick", "LoadMore(this," + (Offset + c) + "," + N + ",'" + Author + "','" + Tag + "')");
				else
					LastSection.removeChild(Control);
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/LoadMore.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"offset": Offset,
			"maxCount": N,
			"author": Author,
			"tag": Tag
		}
	));
}

function QuotePost(Link,Properties)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Control = document.getElementById(Properties.TextId);

				var Value = Control.value;
				var Start = Control.selectionStart;
				var End = Control.selectionEnd;
				Control.value = Value.substring(0, Start) + xhttp.responseText + Value.substring(End);
				Control.selectionStart = Start;
				Control.selectionEnd = Start + xhttp.responseText.length;
				Control.focus();

				AdaptSize(Control);
				InvalidatePreviewSpec(Properties);
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/QuotePost.ws", true);
	xhttp.setRequestHeader("Content-Type", "text/plain");
	xhttp.setRequestHeader("Accept", "text/plain");
	xhttp.send(Link);
}

function QuoteReply(ObjectId)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Control = document.getElementById("Text");

				var Value = Control.value;
				var Start = Control.selectionStart;
				var End = Control.selectionEnd;
				Control.value = Value.substring(0, Start) + xhttp.responseText + Value.substring(End);
				Control.selectionStart = Start;
				Control.selectionEnd = Start + xhttp.responseText.length;
				Control.focus();

				AdaptSize(Control);
				InvalidatePreview();
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/QuoteReply.ws", true);
	xhttp.setRequestHeader("Content-Type", "text/plain");
	xhttp.setRequestHeader("Accept", "text/plain");
	xhttp.send(ObjectId);
}

function SendMessage()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
				window.close();
			else
				window.alert(xhttp.responseText);
		}
	};

	var Link = document.getElementById("ReferenceLink").value;
	var Text = document.getElementById("Text").value;

	xhttp.open("POST", "/Community/Api/SendMessage.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"link": Link,
			"message": Text
		}));
}

function PublishReplyToReply()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
				window.close();
			else
				window.alert(xhttp.responseText);
		}
	};

	var ReplyId = document.getElementById("ReferenceLink").value;
	var Text = document.getElementById("Text").value;

	xhttp.open("POST", "/Community/Api/ReplyToReply.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"replyId": ReplyId,
			"message": Text
		}));
}

function LoadMoreReplies(Control, Offset, N, Link, Reply)
{
	Control.setAttribute("data-scroll", "x");

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			Control.setAttribute("data-scroll", "");

			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);
				var i, c = Response.replies.length;
				var Replies = Control.parentNode;

				for (i = 0; i < c; i++)
				{
					var Reply2 = Response.replies[i];

					var Section = document.createElement("SECTION");
					Replies.insertBefore(Section, Control);

					Section.innerHTML = Reply2.html;
				}

				if (Response.more)
					Control.setAttribute("onclick", "LoadMoreReplies(this," + (Offset + c) + "," + N + ",'" + Link + "','" + Reply + "')");
				else
					Replies.removeChild(Control);
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/LoadMoreReplies.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"offset": Offset,
			"maxCount": N,
			"link": Link,
			"reply": Reply
		}
	));
}

function EditPost(ObjectId)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Post = JSON.parse(xhttp.responseText);

				var Div = document.getElementById("editor" + ObjectId);
				var Fieldset = FindFirstChild(Div, "FIELDSET");

				var Legend = FindFirstChild(Fieldset, "LEGEND");
				Legend.innerText = "Editing Post";

				var P = FindNextChild(Fieldset, Legend, "P");
				var Label = FindFirstChild(P, "LABEL");
				Label.setAttribute("for", "Title" + ObjectId);
				Label.innerText = "Text:";

				var BR = FindNextChild(P, Label, "BR");
				var Input = FindNextChild(P, BR, "INPUT");
				Input.setAttribute("type", "text");
				Input.setAttribute("name", "Title" + ObjectId);
				Input.setAttribute("id", "Title" + ObjectId);
				Input.setAttribute("title", "Title of post");
				Input.setAttribute("required", "required");
				Input.setAttribute("onkeydown", "InvalidatePostPreview('" + ObjectId + "')");
				Input.setAttribute("autocomplete", "off");
				Input.value = Post.Title;

				P = FindNextChild(Fieldset, P, "P");
				Label = FindFirstChild(P, "LABEL");
				Label.setAttribute("for", "Text" + ObjectId);
				Label.innerText = "Text of post:";

				BR = FindNextChild(P, Label, "BR");
				var TextArea = FindNextChild(P, BR, "TEXTAREA");
				TextArea.setAttribute("name", "Text" + ObjectId);
				TextArea.setAttribute("id", "Text" + ObjectId);
				TextArea.setAttribute("required", "required");
				TextArea.setAttribute("onkeydown", "TrapTab(this,PostProperties('" + ObjectId + "'),event)");
				TextArea.setAttribute("onpaste", "PasteContent(this,PostProperties('" + ObjectId + "'),event)");
				TextArea.value = Post.Text;

				P = FindNextChild(Fieldset, P, "P");
				var TagsList = FindFirstChild(P, "UL");
				TagsList.setAttribute("id", "Tags" + ObjectId);

				var Li = null;
				var i;
				var c = Post.Tags.length;

				TagsList.className = c === 0 ? "Tags noTags" : "Tags withTags";

				for (i = 0; i < c; i++)
				{
					Li = Li ? FindNextChild(TagsList, Li, "LI") : FindFirstChild(TagsList, "LI");
					Li.className = "Tag";
					Li.innerText = Post.Tags[i];

					Li.onclick = function ()
					{
						TagsList.removeChild(this);

						var Loop = TagsList.firstChild;
						var i = 0;

						while (Loop)
						{
							if (Loop.tagName === "LI")
							{
								if (Loop.className === "EndOfTags" && i === 0)
									TagsList.className = "Tags noTags";
								else
									i++;
							}

							Loop = Loop.nextSibling;
						}

						InvalidatePostPreview(ObjectId);
					};
				}

				Li = Li ? FindNextChild(TagsList, Li, "LI") : FindFirstChild(TagsList, "LI");
				Li.className = "EndOfTags";
				Li.innerHTML = "";

				var Temp;

				Li = Li.nextSibling;
				while (Li)
				{
					Temp = Li.nextSibling;
					TagsList.removeChild(Li);
					Li = Temp;
				}

				P = FindNextChild(Fieldset, P, "P");
				Label = FindFirstChild(P, "LABEL");
				Label.setAttribute("for", "Tag" + ObjectId);
				Label.innerText = "Tag: (Press ENTER to add more than one)";

				BR = FindNextChild(P, Label, "BR");
				var Input = FindNextChild(P, BR, "INPUT");
				Input.className = "TagInput";
				Input.setAttribute("type", "text");
				Input.setAttribute("name", "Tag" + ObjectId);
				Input.setAttribute("id", "Tag" + ObjectId);
				Input.setAttribute("title", "Enter Tag to add");
				Input.setAttribute("onkeydown", "TrapTagKey(PostProperties('" + ObjectId + "'),event)");
				Input.setAttribute("autocomplete", "off");

				P = FindNextChild(Fieldset, P, "P");
				var Ul = FindFirstChild(P, "UL");
				Ul.setAttribute("id", "SuggestedTags" + ObjectId);
				Ul.className = "Tags noTags Suggestion";

				Li = FindFirstChild(Ul, "LI");
				Li.className = "EndOfTags";
				Li.innerHTML = "";

				Li = Li.nextSibling;
				while (Li)
				{
					Temp = Li.nextSibling;
					Ul.removeChild(Li);
					Li = Temp;
				}

				var Button = FindNextChild(Fieldset, P, "BUTTON");
				Button.setAttribute("id", "UpdateButton" + ObjectId);
				Button.setAttribute("type", "button");
				Button.className = "posButton";
				Button.innerText = "Update";
				Button.setAttribute("onclick", "UpdatePost('" + ObjectId + "')");

				Button = FindNextChild(Fieldset, Button, "BUTTON");
				Button.setAttribute("type", "button");
				Button.className = "negButton";
				Button.innerText = "Cancel";
				Button.setAttribute("onclick", "CancelPost('" + ObjectId + "')");

				TextArea.focus();
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/PostInfo.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId
		}));
}

function CancelPost(ObjectId)
{
	var Div = document.getElementById("editor" + ObjectId);
	Div.innerHTML = "";

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Post = JSON.parse(xhttp.responseText);
				var Properties = PostProperties(ObjectId);
				var Content = document.getElementById(Properties.PreviewId);

				Content.innerHTML = Post.Html;
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/PostInfo.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId
		}));
}

function UpdatePost(ObjectId)
{
	var Properties = PostProperties(ObjectId);
	var Title = document.getElementById(Properties.TitleId).value;
	var Text = document.getElementById(Properties.TextId).value;
	var Tags = GetTags(Properties);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);

				if (Response.valid)
				{
					var Content = document.getElementById(Properties.PreviewId);
					Content.innerHTML = Response.html;

					CancelPost(ObjectId);
				}
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/UpdatePost.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId,
			"title": Title,
			"text": Text,
			"tags": Tags
		}
	));
}

function DoLogin()
{
	window.location.href = "/Community/Login.md?from=" + escape(window.location.href);
}

function VotePost(ObjectId, Up)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);
				var UpVotes = document.getElementById("up" + ObjectId);
				var DownVotes = document.getElementById("down" + ObjectId);

				UpVotes.innerText = Response.nrUp;
				DownVotes.innerText = Response.nrDown;
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/VotePost.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId,
			"up": Up
		}
	));
}

function VoteReply(ObjectId, Up)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);
				var UpVotes = document.getElementById("up" + ObjectId);
				var DownVotes = document.getElementById("down" + ObjectId);

				UpVotes.innerText = Response.nrUp;
				DownVotes.innerText = Response.nrDown;
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/VoteReply.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId,
			"up": Up
		}
	));
}

function PasteContent(Control, Properties, Event)
{
	var Items = Event.clipboardData.items;
	var i, c = Items.length;

	for (i = 0; i < c; i++)
	{
		var Item = Items[i];

		if (Item.type.indexOf("image") >= 0)
		{
			Event.preventDefault();

			var Image = Item.getAsFile();
			var FileName = window.prompt("File Name:", Image.name);

			if (FileName)
			{
				var Form = new FormData();

				Form.append("Image", Image, FileName);

				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function ()
				{
					if (xhttp.readyState == 4)
					{
						var MarkdownImageReference = xhttp.responseText;

						var Value = Control.value;
						var Start = Control.selectionStart;
						var End = Control.selectionEnd;
						Control.value = Value.substring(0, Start) + MarkdownImageReference + Value.substring(End);
						Control.selectionStart = Start;
						Control.selectionEnd = Start + MarkdownImageReference.length;
						Control.focus();

						AdaptSize(Control);
						InvalidatePreviewSpec(Properties);
					}
				};

				xhttp.open("POST", "/Community/Api/Upload.ws", true);
				xhttp.setRequestHeader("Accept", "text/plain");
				xhttp.send(Form);
			}
			break;
		}
	}
}

function FindFirstChild(ParentElement, ElementType)
{
	return FindElement(ParentElement, ParentElement.firstChild, ElementType);
}

function FindNextChild(ParentElement, CurrentSibling, ElementType)
{
	return FindElement(ParentElement, CurrentSibling.nextSibling, ElementType);
}

function FindElement(ParentElement, Loop, ElementType)
{
	while (Loop)
	{
		if (Loop.tagName === ElementType)
			return Loop;

		Loop = Loop.nextSibling;
	}

	Loop = document.createElement(ElementType);
	ParentElement.appendChild(Loop);

	return Loop;
}

function EditReply(ObjectId)
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Reply = JSON.parse(xhttp.responseText);
				var Div = document.getElementById("editor" + ObjectId);
				var Fieldset = FindFirstChild(Div, "FIELDSET");

				var Legend = FindFirstChild(Fieldset, "LEGEND");
				Legend.innerText = "Editing Reply";

				var P = FindNextChild(Fieldset, Legend, "P");
				var Label = FindFirstChild(P, "LABEL");
				Label.setAttribute("for", "Text" + ObjectId);
				Label.innerText = "Text of reply:";

				var BR = FindNextChild(P, Label, "BR");
				var TextArea = FindNextChild(P, BR, "TEXTAREA");
				TextArea.setAttribute("name", "Text" + ObjectId);
				TextArea.setAttribute("id", "Text" + ObjectId);
				TextArea.setAttribute("required", "required");
				TextArea.setAttribute("onkeydown", "TrapTab(this,ReplyProperties('" + ObjectId + "'),event)");
				TextArea.setAttribute("onpaste", "PasteContent(this,ReplyProperties('" + ObjectId + "'),event)");
				TextArea.value = Reply.Text;

				var Button = FindNextChild(Fieldset, P, "BUTTON");
				Button.setAttribute("id", "UpdateButton" + ObjectId);
				Button.setAttribute("type", "button");
				Button.className = "posButton";
				Button.innerText = "Update";
				Button.setAttribute("onclick", "UpdateReply('" + ObjectId + "')");

				Button = FindNextChild(Fieldset, Button, "BUTTON");
				Button.setAttribute("type", "button");
				Button.className = "negButton";
				Button.innerText = "Cancel";
				Button.setAttribute("onclick", "CancelReply('" + ObjectId + "')");

				TextArea.focus();
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/ReplyInfo.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId
		}));
}

function UpdateReply(ObjectId)
{
	var Properties = ReplyProperties(ObjectId);
	var Text = document.getElementById(Properties.TextId).value;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);

				if (Response.valid)
				{
					var Content = document.getElementById(Properties.PreviewId);
					Content.innerHTML = Response.html;

					CancelReply(ObjectId);
				}
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/UpdateReply.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId,
			"text": Text
		}
	));
}

function CancelReply(ObjectId)
{
	var Div = document.getElementById("editor" + ObjectId);
	Div.innerHTML = "";

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Post = JSON.parse(xhttp.responseText);
				var Properties = ReplyProperties(ObjectId);
				var Content = document.getElementById(Properties.PreviewId);

				Content.innerHTML = Post.Html;
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "/Community/Api/ReplyInfo.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"objectId": ObjectId
		}));
}

function LoadPostReplies(Link, ObjectId)
{
	var Replies = document.getElementById("replies" + ObjectId);
	if (Replies)
	{
		if (Replies.firstChild === null)
		{
			var Fieldset = FindFirstChild(Replies, "FIELDSET");
			var Legend = FindFirstChild(Fieldset, "LEGEND");
			Legend.innerText = "Responses";

			var Button = FindNextChild(Fieldset, Legend, "BUTTON");
			Button.className = "posButton";
			Button.setAttribute("type", "button");
			Button.setAttribute("onclick", "LoadMoreReplies(this,0,5,'" + Link + "','')");
			Button.innerText = "Load More";

			Button.click();
		}
		else
			Replies.innerHTML = "";
	}
}

function LoadReplyReplies(Link, ReplyId)
{
	var Replies = document.getElementById("replies" + ReplyId);
	if (Replies)
	{
		if (Replies.firstChild === null)
		{
			var Fieldset = FindFirstChild(Replies, "FIELDSET");
			var Legend = FindFirstChild(Fieldset, "LEGEND");
			Legend.innerText = "Responses";

			var Button = FindNextChild(Fieldset, Legend, "BUTTON");
			Button.className = "posButton";
			Button.setAttribute("type", "button");
			Button.setAttribute("onclick", "LoadMoreReplies(this,0,5,'" + Link + "','" + ReplyId + "')");
			Button.innerText = "Load More";

			Button.click();
		}
		else
			Replies.innerHTML = "";
	}
}

function ReplyToPost(Link, ObjectId)
{
	var Reply = document.getElementById("reply" + ObjectId);
	if (Reply)
	{
		if (Reply.firstChild === null)
		{
			var Fieldset = FindFirstChild(Reply, "FIELDSET");
			var Legend = FindFirstChild(Fieldset, "LEGEND");
			Legend.innerText = "Reply";

			var P = FindNextChild(Fieldset, Legend, "P");
			var Label = FindFirstChild(P, "LABEL");
			Label.setAttribute("for", "Response" + ObjectId);
			Label.innerText = "Text of reply:";

			var TextArea = FindNextChild(P, Label, "TEXTAREA");
			TextArea.setAttribute("id", "Response" + ObjectId);
			TextArea.setAttribute("name", "Response" + ObjectId);
			TextArea.setAttribute("onkeydown", "TrapTab(this, ResponseProperties('" + ObjectId + "'), event)");
			TextArea.setAttribute("onpaste", "PasteContent(this, ResponseProperties('" + ObjectId + "'), event)");
			TextArea.setAttribute("autofocus", "autofocus");
			TextArea.setAttribute("required", "required");

			var Button = FindNextChild(Fieldset, P, "BUTTON");
			Button.setAttribute("type", "button");
			Button.setAttribute("id", "RespondButton" + ObjectId);
			Button.className = "disabledButton";
			Button.setAttribute("disabled", "disabled");
			Button.innerText = "Publish";
			Button.onclick = function ()
			{
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function ()
				{
					if (xhttp.readyState === 4)
					{
						if (xhttp.status === 200)
							Reply.innerHTML = "";
						else
							window.alert(xhttp.responseText);
					}
				};

				var Text = TextArea.value;

				xhttp.open("POST", "/Community/Api/ReplyToPost.ws", true);
				xhttp.setRequestHeader("Content-Type", "application/json");
				xhttp.setRequestHeader("Accept", "application/json");
				xhttp.send(JSON.stringify(
					{
						"link": Link,
						"message": Text
					}));
			};

			Button = FindNextChild(Fieldset, Button, "BUTTON");
			Button.setAttribute("type", "button");
			Button.className = "negButton";
			Button.innerText = "Cancel";
			Button.onclick = function ()
			{
				Reply.innerHTML = "";
			};

			Button = FindNextChild(Fieldset, Button, "BUTTON");
			Button.setAttribute("type", "button");
			Button.className = "PosButton";
			Button.innerText = "Quote Post";
			Button.onclick = function ()
			{
				QuotePost(Link,ResponseProperties(ObjectId));
			};

			var Preview = FindNextChild(Fieldset, Button, "FIELDSET");
			Legend = FindFirstChild(Preview, "LEGEND");
			Legend.innerText = "Preview";

			var Div = FindNextChild(Preview, Legend, "DIV");
			Div.setAttribute("id", "PreviewResponse" + ObjectId);

			TextArea.focus();
		}
		else
			Reply.innerHTML = "";
	}
}

function ResponseProperties(ObjectId)
{
	var Properties =
	{
		"Type": "Reply",
		"TitleId": null,
		"TextId": "Response" + ObjectId,
		"TagId": null,
		"PreviewId": "PreviewResponse" + ObjectId,
		"LinkId": null,
		"OkButtonId": "RespondButton" + ObjectId,
		"TagsId": null,
		"SuggestedTagsId": null
	};

	return Properties;
}

function DeletePost(Link)
{
	if (window.confirm("Are you sure you want to delete the post?"))
	{
	}
}

function DeleteReply(ObjectId)
{
	if (window.confirm("Are you sure you want to delete the reply?"))
	{
	}
}