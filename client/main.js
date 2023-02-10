/* 
  * Fires an API call to the server and adds the reported city as an alien city
  */
function postAlienEncounter() {
    var city = $("#city-post-input").val();

    // Fires an Ajax call to the URL defined in the index.js function file
// All URLs to the Advanced I/O function will be of the pattern: /server/{function_name}/{url_path}
    $.ajax({
        url: "/server/a_city_function/alien", //If your Advanced I/O function is coded in the Java environment, replace the "alien_city_function" with "AlienCityAIO"
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({
            "city_name": city
        }),
        success: function (data) {
            alert(data.message);
        },
        error: function (error) {
            
            alert(error.message);
        }   
    });
}

/**
 * Fires an API call to the server to check whether the given city is alien city or not
 */
function getAlienEncounter() {
    showLoader();
    var positive = "https://media.giphy.com/media/Y1GYiLui9NHcxVKhdo/giphy.gif";
    var negative = "https://media.giphy.com/media/fsPcMdeXPxSP6zKxCA/giphy.gif";
    var city = $("#city-get-input").val();

  // Fires an Ajax call to the URL defined in the index.js function file
 // All URLs to the function will be of the pattern: /server/{function_name}/{url_path}
    $.ajax({
        url: "/server/a_city_function/alien?city_name=" + city, //If your Advanced I/O function is coded in the Java environment, replace the "alien_city_function" with "AlienCityAIO"
        type: "get",
        success: function (data) {
            console.log(data);
            $("#result-text").text("");
            $("#result-text").text(data.message);
            var imagesrc = negative;
            if (data.signal == 'positive') {
                imagesrc = positive;
            }
            $("#result-image").html("");
            $("#result-image").html("<img src='" + imagesrc + "' />");
            hideLoader();
        },
        errror: function (error) {
            alert(error.message);
        }
    });
}

function showLoader()
{
    $("#result-container").hide();
    $("#loader").show();
}

function hideLoader()
{
    $("#loader").hide();
    $("#result-container").show();
}

function showAll(){
    document.getElementById("result-T").innerHTML="";
    document.getElementById("result-T").innerHTML=" <tr><th>S.no</th><th>Infected City</th><th>No.of Reportings </th></tr>"
    $.ajax({
        url:"/server/a_city_function/allcity",
        type:"get",
        success:function(data){
            //console.log("Success data reciv.");
            console.log(data);
            var s=1
            data.citydetails.forEach(element => {
                
                
                document.getElementById("result-T").innerHTML+="<tr><td>"+s+"</td><td>"+element.cityname+"</td><td>"+element.counter+"</td></tr>"
                s+=1

                //$("#result-T").html("<tr><td>"+element.cityname+"</td><td>"+element.counter+"</td></tr>")
                
            });
        },
        error:function(error){
            alert(error);
        }
    })
}


function removeAlienEncounter(){
    var city_name=$("#remove-post-input").val()
    $.ajax({
        url:"/server/a_city_function/remove",
        type:"post",
        contentType: "application/json",
        data: JSON.stringify({
            "city_name": city_name
        }),
        success:function(data){
            alert(data.status);
        },
        errror:function(){
            alert("error");
        }

    });
}

function mailadder(){
    var mail_id=$("#mail-post-input").val();
    console.log(mail_id);
    $.ajax({
        url:"/server/a_city_function/mail_add",
        type:"post",
        contentType: "application/json",
        data: JSON.stringify({
            "mail_id": mail_id
        }),
        success:function(data){
            alert(data.status);
        },
        errror:function(){
            alert("error");
        }

    });
    
}

$(document).ready(function(){
    $("#showalltab").click(function(){
        showAll();
        console.log("Jq call ok");
    })
});