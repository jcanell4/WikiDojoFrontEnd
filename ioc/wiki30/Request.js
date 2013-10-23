define([
	"dojo/_base/declare" // declare
       ,"dojox/widget/Standby"
       ,"dojo/request"
       ,"ioc/wiki30/Dispatcher"
], function(declare, Standby, request){
    var ret = declare("ioc.wiki30.Request", [], {
        standbyId: null
       ,urlBase: null
       ,method: "post"
       ,dispatcher: null
       ,_standby:null
       ,sectokId: "sectok"
       ,getSectok: function(){
            return this.dispatcher.getSectok();  
       }
       ,responseHandler: function(data){
            this.dispatcher.processResponse(data);                    
            if(this._standby){
                this._standby.hide();
            }           
       }
       ,errorHandler: function(error){
//          console.log(error);
            this.dispatcher.processError(error);
            if(this._standby){
                this._standby.hide();
            }
       }
       ,sendRequest: function(query){
            //run standby resource while ajax response doesn't arribe
            if(this.standbyId!==null && !this._standby){
                this._standby = new Standby({target: this.standbyId});
                document.body.appendChild(this._standby.domNode);
                this._standby.startup();
            }
            /*It sets the Standby object in a variable to be accessible from any site.
             *The private attibute is used to control the construction of the object
             */
            var standby = this._standby;
            
            if(this.urlBase==null || this.dispatcher==null){
                return;
            }
            var linkChar = (this.urlBase.indexOf("?") !== -1)?"&":"?";
            var vUrl = this.urlBase;
            if(query!=null){
                vUrl += linkChar+query;
                linkChar="&";
                
            }
            if(this.getSectok()){
                vUrl += linkChar+this.sectokId+"="+this.getSectok();
            }
            var req = this;
            if(standby){
                standby.show();
            }
            
            if(this.method==="post"){
                var resp =
                request.post(vUrl, {handleAs: "json"}).then(
                    function(data){
                        return req.responseHandler(data);
                    }, function(error){
                        return req.errorHandler(error);
                    }
                );                
            }else{
                var resp =
                request.get(vUrl, {handleAs: "json"}).then(
                    function(data){
                        return req.responseHandler(data);
                    }, function(error){
                        return req.errorHandler(error);
                    }
                );     
            }
        }
    });
    return ret;
});
