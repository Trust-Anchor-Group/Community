function TrapTab(Control, Properties, Event)
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
	var Title = document.getElementById(Properties.TitleId).value;
	var Text = document.getElementById(Properties.TextId).value;
	var TagEdit = document.getElementById(Properties.TagId).value;
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
	var Tags = document.getElementById(Properties.TagsId);
	var Loop = Tags.firstChild;
	var Result = [];

	while (Loop)
	{
		if (Loop.tagName === "LI" && Loop.className !== "EndOfTags")
			Result.push(Loop.innerText);

		Loop = Loop.nextSibling;
	}

	var TagInput = document.getElementById(Properties.TagId);
	var Tag = TagInput.value;
	if (Tag !== "")
		Result.push(Tag);

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
	var Suggestions = document.getElementById(Properties.SuggestedTagsId);
	if (Suggestions)
		Suggestions.className = "Tags noTags";
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

function QuotePost(Link)
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

	xhttp.open("POST", "/Community/Api/QuotePost.ws", true);
	xhttp.setRequestHeader("Content-Type", "text/plain");
	xhttp.setRequestHeader("Accept", "text/plain");
	xhttp.send(Link);
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

function PublishReply()
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

	xhttp.open("POST", "/Community/Api/Reply.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"link": Link,
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
				Div.innerHTML = "";

				var Fieldset = document.createElement("FIELDSET");
				Div.appendChild(Fieldset);

				var Legend = document.createElement("LEGEND");
				Legend.innerText = "Editing Post";
				Fieldset.appendChild(Legend);

				var P = document.createElement("P");
				Fieldset.appendChild(P);

				var Label = document.createElement("LABEL");
				Label.setAttribute("for", "Title" + ObjectId);
				Label.innerText = "Text:";
				P.appendChild(Label);

				var BR = document.createElement("BR");
				P.appendChild(BR);

				var Input = document.createElement("INPUT");
				Input.setAttribute("type", "text");
				Input.setAttribute("name", "Title" + ObjectId);
				Input.setAttribute("id", "Title" + ObjectId);
				Input.setAttribute("title", "Title of post");
				Input.setAttribute("required", "required");
				Input.setAttribute("onkeydown", "InvalidatePostPreview('" + ObjectId + "')");
				Input.setAttribute("autocomplete", "off");
				Input.value = Post.Title;
				P.appendChild(Input);

				P = document.createElement("P");
				Fieldset.appendChild(P);

				Label = document.createElement("LABEL");
				Label.setAttribute("for", "Text" + ObjectId);
				Label.innerText = "Text of post:";
				P.appendChild(Label);

				BR = document.createElement("BR");
				P.appendChild(BR);

				var TextArea = document.createElement("TEXTAREA");
				TextArea.setAttribute("name", "Text" + ObjectId);
				TextArea.setAttribute("id", "Text" + ObjectId);
				TextArea.setAttribute("required", "required");
				TextArea.setAttribute("onkeydown", "TrapTab(this,PostProperties('" + ObjectId + "'),event)");
				TextArea.setAttribute("onpaste", "PasteContent(this,PostProperties('" + ObjectId + "'),event)");
				TextArea.value = Post.Text;
				P.appendChild(TextArea);

				P = document.createElement("P");
				Fieldset.appendChild(P);

				var TagsList = document.createElement("UL");
				TagsList.setAttribute("id", "Tags" + ObjectId);
				P.appendChild(TagsList);

				var Li;
				var i;
				var c = Post.Tags.length;

				TagsList.className = c === 0 ? "Tags noTags" : "Tags withTags";

				for (i = 0; i < c; i++)
				{
					Li = document.createElement("LI");
					Li.className = "Tag";
					Li.innerText = Post.Tags[i];
					TagsList.appendChild(Li);

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

				Li = document.createElement("LI");
				Li.className = "EndOfTags";
				TagsList.appendChild(Li);

				P = document.createElement("P");
				Fieldset.appendChild(P);

				Label = document.createElement("LABEL");
				Label.setAttribute("for", "Tag" + ObjectId);
				Label.innerText = "Tag: (Press ENTER to add more than one)";
				P.appendChild(Label);

				BR = document.createElement("BR");
				P.appendChild(BR);

				var Input = document.createElement("INPUT");
				Input.className = "TagInput";
				Input.setAttribute("type", "text");
				Input.setAttribute("name", "Tag" + ObjectId);
				Input.setAttribute("id", "Tag" + ObjectId);
				Input.setAttribute("title", "Enter Tag to add");
				Input.setAttribute("onkeydown", "TrapTagKey(PostProperties('" + ObjectId + "'),event)");
				Input.setAttribute("autocomplete", "off");
				P.appendChild(Input);

				P = document.createElement("P");
				Fieldset.appendChild(P);

				var Ul = document.createElement("UL");
				Ul.setAttribute("id", "SuggestedTags" + ObjectId);
				Ul.className = "Tags noTags Suggestion";
				P.appendChild(Ul);

				Li = document.createElement("LI");
				Li.className = "EndOfTags";
				Ul.appendChild(Li);

				var Button = document.createElement("BUTTON");
				Button.setAttribute("id", "UpdateButton" + ObjectId);
				Button.setAttribute("type", "button");
				Button.className = "posButton";
				Button.innerText = "Update";
				Button.setAttribute("onclick", "UpdatePost('" + ObjectId + "')");
				Fieldset.appendChild(Button);

				Button = document.createElement("BUTTON");
				Button.setAttribute("type", "button");
				Button.className = "negButton";
				Button.innerText = "Cancel";
				Button.setAttribute("onclick", "CancelPost('" + ObjectId + "')");
				Fieldset.appendChild(Button);
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

function EditReply(ObjectId)
{
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