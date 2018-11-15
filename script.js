//Main function
//Refresh data => Ajax async

$(document).ready(function(){
  getMakara();
});

function getMakara(){
  $.ajax({
    method: "GET",
    url: "http://178.128.222.109:5000/API/bot/get/player/",
    dataType: "json",
    success: onSuccess,
    error: onError
  }) 
}

function onSuccess(jsonReturn){
  var s_name = now_playing.song;
  var s_thumb = now_playing.thumbnail;
  var s_requester = now_playing.requester;
  $("#npName").text(s_name);
}

function onError(){
  alert("Error!");
 }






function showDiv(videoinfo){
    keyWordsearch();
    document.getElementById('videoinfo').style.display = 'inline-block';
    
}

function pause() {
  var x = document.getElementById('btn-pause');

  if (x.innerHTML == "PAUSE"){
    x.innerHTML = "PLAY";
  } else {
    x.innerHTML = "PAUSE";
  }
}

function autoplay(){
  var btn_ap = document.getElementById('btn-autoplay');
  $('.btn-autoplay').click(function() {
    if($this.innerHTML("Autoplay Off")){
      btn_ap.innerHTML = "Autoplay On"
    }
  }); 
};


function playnow(){
    $.post("http://178.128.222.109:5000/API/bot/request/", {
      "authToken": "kdjfklsfslkfsd",
      "cmd": "play",
    });
  }
  
  function pausenow(){
    $.post("http://178.128.222.109:5000/API/bot/request/", {
      "authToken": "kdjfklsfslkfsd",
      "cmd": "pause",
    });
  }
  
  function skipnow(){
    $.post("http://178.128.222.109:5000/API/bot/request/",{
      "authToken": "kdjfklsfslkfsd",
      "cmd": "skip",
    })
  }
  
  function volume_low(){
    $.post("http://178.128.222.109:5000/API/bot/request/",{
      "authToken": "kdjfklsfslkfsd",
      "cmd": "volume",
      "args": "5"
    })
  }
  
  function volume_high(){
    $.post("http://178.128.222.109:5000/API/bot/request/",{
      "authToken": "kdjfklsfslkfsd",
      "cmd": "volume",
      "args": "100"
    })
  }

  function custom_vol(){
    var vol = document.getElementById('setvol').value;
    $.post("http://178.128.222.109:5000/API/bot/request/",{
      "authToken": "kdjfklsfslkfsd",
      "cmd": "volume",
      "args": vol
    })
  }
  

  //Youtube Data API v3
var songName;
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


  function addtoqueue(){
    $.post("http://178.128.222.109:5000/API/bot/request/",{
      "authToken": "kdjfklsfslkfsd",
      "cmd": "addToQueue",
      "args":"https://www.youtube.com/watch?v="+vidId,
    })
  }