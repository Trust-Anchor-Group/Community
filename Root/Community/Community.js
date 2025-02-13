function TrapTab(Control, Properties, Event)
{
	if (!MarkdownEditorKeyDown(Control, Event))
		return false;
	else if (Event.keyCode === 9)
	{
		Event.preventDefault();

		var Value = Control.value;
		var Start = Control.selectionStart;
		var End = Control.selectionEnd;
		Control.value = Value.substring(0, Start) + '\t' + Value.substring(End);
		Control.selectionStart = Control.selectionEnd = Start + 1;

		return false;
	}

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

function DefaultProperties()
{
	var Properties = {
		"Type": document.getElementById("Type").value,
		"TitleId": "Title",
		"TextId": "Text",
		"TagId": "Tag",
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
		"LinkId": null,
		"OkButtonId": "UpdateButton" + ObjectId,
		"TagsId": null,
		"SuggestedTagsId": null
	};

	return Properties;
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
	};

	TagsList.insertBefore(Li, EndOfTags);
	TagsList.className = "Tags withTags";
}

async function CreatePost()
{
	var Title = document.getElementById("Title").value;
	var Text = document.getElementById("Text").value;
	var Link = document.getElementById("ReferenceLink").value;
	var Response = await CallServer("/Community/Api/CreatePost.ws",
		{
			"title": Title,
			"text": Text,
			"link": Link,
			"tags": GetTags(DefaultProperties())
		});

	if (Response.valid)
		window.location.href = Response.link;
}

function TrapTagKey(Properties, Event)
{
	if (Event.keyCode === 13)
	{
		Event.preventDefault();

		AddTag(Properties);
		HideTagDropdown(Properties);
	}
}

