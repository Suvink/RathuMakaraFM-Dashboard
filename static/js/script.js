//POST ID list
/*
clear queue = #clearq
play/pause button = btn-pause
skip button = btn-skip
volume high button = btn-volume-high
volume low button = btn-volume-low
Autoplay switch = btn-autoplay
custom volume text area = setvol
Add to queue button = btn-addtoqueue
*/

//Global Variables
const interval_time = 500;

//Refresh data => Ajax async
setInterval(function info() {
    $.ajax({
        method: "GET",
        url: "/player_status/",
        dataType: "json",
        cache: false,
        success: function(jsonReturn) {
            $("#npName").text(jsonReturn.now_playing.song);
            $("#npthumb").attr("src", jsonReturn.now_playing.thumbnai);
            $("#npreq").text("Requested By: " + jsonReturn.now_playing.requester;);

            //fetch progress
            const progresspc = ((jsonReturn.now_playing.progress / jsonReturn.now_playing.duration) * 100);
            $("#npprogress").attr("style", "width:" + progresspc + "%";);

            const ul = document.getElementById("queuecontent");
            const items = ul.getElementsByTagName("li");

            if (items.length > jsonReturn.queue.length) {
                for (let i = jsonReturn.queue.length; i < items.length; ++i) {
                    ul.removeChild(items[i])
                }
            }


            for (let i = 0; i < items.length; ++i) {
                const song_number = i + 1;
                const new_innerHTML = '<a href="'+jsonReturn.queue[i].url+'">'+ jsonReturn.queue[i].song + ' <span class="badge badge-danger badge-pill">' + song_number + '</span></a>';
                if(items[i].innerHTML != new_innerHTML){
                    items[i].innerHTML = new_innerHTML;
                }
            }

            for (let i = items.length; i < jsonReturn.queue.length; i++) {
                const li = document.createElement("li");
                const song_number = i + 1;
                li.innerHTML = '<a href="'+jsonReturn.queue[i].url+'">'+ jsonReturn.queue[i].song + ' <span class="badge badge-danger badge-pill">' + song_number + '</span></a>';
                li.setAttribute("class", "list-group-item d-flex justify-content-between align-items-center");
                ul.appendChild(li);
            }



        },
        error: function error() {
            console.log(error);
        }
    });
}, interval_time);




function showDiv(videoinfo) {
    keyWordsearch();
    document.getElementById('videoinfo').style.display = 'inline-block';

}

//Youtube Data API v3

function keyWordsearch() {
    gapi.client.setApiKey('AIzaSyBpkvDP5X_E0D3Jdzq-14SVugYzdaF82AQ');
    gapi.client.load('youtube', 'v3', function() {
        makeRequest();
    });
}

function makeRequest() {
    const q = $('#songname').val();
    const request = gapi.client.youtube.search.list({
        q: q,
        part: 'snippet',
        maxResults: 1
    });
    request.execute(function(response) {
        $('#results').empty()
        const srchItems = response.result.items;
        $.each(srchItems, function(index, item) {
            vidTitle = item.snippet.title;
            vidId = item.id.videoId;
            vidurl = "https://www.youtube.com/watch?v=" + vidId;
            vidDescription = item.snippet.description;
            vidThumburl = item.snippet.thumbnails.medium.url;
            const thumbUrl = vidThumburl;
            $("#ytThumb").attr("src", thumbUrl);
            $("#ytName").text(vidTitle);
            $("#ytDes").text(vidDescription);

        })
    })
}