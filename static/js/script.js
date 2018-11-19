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
let np_hr = 0;
let tot_hr = 0;

//Refresh data => Ajax async
setInterval(function info() {
    $.ajax({
        method: "GET",
        url: "/player_status/",
        dataType: "json",
        cache: false,
        success: function(jsonReturn) {
            if ($("#npName").text() !== jsonReturn.now_playing.song)
                $("#npName").text(jsonReturn.now_playing.song);

            if ($("#npthumb").attr("src") !== jsonReturn.now_playing.thumbnail)
                $("#npthumb").attr("src", jsonReturn.now_playing.thumbnail);

            if ($("#npreq").text() !== jsonReturn.now_playing.requester)
                $("#npreq").text("Requested By: " + jsonReturn.now_playing.requester);

            if(jsonReturn.is_pause && $("#btn-pause").html() !== "Resume"){
                $("#btn-pause").html('Resume');
                $('#btn-pause').attr('class', 'btn btn-warning btn-sm');
            }

            else if (!jsonReturn.is_pause && $("#btn-pause").html() !== "Pause"){
                $("#btn-pause").html('Pause');
                $('#btn-pause').attr('class', 'btn btn-success btn-sm');
            }

            if(jsonReturn.auto_play && $("#btn-pause").html() !== "Disable AutoPlay"){
                $("#btn-autoplay").html('Disable AutoPlay');
                $('#btn-autoplay').attr('class', 'btn btn-indigo btn-sm');
            }
            else if (!jsonReturn.auto_play && $("#btn-pause").html() !== "Enable AutoPlay"){
                $("#btn-autoplay").html('Enable AutoPlay');
                $('#btn-autoplay').attr('class', 'btn btn-unique btn-sm');
            }

            //fetch progress
            const progresspc = ((jsonReturn.now_playing.progress / jsonReturn.now_playing.duration) * 100);
            $("#npprogress").attr("style", "width:" + progresspc + "%");

            //Fetch duration
            const ul = document.getElementById("queuecontent");
            const items = ul.getElementsByTagName("li");

            const tot_durmin = Math.floor(jsonReturn.now_playing.duration / 60);
            const tot_dursec = jsonReturn.now_playing.duration % 60;

            const np_durmin = Math.floor(jsonReturn.now_playing.progress / 60);
            const np_dursec = jsonReturn.now_playing.progress % 60;

            if (np_durmin>60){
                np_hr = Math.floor(np_durmin/60);
                np_durmin = np_durmin%60;
            }
             if (tot_durmin>60){
                 tot_hr = Math.floor(tot_durmin/60);
                 tot_durmin = tot_durmin%60;
             }
             //Post duration to html
             $("#duration").html(np_hr + ":" + np_durmin + ":" + np_dursec + "/" + tot_hr + ":" + tot_durmin + ":" + tot_dursec);
          
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
}, 700);




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
            $("#yt_song_url").val(vidurl);


        })
    })
}
