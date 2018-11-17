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
var ispaused;
var songName;
var intervaltime = 500;
var songurl;


//Refresh data => Ajax async
setInterval(function info(){
  $.ajax({
    method: "GET",
    url: "/player_status/",
    dataType: "json",
    cache: false,
    success: function(jsonReturn){
      //fetchdata
      var s_name = jsonReturn.now_playing.song;
      var s_thumb = jsonReturn.now_playing.thumbnail;
      var s_requester = jsonReturn.now_playing.requester;
      //pushdata
      $("#npName").text(s_name);
      $("#npthumb").attr("src",s_thumb);
      var reqq = "Requested By: " + s_requester;
      $("#npreq").text(reqq);

      //fetch progress
      
      var s_duration = jsonReturn.now_playing.duration;
      var s_progress = jsonReturn.now_playing.progress;
      var progresspc = ((s_progress/s_duration) * 100);
      var post = "width:"+progresspc+"%";
//      console.log(progresspc);
      $("#npprogress").attr("style",post);

      var ul = document.getElementById("queuecontent");
      while(ul.firstChild) ul.removeChild(ul.firstChild);

      for (var i = 0; i < jsonReturn.queue.length; i++) {
        var li = document.createElement("li");
//        li.appendChild(document.createTextNode(con));
        li.innerHTML = jsonReturn.queue[i].song+" by "+ jsonReturn.queue[i].uploader + ' <span class="badge badge-danger badge-pill">'+i+'</span>'
        li.setAttribute("id", "s_"+i);
        li.setAttribute("class", "list-group-item d-flex justify-content-between align-items-center");
        ul.appendChild(li);
      }

    },
    error: function error(){
      console.log(error);
    }
  });  
}, intervaltime);




function showDiv(videoinfo){
    keyWordsearch();
    document.getElementById('videoinfo').style.display = 'inline-block';
    
}

//Youtube Data API v3

function keyWordsearch(){
gapi.client.setApiKey('AIzaSyBpkvDP5X_E0D3Jdzq-14SVugYzdaF82AQ');
gapi.client.load('youtube', 'v3', function() {
        makeRequest();
});
}
function makeRequest() {
    var q = $('#songname').val();
    var request = gapi.client.youtube.search.list({
            q: q,
            part: 'snippet',
            maxResults: 1
    });
    request.execute(function(response) {
            $('#results').empty()
            var srchItems = response.result.items;
            $.each(srchItems, function(index, item) {
            vidTitle = item.snippet.title;
            vidId = item.id.videoId;
            vidurl = "https://www.youtube.com/watch?v=" + vidId;
            vidDescription = item.snippet.description;
            vidThumburl =  item.snippet.thumbnails.medium.url;
            var thumbUrl = vidThumburl;
            songName = vidTitle;
            $("#ytThumb").attr("src",thumbUrl);
            $("#ytName").text(songName);
            $("#ytDes").text(vidDescription);

    })
})
}