define([
	"dojo/_base/declare" // declare
       ,"dojox/widget/Standby"
       ,"dojo/request"
       ,"ioc/wiki30/Dispatcher"
], function(declare, Standby, request){
    var ret = declare("ioc.wiki30.Request", [], {
        standbyId: null,
        url: null,
        sectoc: null,
        method: "post",
        dispatcher: null,
        sendRequest: function(query){
            if(this.standbyId!==null && !this.standby){
                this.standby = new Standby({target: this.standbyId});
                document.body.appendChild(this.standby.domNode);
                this.standby.startup();
            }
            var standby = this.standby;
            if(this.url==null || this.dispatcher==null){
                return;
            }
            var linkChar = (this.url.indexOf("?") !== -1)?"&":"?";
            var vUrl = this.url;
            if(query!=null){
                vUrl += linkChar+query;
                linkChar="&";
                
            }
            if(this.sectoc!=null){
                vUrl += linkChar+this.sectoc;
            }
            var req = this;
            if(standby){
                standby.show();
            }
            if(this.method==="post"){
                request.post(vUrl, {handleAs: "json"}).then(
                    function(data){
                        req.dispatcher.processResponse(data);                    
                        if(standby){
                            standby.hide();
                        }
                    }, function(error){
                        console.log(error);
                        req.dispatcher.showError(error);
                        if(standby){
                            standby.hide();
                        }
                    }
                );                
            }else{
                request.get(vUrl, {handleAs: "json"}).then(
                    function(data){
                        req.dispatcher.processResponse(data);                    
                        if(standby){
                            standby.hide();
                        }
                    }, function(error){
                        console.log(error);
                        req.dispatcher.showError(error);
                        if(standby){
                            standby.hide();
                        }
                    }
                );                
            }
        }
    });
    return ret;
});
