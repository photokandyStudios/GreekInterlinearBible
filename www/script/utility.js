// utility functions (not related to ios)
// the ago portion BASED ON
// http://stackoverflow.com/questions/6456856/converting-2011-06-23t1320120000-to-time-ago
function weeksAgo(dt) {
     var diff = Math.floor((new Date() - dt) / 604800000);
     if (diff === 1)       
     {
         return diff + ' week';
     }
     else if (diff > 1 && diff < 52)
     {
         return diff + ' weeks'
     }
     else {
         return ''; // not in range, don't show
     }
 }

function daysAgo(dt) {
     var diff = Math.floor((new Date() - dt) / 86400000);
     if (diff === 1)       
     {
         return diff + ' day';
     }
     else if (diff > 1 && diff < 7)
     {
         return diff + ' days'
     }
     else {
         return ''; // not in range, don't show
     }
 }
 
 function minsAgo(dt) {
     var diff = Math.floor((new Date() - dt) / 60000);
     if (diff === 1)       
     {
         return diff + ' minute';
     }
     else if (diff < 60)
     {
         return diff + ' minutes';
     }
     else
     {
         return ''; // no reason to show more than 60 minutes ago.
     }
 }

 function hoursAgo(dt) {
     var diff = Math.floor((new Date() - dt) / 3600000);
     if (diff === 1)       
     {
         return diff + ' hour';
     }
     else if (diff > 1 && diff < 24)
     {
         return diff + ' hours';
     }
     else
     {
         return ''; // no reason to show more than 24 hours ago.
     }
 }

 function ago ( str )
 {
    
     var dt = new Date(str);
     return '' + weeksAgo (dt) + daysAgo(dt) + hoursAgo(dt) + minsAgo (dt);
 }
