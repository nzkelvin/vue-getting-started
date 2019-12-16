function SearchFound() {
    var width = 960;
    var height = 600;
    var x = parseInt(screen.width / 2.0) - (width / 2.0);
    var y = parseInt(screen.height / 2.0) - (height / 2.0);
    //var vId = Xrm.Page.data.entity.getId().replace('{','').replace('}','');
    //var entityname = Xrm.Page.data.entity.getEntityName();
    var object = new Object();
    object['decription'] = Xrm.Page.getAttribute("ubr_name").getValue();
    object['brand'] = Xrm.Page.getAttribute("ubr_brandname").getValue();
    object['category'] = Xrm.Page.getAttribute("ubr_category").getValue();
    object['color'] = Xrm.Page.getAttribute("ubr_color").getValue();
    object['id'] = Xrm.Page.data.entity.getId().replace('{', '').replace('}', '');
    object['entityname'] = Xrm.Page.data.entity.getEntityName();
    var vurl = Xrm.Page.context.getClientUrl() + "//WebResources/ubr_/Htmls/SearchFound.html?data=" + encodeURI(JSON.stringify(object));//+"&decription="+decription+"&brand="+brand+"&category="+category+"&color="+color;
    //var vurl = Xrm.Page.context.getClientUrl() + "//WebResources/ubr_/Htmls/SearchFound.html?id=" + vId + "&typename=" + entityname+"&data="+decription+"&"+brand+"&"+category+"&"+color;

    //var vurl = Xrm.Page.context.getClientUrl() + "//WebResources/ubr_/Htmls/SearchFound.html?data={'id':'" + vId + "','typename':'" + entityname + "','decription':'" + decription + "','brand':'" + brand + "','category':'" + category + "','color','" + color+"'}";

    if (isIE()) {
        window.showModalDialog(vurl, window, "dialogWidth:" + width + "px; dialogHeight:" + height + "px; dialogLeft:" + x + "px; dialogTop:" + y + "px; status:no; directories:no;scrollbars:no;Resizable=no;");
    }
    else {
        window.open(vurl, "mcePopup", "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=yes,modal=yes,width=" + width + ",height=" + height + ",resizable=no");
    }
}

function CloseLost() {
    Xrm.Utility.confirmDialog("Confirm to close?", function () {
        Xrm.Page.getAttribute("statuscode").setValue(100000000);
        Xrm.Page.data.save();
        Load();
    }, function () {

    });
}

function isIE() {
    return ("ActiveXObject" in window);
}

function Load() {
    var vstatuscode = Xrm.Page.getAttribute("statuscode").getValue();
    if (vstatuscode == 100000000) {
        Xrm.Page.getControl("ubr_dateitemlost").setDisabled(true);
        Xrm.Page.getControl("ubr_attractionid").setDisabled(true);
        Xrm.Page.getControl("ubr_name").setDisabled(true);
        Xrm.Page.getControl("ubr_contactid").setDisabled(true);
        Xrm.Page.getControl("ubr_phonenumber").setDisabled(true);
        Xrm.Page.getControl("ubr_category").setDisabled(true);
        Xrm.Page.getControl("ubr_brandname").setDisabled(true);
        Xrm.Page.getControl("ubr_color").setDisabled(true);
        Xrm.Page.getControl("statuscode").setDisabled(true);
        Xrm.Page.getControl("ownerid").setDisabled(true);
    }

    var clientContext = Xrm.Utility.getGlobalContext().client;

    if (clientContext.getClient() == "Mobile") {
        Xrm.Device.getCurrentPosition().then(function success(location) {
            Xrm.Navigation.openAlertDialog({
                text: "Latitude: " + location.coords.latitude +
                    ", Longitude: " + location.coords.longitude
            });
        });
    }
}

function LoadPhoneNumber() {
    var vcontact = Xrm.Page.getAttribute("ubr_contactid").getValue();
    if (vcontact != null) {
        SDK.JQuery.retrieveRecord(
            vcontact[0].id,
            "Contact",
            "MobilePhone", null,
            function (Cont) {
                if (Cont.MobilePhone != null && Cont.MobilePhone != "null") {
                    Xrm.Page.getAttribute("ubr_phonenumber").setValue(Cont.MobilePhone);
                }
            },
            function () {

            }
        );
    }
}
function CapturePhoto(clientContext) {
    debugger;
    var client = Xrm.Utility.getGlobalContext().client;
    if (client.getClient() == 'Mobile') {
        var imageOptions = {
            allowEdit: true,
            height: 250,
            width: 400,
            preferFrontCamera: true,
            quality: 100
        };

        Xrm.Navigation.openAlertDialog("Before Capture Image");
        Xrm.Device.captureImage(imageOptions).then(
            function success(result) {
                debugger;
                Xrm.Navigation.openAlertDialog("After Capture Image, i.e. Take Photo");
                // perform operations on the captured image
                var entity =
                {
                    "image": result.fileContent,
                    "configure":"{\"side\":\"face\"}"
                }             
                //Xrm.Navigation.openAlertDialog({ text:"into the capture" });
                var req =new XMLHttpRequest();
                req.open("POST", "http://dm-51.data.aliyun.com/rest/160601/ocr/ocr_idcard.json", false);
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.setRequestHeader("Authorization", "APPCODE 9002d8d189c449faaa4948c56352373f");
                Xrm.Navigation.openAlertDialog("Before send a request to Ali API")
                req.send(JSON.stringify(entity));
                if(req.readyState == 4)
                {
                    debugger;
                    Xrm.Navigation.openAlertDialog({ text:'status:'+req.readyState+req.status  });
                    if(req.status == 200)
                    {
                        debugger;
                       var data= JSON.parse(req.responseText);
                       var alertStrings = { confirmButtonLabel: 'Yes', text: 'GovenId:'+data.num};
                       var alertOptions = { height: 120, width: 260 };
       
                       Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                    }
                    else    {
                        Xrm.Navigation.openAlertDialog({ text:req.status+req.message });
                    }
                }
                // Xrm.WebApi.updateRecord("ubr_lost", clientContext.data.entity.getId().replace('{', '').replace('}', ''), data).then(
                //     function success(result) {
                //         var alertStrings = { confirmButtonLabel: 'Yes', text: 'Lost Image updated.' };
                //         var alertOptions = { height: 120, width: 260 };

                //         Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
                //             function success() {
                //                 // perform operations on alert dialog close

                //             },
                //             function (error) {
                //                 console.log(error.message);
                //                 // handle error conditions
                //             }
                //         );
                //     },
                //     function (error) {
                //         Xrm.Utility.alertDialog("Error while updating Account Image : " + error.message, null);
                //         // handle error conditions
                //     }
                // );
            },
            function (error) {
                console.log(error.message);
                // handle error conditions
            }
        );
    }
}