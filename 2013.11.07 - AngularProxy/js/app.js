
(function() {
	var app = angular.module('main', ['dynProxy']);

	app.controller('injection', ['$scope', '$location', function($scope, $location){
		$scope.name = "injection";
		$scope.btnEvent = function(){
			$scope.displayResult = $location.path();
		};
	}]);

	app.controller('proxy', ['$scope', 'dynamicproxy', function($scope, dynamicproxy){
		var $location = dynamicproxy.CreateClassProxy('$location', 'locationIntercept');
		$scope.name = "proxy";
		$scope.btnEvent = function(){
			$scope.displayResult = $location.path();	
		};
	}]);


	app.factory('locationIntercept', [ function() {
	    return {
	      intercept: function (invocation) {

	        var result = invocation.process();
	        if (result == '/step-6') {
	        	return "Tisk Tisk, not on my watch."
	        }
	        return result;
	      }
	    };
	  }]);
}())