/**
 * iCloud Plugin for PhoneGap
 * 
 * @constructor
 */
function ICloudPlugin()
{
    var self = this;

    self.loadFileFromCloud = function ( success, fail, filename )
    {
        var args={};
        args.filename = filename;
        PhoneGap.exec ( success, fail, "ICloudPlugin", "loadFileFromCloud", [args]);
    }
    
    self.saveFileToCloud = function ( success, fail, filename )
    {
        var args={};
        args.filename = filename;
        PhoneGap.exec ( success, fail, "ICloudPlugin", "saveFileToCloud", [args]);
    }

    self.getContent = function ( success, fail )
    {
        PhoneGap.exec ( success, fail, "ICloudPlugin", "getContent", []);
    }

    self.setContent = function ( success, fail, content )
    {
        var args={};
        args.content = content;
        PhoneGap.exec ( success, fail, "ICloudPlugin", "setContent", []);
    }

}

/**
 * Register the plugin with PhoneGap
 */
function installICloudPlugin ()
{
	if(!window.plugins) window.plugins = {};
	window.plugins.ICloudPlugin = new ICloudPlugin();
}

// cloudLocalStorage is an object that simplifies managing localStorage
function cloudLocalStorage ( filename, msgQueue )
{
    var self = this;
    self.filename = filename;
    self.msgQueue = msgQueue;
    self.matchKeys = Array();   // these are localStorage keys that will be sync'd
    
    self.dataCloud = new ICloudPlugin();
    self.msgQCloud = new ICloudPlugin();
    
    self.qcontent = "";
    self.qcontentChanged = false;
    
    self.contentChanged = false;
    
    self.addMatchKey = function ( v )
    {
        self.matchKeys.push ( v );
    }
    
    self.loadFrom = function ()
    {
        self.dataCloud.loadFileFromCloud ( self.contentLoadComplete, self.contentLoadFailure, self.filename );
    }
    
    self.contentLoadFailure = function( o )
    {
        console.log ( "contentLoadFailure: " + o );
    }
    self.queueLoadFailure = function( o )
    {
        console.log ( "queueLoadFailure: " + o );
    }
    
    self.contentLoadComplete = function ( o )
    {
        self.dataCloud.getContent ( self.gotContent, self.contentGetFailure );
    }
    self.queueLoadComplete = function ( o )
    {
        self.dataCloud.getContent ( self.gotQueue, self.queueGetFailure );
    }
    
    self.contentGetFailure = function( o )
    {
        console.log ( "contentGetFailure: " + o );
    }
    self.queueGetFailure = function( o )
    {
        console.log ( "queueGetFailure: " + o );
    }
    
    self.gotContent = function ( d )
    {
        if (consoleLogging) { console.log ("Cloud: reading localStorage"); }
        var ls = d.split("[EOK]");
        for (var i=0;i<ls.length;i++)
        {
            var kv = ls[i].split("[EQ]");
            localStorage.setItem ( kv[0], kv[1] );
        }
        if (consoleLogging) { console.log ("Cloud: Sync read complete."); }
        self.msgQCloud.loadFileFromCloud ( self.queueLoadComplete,   self.queueLoadComplete,  self.msgQueue );

    }
    
    self.gotQueue = function ( d )
    {
        if (consoleLogging) { console.log ("Cloud: reading localStorage message queue"); }
        var ls = d.split("[EOK]");
        for (var i=0;i<ls.length;i++)
        {
            localStorage.removeItem ( ls[i] );
        }
        if (consoleLogging) { console.log ("Cloud: Message Queue read complete."); }

        if (self.saveDelay)
        {
            self.cid = setTimeout ( function() { self.saveTo(); }, self.saveDelay );
        }
    }
    
    self.removedItem = function ( k )
    {
        self.qcontent += k + "[EOK]";
        self.qcontentChanged = true;
    }
    
    self.updatedItem = function ()
    {
        self.contentChanged = true;
    }
    
    self.saveTo = function ()
    {
        if (self.contentChanged || self.qcontentChanged )
        {
            var theContent="";

            for (var i=0; i<localStorage.length; i++)
            {
                var key = localStorage.key(i);
                var value = localStorage[key];
                
                for (var j=0; j<self.matchKeys.length; j++)
                {
                    var re = new RegExp ( self.matchKeys[j], "gi" );
                    if ( key.match ( re ) )
                    {
                        theContent = theContent + key + "[EQ]" + value + "[EOK]";
                    }
                }
            }

            self.dataCloud.setContent ( self.contentSet, self.contentSetFailure, theContent );
        }
        
    }
    
    self.contentSetFailure = function ( o )
    {
        console.log ("contentSetFailure: " + o );
    }
    self.queueSetFailure = function ( o )
    {
        console.log ("queueSetFailure: " + o );
    }
    
    self.contentSet = function ( o )
    {
        self.dataCloud.saveFileToCloud ( self.contentSaveComplete, self.contentSaveFailure, self.filename );
    }
    
    self.queueSet = function ( o )
    {
        self.dataCloud.saveFileToCloud ( self.queueSaveComplete, self.queueSaveFailure, self.msgQueue );
    }
    
    self.contentSaveComplete = function ( o )
    {
        console.log ("localStorage saved to cloud");
        self.contentChanged = false;
        if (self.qcontentChanged)
        {
            self.msgQCloud.setContent ( self.queueSet, self.queueSetFailure, qContent );
        }
    }
    
    self.queueSaveComplete = function ( o )
    {
        console.log ("Queue saved.");
        self.qcontent = "";
        self.qcontentChanged = false;

        if (self.saveDelay)
        {
            self.cid = setTimeout ( function() { self.saveTo(); }, self.saveDelay );
        }
    }
    
    self.contentSaveFailure = function ( o )
    {
        console.log ("contentSaveFailure: " + o );
    }
    
    self.queueSaveFailure = function ( o )
    {
        console.log ("queueSaveFailure: " + o );
    }
    
    self.start = function ( dly )
    {
        self.saveDelay = dly;
        self.loadFrom ();
    }
    self.stop = function ()
    {
        self.saveDelay = 0;
        self.clearTimeout ( self.cid );
    }
}