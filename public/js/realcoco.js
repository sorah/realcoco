map = null;
icon = null;
images = []
img = new Image();
img.src = "img/arrow.png";

img_size = 50;

function arrow_image(d) {
  if(d == -1) {
    return "img/point.png";
  }
  if(images[d]) {
    return images[d];
  }else{
    var c = document.createElement("canvas");
    c.className = "rimage"
    c.width = img_size;
    c.height = img_size;
    document.body.appendChild(c);
    var x = c.getContext("2d");
    x.save();
    x.translate(c.width/2, c.height/2);
    var r = d/180*Math.PI;
    x.rotate(r);
    x.translate(-img.width/2, -img.height/2);
    x.drawImage(img,0,0);
    x.restore();
    images[d] = c.toDataURL();
    return images[d];
  }
}

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

function get_location(flag) {
  if(flag) {
    var url = "/location/latest"
  } else {
    var url = "/location"
  }
  $.ajax({
    url: url,
    cache: false,
    dataType: "json",
    success: function(data){
      if(data["result"] == "success") {
        var pos = new google.maps.LatLng(data["latitude"],data["longitude"]);
        map.panTo(pos);
        if(data["speed"])
          $("#bottom_bar").text(data["speed"]+" km/h");
        if(data["address"])
          $("#title_bar").text(data["address"]);
        if(icon) icon.setMap(null);
        var icon_img = new google.maps.MarkerImage(arrow_image(data["heading"]))
        icon_img.size = new google.maps.Size(img_size,img_size);
        icon_img.origin = new google.maps.Point(img_size/2,img_size/2);
        icon = new google.maps.Marker({
          position: pos,
          map: map,
          icon: icon_img
        });
      }
      setTimeout(get_location,1);
    },
    error: function(error){
      setTimeout(get_location,1);
    }
  });
}

$(document).ready(function() {
  var coodinate = new google.maps.LatLng(35.681353, 139.767509);
  var options = {
    zoom: 13,
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
  get_location(true);
});


