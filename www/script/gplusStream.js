
/************************************************************************************
 *
 * gplusStream object
 *
 * Constructor: userID [, template] ,container [,followLink] [,avatarImage]
 *      Creates a gplusStream object ready to populate the specified container.
 *      userId is the unique identifier for the gplus user.
 *      template (optional) specifies the template to use when rendering the tweets.
 *      container specifies the container in which to render the tweets.
 *      followLink (optional) points to the link that should be set to the user's
 *          profile.
 *      avatarImage (optional) points to the image that should be set to the user's
 *          avatar image.
 *
 * gplusItem ( o ):
 *      Called by loadgplus() when the json is returned by gplus. This processes
 *      each entry and uses a template to construct the HTML. Valid placeholders are
 *      %TEXT%, %TIME%.
 *      The first iteration also sets the avatarImage (if defined), and the
 *      followLink (if defined).
 *      When complete, the container's innerHTML is set, the scrollbars are reset,
 *      and the loader is hidden.
 *
 * loadgplus ( c ):
 *      Starts loading the gplusStream with <c> items. c can be any number from 1
 *      to 200. (gplus limits the stream to 200.) Once called, it constructs a
 *      json request to gplus, shows the Loader, and ends. When gplus returns,
 *      it will call gplusItem () with the results to finish the transaction.
 *      NOTE: If gplus fails to respond in a timely fashion, the loader will
 *      hide automatically.
 *      
 *
 * Copyright 2011 photoKandy Studios LLC
 * Portions used and modified from other sources where noted.
 * ----------------------------------------------------------
 * This code is hereby released under the Creative Commons Share-and-Share-Alike Attribution License v3.
 * This means you can freely use the code in your commercial and non-commercial applications, but you must
 * provide any changes back to the community, and you must indicate that we are the original creators.
 * -------------------------------------------------------------------------------------------------------
 *
 ***********************************************************************************/
 
function gplusStream ( name, userId, template, container, followLink, avatarImage )
{
    this.name = name; // we have to know the name in order to construct the callback
    
    this.gplusUserId = userId;
                        
    this.gplusItemCount = 25;
    
    this.gplusTemplate = template ? template : '%TEXT% %LINK% (%TIME% ago)<br />';
    
    this.gplusContainer = $(container);
    this.gplusFollowLink = $(followLink);
    this.gplusAvatarImage = $(avatarImage);
    
    this.gplusAPIKEY = "AIzaSyC-XAL7H-XxOVjgHhxOSWpZZuNRF9KpFw8";
    
    this.gplusProfile = 'https://plus.google.com/' + this.gplusUserId + '/posts';
    this.gplusJSONUri = 'https://www.googleapis.com/plus/v1/people/' + this.gplusUserId +'/activities/public?key='+this.gplusAPIKEY+'&callback=' + this.name + '.gplusItem';
    
    this.gplusItem = function ( o )
    {
        var ihtml = "";
        var item = "";
        for (i=0;i<o.items.length;i++)
        {
            item = this.gplusTemplate;
            item = item.replace ( "%TITLE%", o.items[i].title ) ;
            item = item.replace ( "%TEXT%", o.items[i].object.content );
            item = item.replace ( "%TIME%", ago(o.items[i].published) );
            item = item.replace ( "%LINK%", o.items[i].object.url );
            
            ihtml = ihtml + item;
            
            // handle our gplus avatar and Follow Link on the first go-thru
            if (i==0)
            {
                if ( this.gplusAvatarImage )
                {
                    this.gplusAvatarImage.src = o.items[i].actor.image.url;
                }
                if ( this.gplusFollowLink )
                {
                    this.gplusFollowLink.href = this.gplusProfile;
                }
            }
        }
        
        this.gplusContainer.innerHTML = ihtml;
        resetContentScrollBar();
        hideLoader();
        return false;
    }
    
    this.loadgplus = function(c)
    {
        showLoader();
        var myJSON = document.createElement ("script");
        myJSON.type = "text/javascript";
        myJSON.src = this.gplusJSONUri + "&maxResults=" + c;
        $("pnlBodyArea").appendChild (myJSON);
        return false;
    }
    
}