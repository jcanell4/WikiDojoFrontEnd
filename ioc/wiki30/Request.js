define([
	"dojo/_base/declare" 
	,"dojox/widget/Standby"
	,"dojo/request"
	,"ioc/wiki30/dispatcherSingleton"
], 
function(declare, Standby, request, dispatcherSingleton){
    var ret = declare("ioc.wiki30.Request", [], {
        standbyId: null
       ,urlBase: null
       ,method: "post"
       ,dispatcher: dispatcherSingleton
       ,_standby: null
       ,sectokId: "sectok"
//       ,constructor:function(args){
//           lang.mixin(this, args);
//           this
//       }
       ,hasPostData: function(){
           return  this.getPostData()!=null;
       }
       ,getPostData: function(){
           return null;
       }
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
            
            if(this.urlBase===null || this.dispatcher===null){
                return;
            }
            var linkChar = this.urlBase[this.urlBase.length-1]==="=" ? "" : (this.urlBase.indexOf("?") !== -1) ? "&" : "?";
            var vUrl = this.urlBase;
            if (query !== null){
                vUrl += linkChar+query;
                linkChar = "&";
            }
            var gSect = this.getSectok();
            if(gSect){
                vUrl += linkChar + this.sectokId + "=" + gSect;
            }
            if (standby){
                standby.show();
            }
            
            var req = this;
            var configPost = {handleAs: "json"};
            if(this.method==="post"){
                if(this.hasPostData()){
                    configPost.data = this.getPostData();
                }
                var resp = request.post(vUrl, configPost).then(
						function(data){
							return req.responseHandler(data);
						}, function(error){
							return req.errorHandler(error);
						}
					);                
            }else{
                var resp = request.get(vUrl, configPost).then(
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
