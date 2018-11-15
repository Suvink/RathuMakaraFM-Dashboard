//Main function
//Global Variables
var ispaused;
var songName;
var intervaltime = 10000;

//Refresh data => Ajax async
/*
$(document).ready(function(){
  getMakara();
});
*/

setInterval(function(){
  $.ajax({
    method: "GET",
    url: "http://178.128.222.109:5000/API/bot/get/player/",
    dataType: "json",
    cache: false,
    success: function(jsonReturn){
      var s_name = jsonReturn.now_playing.song;
      var s_thumb = jsonReturn.now_playing.thumbnail;
      var s_requester = jsonReturn.now_playing.requester;
      console.log(s_name,s_thumb);
      console.log(s_requester);
      $("#npName").text(s_name);
      $("#npthumb").attr("src",s_thumb);
      var reqq = "Requested By: " + s_requester;
      $("#npreq").text(reqq);

      //Fetch Queue
      $("#q_np").text(s_name); //nowplaying

      var a = jsonReturn.queue[0];
      $("#s_1").text(a.song);

      var b = jsonReturn.queue[1];
      $("#s_2").text(b.song);

      var c = jsonReturn.queue[2];
      $("#s_3").text(c.song);

      var d = jsonReturn.queue[3];
      $("#s_4").text(d.song);

      $("#s_5").text(s_name);
      $("#s_6").text(s_name);
      $("#s_7").text(s_name);
      $("#s_8").text(s_name);
      $("#s_9").text(s_name);
      $("#s_10").text(s_name);
      $("#s_11").text(s_name);
      $("#s_12").text(s_name);
      $("#s_13").text(s_name);
      $("#s_14").text(s_name);
      $("#s_15").text(s_name);
      $("#s_16").text(s_name);
      $("#s_17").text(s_name);
      $("#s_18").text(s_name);
      $("#s_19").text(s_name);
      $("#s_20").text(s_name);
      $("#q_np").text(s_name);

      





    },
    error: function error(){
      console.log(error);
    }
  });  
},intervaltime);

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