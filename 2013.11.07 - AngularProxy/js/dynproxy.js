'use strict';

 angular.module('dynProxy', []);
'use strict';

angular.module('dynProxy')
  .factory('dynamicproxy', ['$injector', 'invocation', function ($injector, invocation) {   
    var interceptors  = [];
    var hooks = [];
    
    function _register() {
      for (var key in arguments) {
        var hook = $injector.get(arguments[key]);        
        hooks.push(hook);   
      }
    }

    function _process(args, offset) {
      for (var key in arguments) {
        var injected = $injector.get(arguments[key]);        
        
        var processors = {
          'hook' : function (item) {

            // add some validation;
            hooks.push(item);   
          },
          'intercept' : function(item) {
            interceptors.push(item)
          }
        };


      } 
    }

    function _create(type) {                  
      var response = {};
      
      

      var object = $injector.get(type);           
      var registredInterceptors = interceptors ;

      for(var hook in hooks) {
        if (hooks[hook].types.indexOf(type) > -1) {
          for(var intercept in hooks[hook].interceptors) {
            registredInterceptors.push($injector.get(hooks[hook].interceptors[intercept]));  
          }          
        };

      }

      for(var propertyName in object) {       
        if (typeof(object[propertyName]) == "function") {
          response[propertyName] = function () {
            var name = propertyName;              
            

            
            
            return function () {                        
              return invocation.create(name, arguments, interceptors ,  object).process();
            }
          }();
        }
      }

      return response;
    }

    return {
      create : _create,
      register : _register
    };
  }]);

'use strict';

angular.module('dynProxy')
  .factory('dynlog', [function() {
    var logs = [];
    return { 
      log : function(value) {
        logs.push(value);
        console.log(value);
      },
      length : function () {
        return logs.length;
      }
    };
  }]);

'use strict';

angular.module('dynProxy')
  .factory('empty',  [function() {        
    return {      
      value : function () { return null; },
      self : function () { return undefined; }
    };
  }]);

'use strict';

angular.module('dynProxy')
  .factory('invocation', [ function() { 
    return {
      create : function (_name, _args, _interceptors , _object) {

        var depth = _interceptors .length;
        var self = undefined;       

        function process() {          
          var intercepter = null
          while (intercepter == null && depth > 0) {
            intercepter = _interceptors [_interceptors .length - depth];
            depth--;
            if (typeof(intercepter.intercept) != "function") {
              intercepter = null;
            }
          }

          if (intercepter != null) {
            var result = intercepter.intercept(self);                               
            return result;
          }
          
          return invoke(); 
        }

        function invoke(name, args) {                           
          return _object[name || _name].apply(_object, args || _args);          
        }

        self =  {
            'name' : _name,
            'args' : _args,           
            'interceptors ' : _interceptors ,             
            'process' : process,
            'invoke' : invoke
          };        

        return self;
      }
    };
  }]);

'use strict';

angular.module('dynProxy')
  .factory('logHook', function () {    
    return {
      types : ['$location'],
      interceptors : ['logIntercept'],
      condition : function () {
          return true;
      }
    };
  });

'use strict';

angular.module('dynProxy')
  .factory('logIntercept', [ 'dynlog', function(dynlog) {
    return {
      intercept: function (invocation) {
        
        dynlog.log('LogIntercept: ' + invocation.name);
        var result = invocation.process();
        dynlog.log('LogIntercept: ' + result);
              
        return result;
      }
    };
  }]);


  