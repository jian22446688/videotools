var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;


export default {
    a: function() {
        console.log("D")
    },
    
    b: function () {
        var currentPath = path.resolve(__dirname, './') + '/';
        console.log(currentPath + " aaaa")
    }
    
}