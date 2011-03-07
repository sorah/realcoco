map = null;

function streaming_available(n) {
  return $("#streaming_"+n+" object").size() > 0
}

function show_ustream() {
  if(!streaming_available("ustream"))
    return
  $("#streaming_ustream").css("display","block");
  $("#streaming_justin").css("display","none");
  $("#streaming_b_ustream").addClass("button_active");
  $("#streaming_b_justin").removeClass("button_active");
  $("#streaming_b_hide").removeClass("button_active");
}

function show_justin() {
  if(!streaming_available("justin"))
    return
  $("#streaming_justin").css("display","block");
  $("#streaming_ustream").css("display","none");
  $("#streaming_b_justin").addClass("button_active");
  $("#streaming_b_ustream").removeClass("button_active");
  $("#streaming_b_hide").removeClass("button_active");
}
function hide_streaming() {
  $("#streaming_justin").css("display","none");
  $("#streaming_ustream").css("display","none");
  $("#streaming_b_justin").removeClass("button_active");
  $("#streaming_b_ustream").removeClass("button_active");
  $("#streaming_b_hide").addClass("button_active");
}

function get_location() {
  $.ajax({
    url: "/location",
    cache: false,
    dataType: "json",
    success: function(data){
    },
    error: function(error){
    }
  });
}

$(document).ready(function() {
  var coodinate = new google.maps.LatLng(35.681353, 139.767509);
  var options = {
    zoom: 8,
    center: coodinate,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };
  map = new google.maps.Map($("#gmap")[0], options);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push($("#title_bar")[0]);
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push($("#bottom_bar")[0]);

  var flag = false

  if(streaming_available("justin")) {
    show_justin();
    flag = true;
  }

  if(streaming_available("ustream")) {
    show_ustream();
    flag = true;
  }

  if(flag) {
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push($("#streaming")[0]);
    $("#streaming_b_ustream").click(show_ustream);
    $("#streaming_b_justin").click(show_justin);
    $("#streaming_b_hide").click(hide_streaming);
  }
});


