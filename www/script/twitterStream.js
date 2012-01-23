
/************************************************************************************
 *
 * twitterStream object
 *
 * Constructor: userID [, template] ,container [,followLink] [,avatarImage]
 *      Creates a twitterStream object ready to populate the specified container.
 *      userId is the unique identifier for the twitter user.
 *      template (optional) specifies the template to use when rendering the tweets.
 *      container specifies the container in which to render the tweets.
 *      followLink (optional) points to the link that should be set to the user's
 *          profile.
 *      avatarImage (optional) points to the image that should be set to the user's
 *          avatar image.
 *
 * twitterItem ( o ):
 *      Called by loadTwitter() when the json is returned by Twitter. This processes
 *      each entry and uses a template to construct the HTML. Valid placeholders are
 *      %TEXT%, %TIME%.
 *      The first iteration also sets the avatarImage (if defined), and the
 *      followLink (if defined).
 *      When complete, the container's innerHTML is set, the scrollbars are reset,
 *      and the loader is hidden.
 *
 * loadTwitter ( c ):
 *      Starts loading the twitterStream with <c> items. c can be any number from 1
 *      to 200. (Twitter limits the stream to 200.) Once called, it constructs a
 *      json request to Twitter, shows the Loader, and ends. When Twitter returns,
 *      it will call twitterItem () with the results to finish the transaction.
 *      NOTE: If twitter fails to respond in a timely fashion, the loader will
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
 
function twitterStream ( name, userId, template, container, followLink, avatarImage )
{
    this.name = name; // we have to know the name in order to construct the callback
    
    this.twitterUserId = userId;
                        
    this.twitterItemCount = 25;
    
    this.twitterTemplate = template ? template : '%TEXT% (%TIME% ago)<br />';
    
    this.twitterContainer = $(container);
    this.twitterFollowLink = $(followLink);
    this.twitterAvatarImage = $(avatarImage);
    
    this.twitterProfile = 'http://twitter.com/statuses/user_timeline/' + this.twitterUserId;
    this.twitterJSONUri =  this.twitterProfile + '.json?callback=' + this.name + '.twitterItem';
    
    this.twitterItem = function ( o )
    {
        var ihtml = "";
        var item = "";
        for (i=0;i<o.length;i++)
        {
            item = this.twitterTemplate;
            item = item.replace ( "%TEXT%", o[i].text );
            item = item.replace ( "%TIME%", ago(o[i].created_at) );
            
            ihtml = ihtml + item;
            
            // handle our twitter avatar and Follow Link on the first go-thru
            if (i==0)
            {
                if ( this.twitterAvatarImage )
                {
                    this.twitterAvatarImage.src = o[i].user.profile_image_url_https;
                }
                if ( this.twitterFollowLink )
                {
                    this.twitterFollowLink.href = this.twitterProfile;
                }
            }
        }
        
        this.twitterContainer.innerHTML = ihtml;
        resetContentScrollBar();
        hideLoader();
        return false;
    }
    
    this.loadTwitter = function(c)
    {
        showLoader();
        var myJSON = document.createElement ("script");
        myJSON.type = "text/javascript";
        myJSON.src = this.twitterJSONUri + "&count=" + c;
        $("pnlBodyArea").appendChild (myJSON);
        return false;
    }
    
}