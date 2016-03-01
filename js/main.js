  	
  	document.getElementById("wind").onclick = function() {
   	//	window.location.reload() 
 	alert("hello");

 	function loadScript(url, completeCallback) {
   var script = document.createElement('script'), done = false,
       head = document.getElementsByTagName("head")[0];
   script.src = url;
   script.onload = script.onreadystatechange = function(){
     if ( !done && (!this.readyState ||
          this.readyState == "loaded" || this.readyState == "complete") ) {
       done = true;
       completeCallback();

      // IE memory leak
      script.onload = script.onreadystatechange = null;
      head.removeChild( script );
    }
  };
  head.appendChild(script);
}
 // 	loadScript("wind.js"); 	

  	loadScript("wind.js",
            function () { alert('jQuery has been loaded.'); });
   		 
   	} 


  /* 	function loadScript(url){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}  */



