function TrapTab(Control, Event)
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

	InvalidatePreview();

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
	if (PreviewTimer !== null)
		window.clearTimeout(PreviewTimer);

	PreviewTimer = window.setTimeout(DoPreview, 250);
}

var PreviewTimer = null;

function DoPreview()
{
	var Title = document.getElementById("Title").value;
	var Text = document.getElementById("Text").value;
	var TagEdit = document.getElementById("Tag").value;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (xhttp.readyState === 4)
		{
			if (xhttp.status === 200)
			{
				var Response = JSON.parse(xhttp.responseText);

				var Preview = document.getElementById("Preview");
				Preview.innerHTML = Response.html;

				var ReferenceLink = document.getElementById("ReferenceLink");
				ReferenceLink.value = Response.link;

				var CreateButton = document.getElementById("CreateButton");

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
					ShowTagDropdown(Response.suggestions);
				else
					HideTagDropdown();
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "Api/PreviewPost.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"title": Title,
			"text": Text,
			"tags": GetTags(),
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

function GetTags()
{
	var Tags = document.getElementById("Tags");
	var Loop = Tags.firstChild;
	var Result = [];

	while (Loop)
	{
		if (Loop.tagName === "LI" && Loop.className !== "EndOfTags")
			Result.push(Loop.innerText);

		Loop = Loop.nextSibling;
	}

	var TagInput = document.getElementById("Tag");
	var Tag = TagInput.value;
	if (Tag !== "")
		Result.push(Tag);

	return Result;
}

function AddTag()
{
	var TagsList = document.getElementById("Tags");
	var TagInput = document.getElementById("Tag");
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

	var Tags = GetTags();
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

		InvalidatePreview();
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

	xhttp.open("POST", "Api/CreatePost.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"title": Title,
			"text": Text,
			"link": Link,
			"tags": GetTags()
		}
	));
}

function TrapTagKey(Event)
{
	if (Event.keyCode === 13)
	{
		Event.preventDefault();

		AddTag();
		HideTagDropdown();
	}

	InvalidatePreview();
}

function ShowTagDropdown(Tags)
{
	var Suggestions = document.getElementById("SuggestedTags");
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
			var TagControl = document.getElementById("Tag");

			TagControl.value = this.innerText;

			AddTag();
			HideTagDropdown();
			InvalidatePreview();

			TagControl.focus();
		};

		Suggestions.insertBefore(Li, LastTag);
	}

	if (c > 0)
		Suggestions.className = "Tags withTags";
	else
		Suggestions.className = "Tags noTags";
}

function HideTagDropdown()
{
	var Suggestions = document.getElementById("SuggestedTags");
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

function LoadMore(Control, Offset, N)
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
					Control.setAttribute("onclick", "LoadMore(this," + (Offset + c) + "," + N + ")");
				else
					LastSection.removeChild(Control);
			}
			else
				window.alert(xhttp.responseText);
		}
	};

	xhttp.open("POST", "Api/LoadMore.ws", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send(JSON.stringify(
		{
			"offset": Offset,
			"maxCount": N
		}
	));

}