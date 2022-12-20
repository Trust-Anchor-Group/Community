﻿function TrapTab(Control, Event)
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
            "text": Text
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

    InvalidatePreview();
}

function CreatePost()
{
}