async function UpdateTagSuggestions(Control, Properties)
{
	var Response = await CallServer("/Community/Api/TagSuggestions.ws",
		{
			"tagEdit": Control.value
		});

	if (Response.suggestions)
		ShowTagDropdown(Properties, Response.suggestions);
	else
		HideTagDropdown(Properties);
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

async function LoadMore(Control, Offset, N, Author, Tag)
{
	Control.setAttribute("data-scroll", "x");

	try
	{
		var Response = await CallServer("/Community/Api/LoadMore.ws",
			{
				"offset": Offset,
				"maxCount": N,
				"author": Author,
				"tag": Tag
			});

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
	finally
	{
		Control.setAttribute("data-scroll", "");
	}
}

async function QuotePost(Link, Properties)
{
	var Response = await CallServer("/Community/Api/QuotePost.ws",
		{
			"link": Link
		});

	var Quote = Response.quote;
	var Control = document.getElementById(Properties.TextId);

	var Value = Control.value;
	var Start = Control.selectionStart;
	var End = Control.selectionEnd;
	Control.value = Value.substring(0, Start) + Quote + Value.substring(End);
	Control.selectionStart = Start;
	Control.selectionEnd = Start + Quote.length;
	Control.focus();

	AdaptSize(Control);

	if (Control.getAttribute("data-preview"))
		InitMarkdownEditorPreview(Control);
}

async function QuoteReply(ObjectId, Properties)
{
	var Response = await CallServer("/Community/Api/QuoteReply.ws", 
		{
			"objectId": ObjectId
		});

	var Quote = Response.quote;
	var Control = document.getElementById(Properties.TextId);

	var Value = Control.value;
	var Start = Control.selectionStart;
	var End = Control.selectionEnd;
	Control.value = Value.substring(0, Start) + Quote + Value.substring(End);
	Control.selectionStart = Start;
	Control.selectionEnd = Start + Quote.length;
	Control.focus();

	AdaptSize(Control);

	if (Control.getAttribute("data-preview"))
		InitMarkdownEditorPreview(Control);
}

async function SendMessage()
{
	var Link = document.getElementById("ReferenceLink").value;
	var Text = document.getElementById("Text").value;
	await CallServer("/Community/Api/SendMessage.ws", 
		{
			"link": Link,
			"message": Text
		});

	window.close();
}

async function LoadMoreReplies(Control, Offset, N, Link, Reply)
{
	Control.setAttribute("data-scroll", "x");

	try
	{
		var Response = await CallServer("/Community/Api/LoadMoreReplies.ws", 
			{
				"offset": Offset,
				"maxCount": N,
				"link": Link,
				"reply": Reply
			}
		);

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
	finally
	{
		Control.setAttribute("data-scroll", "");
	}
}

async function EditPost(ObjectId)
{
	try
	{
		var Post = await CallServer("/Community/Api/PostInfo.ws", 
			{
				"objectId": ObjectId
			});

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
		TextArea.setAttribute("oninput", "AdaptSize(this)");
		TextArea.value = Post.Text;
		AdaptSize(TextArea);

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
		Input.setAttribute("oninput", "UpdateTagSuggestions(this,PostProperties('" + ObjectId + "'))");
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
	catch (e)
	{
		await Popup.Alert(e.message);
	}
}

async function CancelPost(ObjectId)
{
	var Div = document.getElementById("editor" + ObjectId);
	Div.innerHTML = "";

	var Post = await CallServer("/Community/Api/PostInfo.ws", 
		{
			"objectId": ObjectId
		});

	var Content = document.getElementById("Content" + ObjectId);

	if (Content)
		Content.innerHTML = Post.Html;
}

async function UpdatePost(ObjectId)
{
	var Properties = PostProperties(ObjectId);
	var Title = document.getElementById(Properties.TitleId).value;
	var Text = document.getElementById(Properties.TextId).value;
	var Tags = GetTags(Properties);

	var Response = await CallServer("/Community/Api/UpdatePost.ws", 
		{
			"objectId": ObjectId,
			"title": Title,
			"text": Text,
			"tags": Tags
		});

	if (Response.valid)
	{
		var Content = document.getElementById("Content" + ObjectId);

		if (Content)
			Content.innerHTML = Response.html;

		await CancelPost(ObjectId);
	}
}

function DoLogin()
{
	window.location.href = "/Community/Login.md?from=" + encodeURIComponent(window.location.href);
}

async function VotePost(ObjectId, Up)
{
	var Response = await CallServer("/Community/Api/VotePost.ws", 
		{
			"objectId": ObjectId,
			"up": Up
		});

	var UpVotes = document.getElementById("up" + ObjectId);
	var DownVotes = document.getElementById("down" + ObjectId);

	UpVotes.innerText = Response.nrUp;
	DownVotes.innerText = Response.nrDown;
}

async function VoteReply(ObjectId, Up)
{
	var Response = await CallServer("/Community/Api/VoteReply.ws", 
		{
			"objectId": ObjectId,
			"up": Up
		});

	var UpVotes = document.getElementById("up" + ObjectId);
	var DownVotes = document.getElementById("down" + ObjectId);

	UpVotes.innerText = Response.nrUp;
	DownVotes.innerText = Response.nrDown;
}

async function PasteContent(Control, Properties, Event)
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
			var FileName = await Popup.Prompt("File Name:", Image.name);

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

	if (ElementType === "TEXTAREA")
		ParentElement.innerHTML += CreateHTMLMarkdownEditor();

	Loop = document.createElement(ElementType);
	ParentElement.appendChild(Loop);

	return Loop;
}

async function EditReply(ObjectId)
{
	var Reply = await CallServer("/Community/Api/ReplyInfo.ws", 
		{
			"objectId": ObjectId
		});

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
	TextArea.setAttribute("oninput", "AdaptSize(this)");
	TextArea.value = Reply.Text;
	AdaptSize(TextArea);

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

async function UpdateReply(ObjectId)
{
	var Properties = ReplyProperties(ObjectId);
	var Text = document.getElementById(Properties.TextId).value;

	var Response = await CallServer("/Community/Api/UpdateReply.ws", 
		{
			"objectId": ObjectId,
			"text": Text
		});

	if (Response.valid)
	{
		var Content = document.getElementById("Content" + ObjectId);

		if (Content)
			Content.innerHTML = Response.html;

		CancelReply(ObjectId);
	}
}

async function CancelReply(ObjectId)
{
	var Div = document.getElementById("editor" + ObjectId);
	Div.innerHTML = "";

	var Post = await CallServer("/Community/Api/ReplyInfo.ws", 
		{
			"objectId": ObjectId
		});

	var Content = document.getElementById("Content" + ObjectId);

	if (Content)
		Content.innerHTML = Post.Html;
}

function LoadPostReplies(Link, ObjectId)
{
	var Replies = document.getElementById("replies" + ObjectId);
	if (Replies)
	{
		if (Replies.firstChild === null)
		{
			var Fieldset = FindFirstChild(Replies, "FIELDSET");
			Fieldset.className = "responses";

			var Legend = FindFirstChild(Fieldset, "LEGEND");
			Legend.innerText = "Responses";

			var Button = FindNextChild(Fieldset, Legend, "BUTTON");
			Button.className = "posButton";
			Button.setAttribute("type", "button");
			Button.setAttribute("onclick", "LoadMoreReplies(this,0,5,'" + Link + "','')");
			Button.innerText = "Load More";

			if (Button.getAttribute("id") === "")
				Button.setAttribute("id", "LoadMoreButton" + ObjectId);

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
			Fieldset.className = "responses";

			var Legend = FindFirstChild(Fieldset, "LEGEND");
			Legend.innerText = "Responses";

			var Button = FindNextChild(Fieldset, Legend, "BUTTON");
			Button.className = "posButton";
			Button.setAttribute("type", "button");
			Button.setAttribute("onclick", "LoadMoreReplies(this,0,5,'" + Link + "','" + ReplyId + "')");
			Button.innerText = "Load More";

			if (Button.getAttribute("id") === "")
				Button.setAttribute("id", "LoadMoreButton" + ReplyId);

			Button.click();
		}
		else
			Replies.innerHTML = "";
	}
}

function ReplyToPost(Link, ObjectId)
{
	Reply(Link, ObjectId, true);
}


function ReplyToReply(Link, ReplyId)
{
	Reply(Link, ReplyId, false);
}

function Reply(Link, ObjectId, ToPost)
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
			TextArea.setAttribute("oninput", "AdaptSize(this)");
			TextArea.setAttribute("autofocus", "autofocus");
			TextArea.setAttribute("required", "required");

			var Button = FindNextChild(Fieldset, P, "BUTTON");
			Button.setAttribute("type", "button");
			Button.setAttribute("id", "RespondButton" + ObjectId);
			Button.className = "posButton";
			Button.innerText = "Publish";
			Button.onclick = async function ()
			{
				if (ToPost)
				{
					await CallServer("/Community/Api/ReplyToPost.ws", 
						{
							"link": Link,
							"message": TextArea.value
						});
				}
				else
				{
					await CallServer("/Community/Api/ReplyToReply.ws", 
						{
							"replyId": ObjectId,
							"message": TextArea.value
						});
				}

				Reply.innerHTML = "";

				var NrReplies = document.getElementById("nrReplies" + ObjectId);
				var Parent = document.getElementById("replies" + ObjectId);
				if (Parent && Parent.innerHTML === "")
					NrReplies.click();
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
			Button.innerText = ToPost ? "Quote Post" : "Quote Reply";
			Button.onclick = async function ()
			{
				if (ToPost)
					await QuotePost(Link, ResponseProperties(ObjectId));
				else
					await QuoteReply(ObjectId, ResponseProperties(ObjectId));
			};

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
		"LinkId": null,
		"OkButtonId": "RespondButton" + ObjectId,
		"TagsId": null,
		"SuggestedTagsId": null
	};

	return Properties;
}

function IsLoggedIn()
{
	var Img = document.getElementById("userAvatar");
	if (Img)
		return true;
	else
		return false;
}

function RemoveProtectedButtons(ObjectId)
{
	RemoveButton("messageButton" + ObjectId);
	RemoveButton("replyButton" + ObjectId);
	RemoveButton("editButton" + ObjectId);
	RemoveButton("deleteButton" + ObjectId);
}

function RemoveButton(Id)
{
	var Button = document.getElementById(Id);
	if (Button)
		Button.parentElement.removeChild(Button);
}

function PostCreated(Data)
{
	var Div = document.getElementById(Data.ObjectId);
	if (!Div)
	{
		var Main = document.getElementsByTagName("MAIN")[0];
		var Section = document.createElement("SECTION");
		Main.insertBefore(Section, Main.firstChild);
		Section.innerHTML = Data.Html;

		if (!IsLoggedIn())
			RemoveProtectedButtons(Data.ObjectId);

		UpdateLoadMorePostsOffset(1);
	}
}

function PostUpdated(Data)
{
	var Div = document.getElementById("Content" + Data.ObjectId);
	if (Div)
	{
		Div.innerHTML = Data.Html;

		if (!IsLoggedIn())
			RemoveProtectedButtons(Data.ObjectId);

		TimestampUpdated(Data.ObjectId, Data.Updated);
	}
}

function TimestampUpdated(ObjectId, Updated)
{
	var Span = document.getElementById("updated" + ObjectId);
	if (Span)
	{
		Span.innerText = Updated;
		Span.setAttribute("style", "display:inline");
	}
}

function TitleUpdated(NewTitle)
{
	document.title = NewTitle;
}

async function DeletePost(Link)
{
	if ((await Popup.Confirm("Are you sure you want to delete the post?")))
	{
		var Response = await CallServer("/Community/Api/DeletePost.ws", 
			{
				"link": Link
			});

		PostDeleted({ "ObjectId": Response.postId });
	}
}

function PostDeleted(Data)
{
	var Div = document.getElementById(Data.ObjectId);
	if (Div)
	{
		var Section = Div.parentNode;
		Section.parentNode.removeChild(Section);

		UpdateLoadMorePostsOffset(-1);
	}
}

function UpdateLoadMorePostsOffset(Delta)
{
	var Button = document.getElementById("LoadMoreButton");
	if (Button)
	{
		var Script = Button.getAttribute("onclick");
		if (Script.substring(0, 14) === "LoadMore(this,")
		{
			var i = Script.indexOf(",", 14);
			var N = parseInt(Script.substring(14, i));

			if (N + Delta >= 0)
				Button.setAttribute("onclick", "LoadMore(this," + (N + Delta) + Script.substring(i));
		}
	}
}

async function DeleteReply(ObjectId)
{
	if ((await Popup.Confirm("Are you sure you want to delete the reply?")))
	{
		await CallServer("/Community/Api/DeleteReply.ws", 
			{
				"objectId": ObjectId
			});
	}
}

function ReplyDeleted(Data)
{
	var Div = document.getElementById(Data.ObjectId);
	if (Div)
	{
		var Section = Div.parentNode;
		Section.parentNode.removeChild(Section);

		UpdateLoadMoreRepliesOffset(-1, Data);
	}

	var i, c = Data.ParentChain.length;

	for (i = 0; i < c; i++)
		IncNrReplies(Data.ParentChain[i], -1);

	if (Data.PostId)
		IncNrReplies(Data.PostId, -1);
}

function UpdateLoadMoreRepliesOffset(Delta, Data)
{
	var Button = document.getElementById("LoadMoreButton" + Data.ParentId);
	if (!Button)
		Button = document.getElementById("LoadMoreButton");

	if (Button)
	{
		var Script = Button.getAttribute("onclick");
		if (Script.substring(0, 21) === "LoadMoreReplies(this,")
		{
			var i = Script.indexOf(",", 21);
			var N = parseInt(Script.substring(21, i));

			if (N + Delta >= 0)
				Button.setAttribute("onclick", "LoadMoreReplies(this," + (N + Delta) + Script.substring(i));
		}
	}
}

function IncNrReplies(ObjectId, Delta)
{
	var NrReplies = document.getElementById("nrReplies" + ObjectId);
	if (NrReplies)
	{
		var N = parseInt(NrReplies.innerText);
		NrReplies.innerText = (N + Delta).toString();
	}
}

function ReplyCreated(Data)
{
	var Div = document.getElementById(Data.ObjectId);
	if (!Div)
	{
		var i, c = Data.ParentChain.length;

		for (i = 0; i < c; i++)
			IncNrReplies(Data.ParentChain[i], 1);

		if (Data.PostId)
			IncNrReplies(Data.PostId, 1);

		var Parent = document.getElementById("replies" + Data.ParentId);
		if (Parent)
		{
			if (Parent.innerHTML !== "")
			{
				var Fieldset = FindFirstChild(Parent, "FIELDSET");
				Fieldset.className = "responses";

				var Legend = FindFirstChild(Fieldset, "LEGEND");

				if (!Legend.innerText)
					Legend.innerText = "Responses";

				var Section = document.createElement("SECTION");

				if (Legend.nextSibling === null)
					Fieldset.appendChild(Section);
				else
					Fieldset.insertBefore(Section, Legend.nextSibling);

				Section.innerHTML = Data.Html;

				if (!IsLoggedIn())
					RemoveProtectedButtons(Data.ObjectId);

				UpdateLoadMoreRepliesOffset(1, Data);
			}
		}
	}
}

function ReplyUpdated(Data)
{
	var Div = document.getElementById("Content" + Data.ObjectId);
	if (Div)
	{
		Div.innerHTML = Data.Html;

		if (!IsLoggedIn())
			RemoveProtectedButtons(Data.ObjectId);

		TimestampUpdated(Data.ObjectId, Data.Updated);
	}
}

function VotesUpdated(Data)
{
	var NrUp = document.getElementById("up" + Data.ObjectId);
	if (NrUp)
		NrUp.innerText = Data.NrUp.toString();

	var NrDown = document.getElementById("down" + Data.ObjectId);
	if (NrDown)
		NrDown.innerText = Data.NrDown.toString();
}

function TrapCREsc(DefaultButtonId, CancelButtonId, Event)
{
	if (Event.keyCode === 13)
	{
		Event.preventDefault();

		var Button = document.getElementById(DefaultButtonId);

		if (!Button.hasAttribute("disabled"))
			window.setTimeout(Search, 0);
	}
	else if (Event.keyCode === 27)
	{
		Event.preventDefault();
		document.getElementById(CancelButtonId).click();
	}
}

function CheckSearchButton()
{
	window.setTimeout(function ()
	{
		var s = document.getElementById("Query").value.trim();
		var Button = document.getElementById("SearchButton");

		if (s.length > 2)
		{
			Button.removeAttribute("disabled");
			Button.className = "posButton";
		}
		else
		{
			Button.setAttribute("disabled", "disabled");
			Button.className = "disabledButton";
		}
	}, 0);
}

function ClearSearch()
{
	var Query = document.getElementById("Query");

	Query.value = "";
	document.getElementById("Source").value = "Posts";
	document.getElementById("Order").value = "Relevance";
	document.getElementById("Strict").checked = false;

	Query.focus();

	CheckSearchButton();

	var Result = document.getElementById("Result");
	Result.innerHTML = "";
	Result.parentNode.setAttribute("style", "display:none");
}

function Search()
{
	var Result = document.getElementById("Result");
	Result.innerHTML = "";

	DoSearch(
		document.getElementById("Query").value,
		document.getElementById("Source").value,
		document.getElementById("Order").value,
		document.getElementById("Strict").checked,
		0,
		5);
}

async function DoSearch(Query, Source, Order, Strict, Offset, MaxCount)
{
	var Response = await CallServer("/Community/Api/Search.ws", 
		{
			"query": Query,
			"source": Source,
			"order": Order,
			"strict": Strict,
			"offset": Offset,
			"maxCount": MaxCount
		});

	var Button = document.getElementById("LoadMoreButton");
	if (Button)
		Button.parentNode.removeChild(Button);

	var i, c = Response.length;
	var Result = document.getElementById("Result");

	Result.parentNode.setAttribute("style", "");

	for (i = 0; i < c; i++)
	{
		var Item = Response[i];

		if (Item)
		{
			var Section = document.createElement("SECTION");
			Section.innerHTML = Item.html;
			Result.appendChild(Section);
		}
	}

	if (c === MaxCount)
	{
		Button = document.createElement("BUTTON");
		Button.className = "posButton";
		Button.setAttribute("type", "button");
		Button.setAttribute("id", "LoadMoreButton");
		Button.innerText = "Load More";
		Result.appendChild(Button);

		Button.onclick = function ()
		{
			Button.setAttribute("data-scroll", "x");
			DoSearch(Query, Source, Order, Strict, Offset + MaxCount, MaxCount);
		};
	}
}

async function UpdateReferenceLink()
{
	var Response = await CallServer("/Community/Api/ReferenceLink.ws",
		{
			"title": document.getElementById("Title").value
		});

	document.getElementById("ReferenceLink").value = Response.link;
}